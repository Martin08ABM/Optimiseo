import { NextRequest, NextResponse } from "next/server";
import { AIProvider, createAIProvider } from "@/src/lib/openrouter/provider";
import { scrapeURL } from "../shared/webSearch";
import { buildPromptWithScrapedData } from "../shared/prompts";
import type { ScrapedContent } from "../shared/types";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { canPerformAnalysis, trackAnalysis } from "@/src/lib/subscription/utils";
import { parseAnalysisResponse } from "@/src/lib/seo/scoreParser";
import { analysisCache } from "@/src/lib/cache/analysis";
import { AnalysisRequestSchema, getValidationErrors } from "@/src/lib/validation/schemas";
import { ErrorTracker, PerformanceTracker } from "@/src/lib/logger/errorTracker";

// Initialize AI provider - Auto-detects between Anthropic direct and OpenRouter
const aiProvider = createAIProvider();

// Function to extract URL from text
function extractURL(text: string): string | null {
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const match = text.match(urlPattern);
  return match ? match[0] : null;
}

export async function POST(request: NextRequest) {
  // 1. Authenticate user
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    ErrorTracker.trackAuthFailure('unknown', 'unauthorized', {
      path: request.url,
      method: request.method,
    });
    
    return NextResponse.json(
      { error: "Unauthorized - Please login to continue" },
      { status: 401 }
    );
  }

  return PerformanceTracker.timeOperation(
    'ai_analysis',
    async () => {
      try {
        // 2. Check subscription limits
        const canAnalyze = await canPerformAnalysis(user.id);

        if (!canAnalyze.allowed) {
          return NextResponse.json(
            {
              error: canAnalyze.reason,
              usage: canAnalyze.usage,
              limitReached: true
            },
            { status: 429 }
          );
        }

        // 3. Validate input with Zod
        const body = await request.json();
        const validation = getValidationErrors(AnalysisRequestSchema, body);
        
        if (!validation.success) {
          ErrorTracker.trackValidationError(validation.errors, body, {
            userId: user.id,
            path: request.url,
          });
          
          return NextResponse.json({ 
            error: "Datos de entrada inválidos", 
            details: validation.errors 
          }, { status: 400 });
        }
        
        const { prompt, context } = validation.data;
        const { selection, targetKeyword, competitorUrls, directText } = context || {};

        // 4. Extract URL for scraping
        const extractedURL = directText ? null : extractURL(prompt);
        
        // 5. Check cache
        const cacheKey = directText 
          ? `direct-${directText.slice(0, 100)}` 
          : (extractedURL || prompt);
        const cachedResult = await analysisCache.get('analysis', cacheKey);
        
        if (cachedResult) {
          return NextResponse.json({
            ...cachedResult,
            cached: true,
            usage: canAnalyze.usage,
          });
        }

        // 6. Scrape URL or use direct text
        let scrapedData: ScrapedContent;
        if (directText) {
          const calculateWordCount = (t: string) => t.trim().split(/\s+/).filter(w => w.length > 0).length;
          const words = directText.toLowerCase().replace(/[^\w\sáéíóúñü]/g, '').split(/\s+/).filter(w => w.length > 3);
          const wordCountMap = new Map<string, number>();
          words.forEach(w => wordCountMap.set(w, (wordCountMap.get(w) || 0) + 1));
          const keywords = Array.from(wordCountMap.entries())
            .map(([word, count]) => ({ word, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

          scrapedData = {
            url: '',
            title: prompt || 'Borrador sin título',
            description: '',
            h1: prompt ? [prompt] : [],
            h2: [],
            h3: [],
            paragraphs: directText.split('\n\n').filter(p => p.trim().length > 0),
            wordCount: calculateWordCount(directText),
            keywords,
            images: [],
            links: [],
            canonical: null,
            ogTags: [],
            twitterTags: [],
            langAttribute: 'es',
            schemaMarkup: false,
            metaRobots: null,
            internalLinks: [],
            externalLinks: []
          };
        } else {
          scrapedData = extractedURL
            ? await scrapeURL(extractedURL)
            : {
                url: '',
                title: '',
                description: '',
                h1: [],
                h2: [],
                h3: [],
                paragraphs: [],
                wordCount: 0,
                keywords: [],
                images: [],
                links: [],
                canonical: null,
                ogTags: [],
                twitterTags: [],
                langAttribute: null,
                schemaMarkup: false,
                metaRobots: null,
                internalLinks: [],
                externalLinks: [],
                error: 'No se encontró una URL válida en el prompt'
              };
        }

        // 6.5. Scrape competitors if provided
        let competitorData: ScrapedContent[] = [];
        if (competitorUrls && competitorUrls.length > 0) {
          const scrapePromises = competitorUrls
            .filter(u => u && u.trim().length > 0)
            .map(u => scrapeURL(u.trim()));
            
          const scrapeResults = await Promise.allSettled(scrapePromises);
          competitorData = scrapeResults
            .filter(r => r.status === 'fulfilled')
            .map(r => (r as PromiseFulfilledResult<ScrapedContent>).value);
        }

        // 7. Build prompt
        const fullPrompt = buildPromptWithScrapedData(
          directText ? 'Borrador de texto' : (extractedURL || prompt),
          scrapedData,
          selection,
          targetKeyword,
          competitorData
        );
        
        // 8. Call AI using OpenRouter (or direct Anthropic)
        const response = await aiProvider.complete({
          messages: [{ role: 'user', content: fullPrompt }],
          maxTokens: 4096,
          temperature: 0.85,
        });

        // 9. Parse response
        const { scores, markdown } = parseAnalysisResponse(response.content);

        // 10. Track usage
        const analysisType = context?.selection || 'readability-analyzer';
        const trackResult = await trackAnalysis(
          user.id,
          extractedURL || 'manual-input',
          analysisType,
        );

        // 11. Get updated usage
        const { getDailyUsage } = await import('@/src/lib/subscription/utils');
        const updatedUsage = await getDailyUsage(user.id);

        // 12. Build result
        const result = {
          message: markdown,
          scores,
          model: response.model,
          provider: 'gemini',
          selection: context?.selection,
          scrapedData,
          usage: updatedUsage,
          analysisId: trackResult.analysisId || null,
          cost: response.cost || 0,
          targetKeyword,
          competitorData,
        };
        
        // 13. Cache result
        await analysisCache.set('analysis', cacheKey, result, { ttl: 86400 });

        return NextResponse.json(result);

      } catch (error) {
        ErrorTracker.trackAnalysisError(error, {
          userId: user.id,
          path: request.url,
          method: request.method,
        });

        const errorMessage = error instanceof Error 
          ? error.message 
          : "Internal server error";

        return NextResponse.json(
          { error: errorMessage },
          { status: 500 }
        );
      }
    },
    { 
      userId: user.id,
      method: request.method,
      path: request.url,
    }
  );
}
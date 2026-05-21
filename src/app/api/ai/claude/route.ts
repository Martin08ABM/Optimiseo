import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@/src/lib/openrouter/provider";
import { scrapeURL } from "../shared/webSearch";
import { buildPromptWithScrapedData } from "../shared/prompts";
import type { ScrapedContent } from "../shared/types";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { canPerformAnalysis, trackAnalysis } from "@/src/lib/subscription/utils";
import { parseAnalysisResponse } from "@/src/lib/seo/scoreParser";
import { analysisCache } from "@/src/lib/cache/analysis";
import { AnalysisRequestSchema, getValidationErrors } from "@/src/lib/validation/schemas";
import { ErrorTracker, PerformanceTracker } from "@/src/lib/logger/errorTracker";

const aiProvider = createAIProvider();

// Función para extraer URL del texto
function extractURL(text: string): string | null {
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const match = text.match(urlPattern);
  return match ? match[0] : null;
}

export async function POST(request: NextRequest) {
  let userId: string | undefined = undefined;
  try {
    // Verificar autenticación
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please login to continue" },
        { status: 401 }
      );
    }

    userId = user.id;

    // Verificar límites de análisis
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

    const body = await request.json();
    
    // Validate request body with Zod
    const validation = getValidationErrors(AnalysisRequestSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Datos de entrada inválidos", 
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    const { prompt, context } = validation.data;
    const { selection, targetKeyword, competitorUrls, directText } = context || {};

    // Extraemos la URL del prompt
    const extractedURL = directText ? null : extractURL(prompt);
    
    // Try to get cached result
    const cacheKey = directText 
      ? `direct-${directText.slice(0, 100)}` 
      : (extractedURL || prompt);
    const cachedResult = await analysisCache.get('analysis', cacheKey);
    
    if (cachedResult) {
      // Return cached result without counting as new analysis
      return NextResponse.json({
        ...cachedResult,
        cached: true,
        usage: canAnalyze.usage, // Use current usage without incrementing
      });
    }

    // Scrapeamos la URL o usamos el texto directo
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

    // Scrapeamos competidores si se proporcionaron
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

    const fullPrompt = buildPromptWithScrapedData(
      directText ? 'Borrador de texto' : (extractedURL || prompt),
      scrapedData,
      selection,
      targetKeyword,
      competitorData
    );
    
    // Llamada al proveedor de IA unificado (auto-detecta Gemini, OpenRouter o Claude)
    const response = await aiProvider.complete({
      messages: [{ role: "user", content: fullPrompt }],
      maxTokens: 4096,
      temperature: 0.85,
    });

    const responseText = response.content || "No response generated";

    // Parsear scores y markdown
    const { scores, markdown } = parseAnalysisResponse(responseText);

    // Trackear el análisis en la base de datos (solo para contar uso)
    const analysisType = context?.selection || 'readability-analyzer';
    const trackResult = await trackAnalysis(
      user.id,
      extractedURL || 'manual-input',
      analysisType,
    );

    // Obtener el uso actualizado después de registrar el análisis
    const { getDailyUsage } = await import('@/src/lib/subscription/utils');
    const updatedUsage = await getDailyUsage(user.id);

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
    
    // Cache the result for 24 hours
    await analysisCache.set('analysis', cacheKey, result, { ttl: 86400 });

    return NextResponse.json(result);

  } catch (error: unknown) {
    ErrorTracker.trackAnalysisError(error, {
      userId,
      path: request.url,
      method: request.method,
    });

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
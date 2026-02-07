import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { scrapeURL } from "../shared/webSearch";
import { buildPromptWithScrapedData } from "../shared/prompts";
import type { ScrapedContent } from "../shared/types";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { canPerformAnalysis, trackAnalysis } from "@/src/lib/subscription/utils";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Función para extraer URL del texto
function extractURL(text: string): string | null {
  const urlPattern = /(https?:\/\/[^\s]+)/gi;
  const match = text.match(urlPattern);
  return match ? match[0] : null;
}

export async function POST(request: NextRequest) {
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

    const { prompt, context } = await request.json();
    
    if (!prompt) {
      return NextResponse.json(
        { error: "Missing prompt" },
        { status: 400 }
      );
    }

    // Extraemos la URL del prompt
    const extractedURL = extractURL(prompt);

    // Scrapeamos la URL si se encontró una válida
    const scrapedData: ScrapedContent = extractedURL
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
          error: 'No se encontró una URL válida en el prompt'
        };

    const fullPrompt = buildPromptWithScrapedData(
      extractedURL || prompt,
      scrapedData,
      context?.selection
    );
    
    // Llamada  a Claude Sonnet 4.5
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      temperature: 0.85,
      messages: [ 
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      tools: [
        {
          "type": "web_search_20250305",
          "name": "web_search",
          "max_uses": 5
        }
      ]
    });

    const responseText = message.content[0]?.type === "text"
      ? message.content[0].text
      : "No response generated";

    // Trackear el análisis en la base de datos
    const analysisType = context?.selection || 'readability-analyzer';
    await trackAnalysis(
      user.id,
      extractedURL || 'manual-input',
      analysisType,
      { response: responseText },
      scrapedData as unknown as Record<string, unknown>
    );

    // Obtener el uso actualizado después de registrar el análisis
    const { getDailyUsage } = await import('@/src/lib/subscription/utils');
    const updatedUsage = await getDailyUsage(user.id);

    return NextResponse.json({
      message: responseText,
      model: "claude-sonnet-4-5",
      provider: "claude",
      selection: context?.selection,
      scrapedData,
      usage: updatedUsage,
    });

  } catch (error: unknown) {
    console.error("Error in Claude API:", error);

    const errorMessage = error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
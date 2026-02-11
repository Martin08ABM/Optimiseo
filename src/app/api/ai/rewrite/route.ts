import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { canPerformAnalysis, trackAnalysis } from "@/src/lib/subscription/utils";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ELEMENT_INSTRUCTIONS: Record<string, string> = {
  'meta-description': 'Máximo 155 caracteres. Incluye un call-to-action y la keyword principal. Debe ser atractiva para aumentar el CTR.',
  'title': 'Máximo 60 caracteres. Coloca la keyword principal al principio. Debe ser atractivo y descriptivo.',
  'h1': 'Debe ser claro, incluir la keyword principal y ser único en la página. Máximo 70 caracteres.',
  'paragraph': 'Mejora la legibilidad, varía el vocabulario, mantén un tono natural y humano. Optimiza para SEO sin que parezca forzado.',
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const canAnalyze = await canPerformAnalysis(user.id);
    if (!canAnalyze.allowed) {
      return NextResponse.json(
        { error: canAnalyze.reason, usage: canAnalyze.usage, limitReached: true },
        { status: 429 }
      );
    }

    const { originalText, elementType, context } = await request.json();

    if (!originalText || !elementType) {
      return NextResponse.json(
        { error: "Missing originalText or elementType" },
        { status: 400 }
      );
    }

    const instructions = ELEMENT_INSTRUCTIONS[elementType] || ELEMENT_INSTRUCTIONS['paragraph'];

    const prompt = `Eres un experto en copywriting SEO. Tu tarea es mejorar el siguiente texto para optimizar su rendimiento SEO manteniendo un tono natural y humano.

Tipo de elemento: ${elementType}
${context?.url ? `URL del sitio: ${context.url}` : ''}
${context?.title ? `Título del sitio: ${context.title}` : ''}

Instrucciones específicas: ${instructions}

Texto original:
"${originalText}"

Responde SOLO con el texto mejorado, sin explicaciones adicionales, sin comillas, sin prefijos.`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: "user", content: prompt }],
    });

    const improved = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map(block => block.text)
      .join("") || originalText;

    // Track as rewrite (counts 0.5x)
    await trackAnalysis(user.id, context?.url || 'rewrite', 'rewrite');

    const { getDailyUsage } = await import('@/src/lib/subscription/utils');
    const updatedUsage = await getDailyUsage(user.id);

    return NextResponse.json({
      original: originalText,
      improved: improved.trim(),
      elementType,
      usage: updatedUsage,
    });
  } catch (error: unknown) {
    console.error("Error in rewrite API:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

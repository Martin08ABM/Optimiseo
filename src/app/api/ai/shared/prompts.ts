import type { ScrapedContent } from './types';

export function getSystemPrompt(selection?: string): string {
  return `Eres un experto en SEO y análisis web. Tu tarea es analizar URLs y proporcionar recomendaciones específicas.

Tipo de análisis solicitado: ${selection || "general"}

Instrucciones según el tipo:
- readability-analyzer: Analiza la legibilidad del contenido, estructura de párrafos, uso de encabezados, y facilidad de lectura. Proporciona métricas específicas y sugerencias concretas.
- words-repetition: Identifica palabras clave repetidas excesivamente y sugiere sinónimos o variaciones. Calcula la densidad de palabras clave.
- coherency-evaluator: Evalúa la coherencia del contenido, flujo lógico, y conexión entre secciones. Analiza la estructura narrativa.
- keyword-suggestions: Utiliza tu capacidad de búsqueda web para encontrar keywords relacionadas con el contenido de la URL. Proporciona: keywords primarias, variaciones long-tail, keywords semánticas relacionadas. Para cada keyword indica el nivel de competencia estimado (alta/media/baja). Estructura tu respuesta en secciones claras con tablas markdown.

Vas a dar las respuestas centradas en el contenido, las imágenes que contenga y el contexto del sitio web, de la industria que se centra y sobre como escribe la persona inicialmente. No debes de dar respuestas sobre detalles técnicos.

IMPORTANTE: Tu respuesta DEBE comenzar con un bloque de puntuaciones SEO usando este formato exacto (reemplaza los números con tu evaluación de 0 a 100):

<!--SCORES{"scores":{"overall":75,"categories":{"contenido":80,"legibilidad":70,"keywords":65,"estructura":85,"metaTags":60}}}SCORES-->

Después del bloque de puntuaciones, proporciona tu análisis detallado en markdown.

Proporciona un análisis detallado, específico y accionable. Usa los datos scrapeados de la URL para hacer recomendaciones precisas.`;
}

export function buildPromptWithScrapedData(
  url: string,
  scrapedData: ScrapedContent,
  selection?: string
): string {
  const systemPrompt = getSystemPrompt(selection);

  const dataContext = scrapedData.error
    ? `\n\nNOTA: No se pudo acceder al contenido de la URL (${scrapedData.error}). Proporciona recomendaciones generales de SEO.`
    : `\n\nDatos extraídos de la URL:
- Título: ${scrapedData.title || 'No disponible'}
- Meta Description: ${scrapedData.description || 'No disponible'}
- H1: ${scrapedData.h1?.join(', ') || 'No disponible'}
- H2: ${scrapedData.h2?.slice(0, 5).join(', ') || 'No disponible'}
- Número de palabras: ${scrapedData.wordCount || 0}
- Palabras clave principales: ${scrapedData.keywords?.slice(0, 10).map(k => `${k.word} (${k.count})`).join(', ') || 'No disponible'}
- Número de imágenes: ${scrapedData.images?.length || 0}
- Número de enlaces: ${scrapedData.links?.length || 0}
- Canonical: ${scrapedData.canonical || 'No definido'}
- Open Graph: ${scrapedData.ogTags?.map(t => `${t.property}: ${t.content}`).join(', ') || 'No definido'}
- Idioma (lang): ${scrapedData.langAttribute || 'No definido'}
- Schema/JSON-LD: ${scrapedData.schemaMarkup ? 'Sí' : 'No'}
- Enlaces internos: ${scrapedData.internalLinks?.length || 0}
- Enlaces externos: ${scrapedData.externalLinks?.length || 0}`;

  return `${systemPrompt}${dataContext}\n\nURL a analizar: ${url}`;
}

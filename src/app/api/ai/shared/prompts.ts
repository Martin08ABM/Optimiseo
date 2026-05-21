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
  urlOrText: string,
  scrapedData: ScrapedContent,
  selection?: string,
  targetKeyword?: string,
  competitorData?: ScrapedContent[]
): string {
  const systemPrompt = getSystemPrompt(selection);
  const isDirectText = !scrapedData.url;

  let dataContext = '';
  if (isDirectText) {
    dataContext = `\n\nDatos del texto directo proporcionado por el usuario:
- Título: ${scrapedData.title || 'No especificado'}
- Meta Description: ${scrapedData.description || 'No especificada'}
- H1: ${scrapedData.h1?.join(', ') || 'No especificado'}
- H2 (primeros 5): ${scrapedData.h2?.slice(0, 5).join(', ') || 'No especificados'}
- Número de palabras: ${scrapedData.wordCount || 0}
- Palabras clave principales: ${scrapedData.keywords?.slice(0, 10).map(k => `${k.word} (${k.count})`).join(', ') || 'No disponible'}
- Número de imágenes en el borrador: ${scrapedData.images?.length || 0}
- Contenido del borrador a analizar:
"${scrapedData.paragraphs?.join('\n\n') || ''}"`;
  } else if (scrapedData.error) {
    dataContext = `\n\nNOTA: No se pudo acceder al contenido de la URL (${scrapedData.error}). Proporciona recomendaciones generales de SEO.`;
  } else {
    dataContext = `\n\nDatos extraídos de la URL:
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
  }

  if (targetKeyword) {
    dataContext += `\n\nPalabra clave objetivo (Target Keyword) definida: "${targetKeyword}"`;
  }

  if (competitorData && competitorData.length > 0) {
    dataContext += `\n\nDATOS DE COMPETIDORES PARA AUDITORÍA COMPARATIVA (SERP):`;
    competitorData.forEach((comp, idx) => {
      dataContext += `\nCompetidor ${idx + 1} (${comp.url}):
- Título: ${comp.title || 'No disponible'}
- Meta Description: ${comp.description || 'No disponible'}
- H1: ${comp.h1?.join(', ') || 'No disponible'}
- H2 (primeros 5): ${comp.h2?.slice(0, 5).join(', ') || 'No disponible'}
- Número de palabras: ${comp.wordCount || 0}
- Número de imágenes: ${comp.images?.length || 0}
- Número de enlaces: ${comp.links?.length || 0}
- Schema/JSON-LD: ${comp.schemaMarkup ? 'Sí' : 'No'}`;
    });

    dataContext += `\n\nINSTRUCCIÓN ADICIONAL PARA AUDITORÍA COMPARATIVA:
Compara el sitio del usuario con los competidores provistos.
Indica claramente en una tabla Markdown las brechas (Word count, imágenes, uso de H2/H3, etc.) y da consejos estratégicos específicos sobre qué debe añadir o modificar el usuario para superarlos en el ranking.`;
  }

  return `${systemPrompt}${dataContext}\n\n${isDirectText ? 'Texto directo' : 'URL a analizar'}: ${urlOrText}`;
}

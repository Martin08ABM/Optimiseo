export interface SEOScores {
  overall: number;
  categories: {
    contenido: number;
    legibilidad: number;
    keywords: number;
    estructura: number;
    metaTags: number;
  };
}

export interface ParsedAnalysisResponse {
  scores: SEOScores | null;
  markdown: string;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function isValidScores(obj: unknown): obj is SEOScores {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  if (typeof s.overall !== 'number') return false;
  if (!s.categories || typeof s.categories !== 'object') return false;
  const cats = s.categories as Record<string, unknown>;
  const required = ['contenido', 'legibilidad', 'keywords', 'estructura', 'metaTags'];
  return required.every(key => typeof cats[key] === 'number');
}

export function parseAnalysisResponse(rawResponse: string): ParsedAnalysisResponse {
  // Look for <!--SCORES{...}SCORES--> delimiter
  const pattern = /<!--SCORES(\{[\s\S]*?\})SCORES-->/;
  const match = rawResponse.match(pattern);

  if (!match) {
    return { scores: null, markdown: rawResponse };
  }

  try {
    const parsed = JSON.parse(match[1]);
    const scoresObj = parsed.scores || parsed;

    if (!isValidScores(scoresObj)) {
      return { scores: null, markdown: rawResponse };
    }

    const scores: SEOScores = {
      overall: clamp(scoresObj.overall),
      categories: {
        contenido: clamp(scoresObj.categories.contenido),
        legibilidad: clamp(scoresObj.categories.legibilidad),
        keywords: clamp(scoresObj.categories.keywords),
        estructura: clamp(scoresObj.categories.estructura),
        metaTags: clamp(scoresObj.categories.metaTags),
      },
    };

    // Remove the scores block from the markdown
    const markdown = rawResponse.replace(pattern, '').trim();

    return { scores, markdown };
  } catch {
    return { scores: null, markdown: rawResponse };
  }
}

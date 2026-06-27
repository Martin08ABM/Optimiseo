// Configuración exclusiva de modelos y precios de Google Gemini para OptimiSEO

export const MODELS = {
  google: {
    'gemini-2.5-flash': 'gemini-2.5-flash',
    'gemini-2.5-pro': 'gemini-2.5-pro',
    'gemini-1.5-flash': 'gemini-1.5-flash',
    'gemini-1.5-pro': 'gemini-1.5-pro',
  },
};

// Tarifas de Google Gemini por 1M de tokens (input / output)
export const MODEL_PRICING = {
  'gemini-2.5-flash': { input: 0.075, output: 0.3 },
  'gemini-2.5-pro': { input: 1.25, output: 5.0 },
  'gemini-1.5-flash': { input: 0.075, output: 0.3 },
  'gemini-1.5-pro': { input: 1.25, output: 5.0 },
};

// Retorna el mejor modelo disponible de Gemini
export function getOptimalModel(
  preferredModel?: string
): string {
  if (preferredModel && preferredModel in MODELS.google) {
    return preferredModel;
  }
  return 'gemini-2.5-flash';
}

// Estima el costo de la petición en dólares USD
export function estimateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  let cleanModel = model;
  if (model.startsWith('google/')) {
    cleanModel = model.replace('google/', '');
  }
  
  const pricing = MODEL_PRICING[cleanModel as keyof typeof MODEL_PRICING];
  if (!pricing) return 0;
  
  return (inputTokens * pricing.input + outputTokens * pricing.output) / 1000000;
}
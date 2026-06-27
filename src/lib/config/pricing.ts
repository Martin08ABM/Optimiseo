export const PRO_PRICE_MONTHLY = 12;
export const FREE_PRICE_MONTHLY = 0;

export const FREE_PLAN = {
  id: 'free' as const,
  name: 'Plan Free',
  price: FREE_PRICE_MONTHLY,
  description: 'Perfecto para empezar con análisis SEO básicos',
  features: [
    '5 análisis SEO diarios',
    'Análisis de legibilidad',
    'Análisis de repetición de palabras',
    'Evaluación de coherencia',
    'Soporte por email',
  ],
  highlighted: false,
};

export const PRO_PLAN = {
  id: 'pro' as const,
  name: 'Plan Pro',
  price: PRO_PRICE_MONTHLY,
  description: 'Para profesionales que necesitan análisis ilimitados',
  features: [
    '100 análisis SEO diarios',
    'Todos los tipos de análisis',
    'Historial de análisis (30 días)',
    'Comparación de revisiones',
    'Exportación de resultados (PDF/JSON)',
    'Soporte prioritario',
    'Acceso anticipado a nuevas funciones',
  ],
  highlighted: true,
};

export const PLANS = [FREE_PLAN, PRO_PLAN];

export function getPlanById(id: string) {
  return PLANS.find((p) => p.id === id) ?? FREE_PLAN;
}

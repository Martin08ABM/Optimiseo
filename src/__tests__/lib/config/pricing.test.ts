import { describe, it, expect } from 'vitest';
import { PRO_PRICE_MONTHLY, FREE_PRICE_MONTHLY, PRO_PLAN, PLANS, getPlanById } from '@/src/lib/config/pricing';

describe('pricing config', () => {
  it('define PRO_PRICE_MONTHLY = 12 (single source of truth)', () => {
    expect(PRO_PRICE_MONTHLY).toBe(12);
  });

  it('FREE_PRICE_MONTHLY = 0', () => {
    expect(FREE_PRICE_MONTHLY).toBe(0);
  });

  it('PLANS contiene free y pro con highlighted coherente', () => {
    const ids = PLANS.map((p) => p.id);
    expect(ids).toEqual(['free', 'pro']);
    expect(PLANS.find((p) => p.id === 'pro')?.highlighted).toBe(true);
    expect(PLANS.find((p) => p.id === 'free')?.highlighted).toBe(false);
  });

  it('getPlanById devuelve el plan correcto y cae a free si no existe', () => {
    expect(getPlanById('pro').id).toBe('pro');
    expect(getPlanById('inexistente').id).toBe('free');
  });

  it('PRO_PLAN incluye las features clave de marketing', () => {
    const features = PRO_PLAN.features.join(' ');
    expect(features).toContain('100 análisis');
    expect(features).toContain('Historial');
    expect(features).toContain('Comparación');
    expect(features).toContain('Exportación');
  });
});

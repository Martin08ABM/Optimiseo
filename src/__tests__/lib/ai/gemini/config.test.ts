import { describe, it, expect } from 'vitest';
import { MODELS, MODEL_PRICING, getOptimalModel, estimateCost } from '@/src/lib/ai/gemini/config';

describe('MODELS', () => {
  it('expone los modelos de Gemini soportados', () => {
    expect(MODELS.google['gemini-2.5-flash']).toBe('gemini-2.5-flash');
    expect(MODELS.google['gemini-2.5-pro']).toBe('gemini-2.5-pro');
  });
});

describe('MODEL_PRICING', () => {
  it('define tarifas de input/output por 1M de tokens', () => {
    expect(MODEL_PRICING['gemini-2.5-flash'].input).toBe(0.075);
    expect(MODEL_PRICING['gemini-2.5-flash'].output).toBe(0.3);
  });
});

describe('getOptimalModel', () => {
  it('devuelve el modelo preferido cuando está soportado', () => {
    expect(getOptimalModel('gemini-2.5-pro')).toBe('gemini-2.5-pro');
  });

  it('cae a gemini-2.5-flash cuando el preferido no está soportado', () => {
    expect(getOptimalModel('gpt-4')).toBe('gemini-2.5-flash');
  });

  it('cae a gemini-2.5-flash cuando no se indica preferencia', () => {
    expect(getOptimalModel(undefined)).toBe('gemini-2.5-flash');
  });
});

describe('estimateCost', () => {
  it('calcula el coste en dólares a partir de tokens de input y output', () => {
    // 1M input * 0.075 + 1M output * 0.3 = 0.375
    expect(estimateCost('gemini-2.5-flash', 1_000_000, 1_000_000)).toBeCloseTo(0.375, 6);
  });

  it('devuelve 0 para modelos desconocidos', () => {
    expect(estimateCost('desconocido', 1000, 1000)).toBe(0);
  });

  it('normaliza el prefijo google/ antes de buscar la tarifa', () => {
    expect(estimateCost('google/gemini-2.5-flash', 1_000_000, 0)).toBeCloseTo(0.075, 6);
  });
});

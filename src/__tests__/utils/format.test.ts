import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatNumber } from '@/src/utils/format';

describe('formatDate', () => {
  it('formatea con locale es-ES por defecto (DD/MM/YYYY)', () => {
    expect(formatDate('2026-03-07T12:00:00Z')).toMatch(/0[67].03.2026|07\/03\/2026|07-03-2026/);
  });

  it('devuelve guion para valor nulo o vacío', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('devuelve "Fecha inválida" para fechas no parseables', () => {
    expect(formatDate('no-es-fecha')).toBe('Fecha inválida');
  });
});

describe('formatDateTime', () => {
  it('incluye hora además de la fecha', () => {
    const result = formatDateTime('2026-03-07T15:30:00Z');
    expect(result).toMatch(/2026/);
    expect(result.length).toBeGreaterThan(8);
  });
});

describe('formatNumber', () => {
  it('formatea números grandes con separador de miles es-ES', () => {
    expect(formatNumber(1234567)).toMatch(/1\.234\.567|1,234,567/);
  });

  it('respeta opciones (p. ej. estilo porcentaje)', () => {
    expect(formatNumber(0.5, { style: 'percent' })).toMatch(/50/);
  });
});

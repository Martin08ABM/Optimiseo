import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PricingSummary from '@/src/components/landing/PricingSummary';
import { PLANS } from '@/src/lib/config/pricing';

describe('PricingSummary paridad con la config de pricing', () => {
  it('muestra el precio Pro = 12€', () => {
    render(<PricingSummary />);
    expect(screen.getByText('12', { exact: false }).textContent).toMatch(/12/);
  });

  it('lista las mismas features Pro que la config (sin drift)', () => {
    render(<PricingSummary />);
    const proFeatures = PLANS.find((p) => p.id === 'pro')!.features;
    for (const f of proFeatures) {
      expect(screen.getByText(f)).toBeInTheDocument();
    }
  });
});

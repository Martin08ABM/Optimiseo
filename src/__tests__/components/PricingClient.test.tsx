import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/src/components/ui/Toast';

const mockFetch = vi.fn();
beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

function renderPricingClient(props: Partial<React.ComponentProps<typeof PricingClient>> = {}) {
  return render(
    <ToastProvider>
      <PricingClient
        planId="pro"
        planName="Pro"
        planPrice={12}
        isAuthenticated={true}
        currentPlanId="free"
        isHighlighted={true}
        {...props}
      />
    </ToastProvider>
  );
}

import PricingClient from '@/src/app/pricing/PricingClient';

describe('PricingClient — upgrade con error', () => {
  it('muestra un toast al usuario cuando checkout falla', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ error: 'Stripe no disponible' }) });
    renderPricingClient();

    fireEvent.click(screen.getByRole('button', { name: /Mejorar a Pro/i }));

    await waitFor(() => {
      const toasts = screen.getAllByRole('status');
      expect(toasts.some((t) => /Stripe no disponible/i.test(t.textContent ?? ''))).toBe(true);
    });
  });

  it('muestra toast de conexión cuando fetch rechaza', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));
    renderPricingClient();

    fireEvent.click(screen.getByRole('button', { name: /Mejorar a Pro/i }));

    await waitFor(() => {
      const toasts = screen.getAllByRole('status');
      expect(toasts.some((t) => /Error de conexión/i.test(t.textContent ?? ''))).toBe(true);
    });
  });
});

describe('PricingClient — gestionar suscripción con error', () => {
  it('muestra toast cuando el portal falla', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ error: 'no portal' }) });
    renderPricingClient({ currentPlanId: 'pro', planId: 'free' });

    fireEvent.click(screen.getByRole('button', { name: /Gestionar suscripción/i }));

    await waitFor(() => {
      const toasts = screen.getAllByRole('status');
      expect(toasts.some((t) => /no portal/i.test(t.textContent ?? ''))).toBe(true);
    });
  });
});

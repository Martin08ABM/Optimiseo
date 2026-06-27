import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockFetch = vi.fn();
beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal('fetch', mockFetch);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderMetrics(isPro = true) {
  const { default: DashboardMetrics } = await import('@/src/components/dashboard/DashboardMetrics');
  return render(<DashboardMetrics isPro={isPro} />);
}

describe('DashboardMetrics', () => {
  it('muestra estado de carga con role=status', async () => {
    mockFetch.mockReturnValue(new Promise(() => {}));
    await renderMetrics();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('muestra error con botón reintentar cuando fetch falla', async () => {
    mockFetch.mockRejectedValueOnce(new Error('fallo de red'));
    await renderMetrics();

    const alert = await waitFor(() => screen.getByRole('alert'));
    expect(alert.textContent).toMatch(/fallo de red|Error al cargar las métricas/i);
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('al reintentar vuelve a llamar al endpoint', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network'));
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ byDate: [{ date: '2026-01-01', count: 1 }], byType: [], topUrls: [] }),
    });
    await renderMetrics();

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }));
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });

  it('free tier usa <Link> a /pricing (no <a>)', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ byDate: [{ date: '2026-01-01', count: 1 }], byType: [{ type: 'rewrite', count: 1 }], topUrls: [] }),
    });
    await renderMetrics(false);

    await waitFor(() => expect(screen.getByText('Métricas avanzadas')).toBeInTheDocument());
    const link = screen.getByRole('link', { name: /Mejorar a Pro/i });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '/pricing');
  });
});

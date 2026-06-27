import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ToastProvider } from '@/src/components/ui/Toast';

vi.mock('@/src/components/Hero/HeroForm', () => ({
  HeroForm: ({ onSubmit }: { onSubmit: (data: unknown) => void }) => (
    <button onClick={() => onSubmit({ url: 'https://example.com', analysisType: 'readability-analyzer' })}>
      analizar
    </button>
  ),
}));

vi.mock('@/src/components/Hero/HeroResults', () => ({
  HeroResults: ({ onSave, onMonitor, saving, monitoring }: { onSave: () => void; onMonitor: () => void; saving?: boolean; monitoring?: boolean }) => (
    <div>
      <button onClick={onSave}>guardar</button>
      <button onClick={onMonitor}>monitorizar</button>
      <span data-testid="saving">{String(saving)}</span>
      <span data-testid="monitoring">{String(monitoring)}</span>
    </div>
  ),
}));

vi.mock('@/src/components/AnalysisProgress', () => ({
  AnalysisProgress: () => <div>progress</div>,
}));

vi.mock('@/src/components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const analyzeFetch = vi.fn();
const saveFetch = vi.fn();
const monitorFetch = vi.fn();

beforeEach(() => {
  analyzeFetch.mockReset();
  saveFetch.mockReset();
  monitorFetch.mockReset();
  analyzeFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      selection: 'readability-analyzer',
      provider: 'gemini',
      message: '# Análisis',
      analysisId: 'a-1',
      scrapedData: { url: 'https://example.com' },
      scores: { overall: 80 },
      usage: { used: 1, limit: 10, remaining: 9 },
    }),
  });
  saveFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
  monitorFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string, opts?: RequestInit) => {
      if (url === '/api/ai/analyze') return analyzeFetch(url, opts);
      if (url === '/api/analyses/save') return saveFetch(url, opts);
      if (url === '/api/monitoring') return monitorFetch(url, opts);
      return Promise.reject(new Error(`unexpected fetch ${url}`));
    })
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

async function renderAnalyzer() {
  const { default: HeroAnalyzer } = await import('@/src/components/Hero/HeroAnalyzer');
  return render(
    <ToastProvider>
      <HeroAnalyzer isAuthenticated={true} usage={{ used: 0, limit: 10, remaining: 10 }} isPro={true} />
    </ToastProvider>
  );
}

describe('HeroAnalyzer — Guardar/Monitorizar', () => {
  it('persiste el análisis llamando a /api/analyses/save (no es no-op)', async () => {
    await renderAnalyzer();
    fireEvent.click(screen.getByText('analizar'));
    await waitFor(() => expect(screen.getByText('guardar')).toBeInTheDocument());

    fireEvent.click(screen.getByText('guardar'));

    await waitFor(() => expect(saveFetch).toHaveBeenCalledOnce());
    const opts = saveFetch.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(opts.body as string);
    expect(body.analysisId).toBe('a-1');
  });

  it('monitoriza llamando a /api/monitoring con la url del análisis', async () => {
    await renderAnalyzer();
    fireEvent.click(screen.getByText('analizar'));
    await waitFor(() => expect(screen.getByText('monitorizar')).toBeInTheDocument());

    fireEvent.click(screen.getByText('monitorizar'));

    await waitFor(() => expect(monitorFetch).toHaveBeenCalledOnce());
    const opts = monitorFetch.mock.calls[0][1] as RequestInit;
    const body = JSON.parse(opts.body as string);
    expect(body.url).toBe('https://example.com');
  });

  it('muestra estado de carga mientras guarda', async () => {
    let resolveSave!: () => void;
    saveFetch.mockReturnValueOnce(new Promise((r) => (resolveSave = () => r({ ok: true, json: async () => ({}) }))));
    await renderAnalyzer();
    fireEvent.click(screen.getByText('analizar'));
    await waitFor(() => expect(screen.getByText('guardar')).toBeInTheDocument());

    fireEvent.click(screen.getByText('guardar'));
    await waitFor(() => expect(screen.getByTestId('saving').textContent).toBe('true'));
    resolveSave();
    await waitFor(() => expect(screen.getByTestId('saving').textContent).toBe('false'));
  });
});

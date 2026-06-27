import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

const mockGetUser = vi.fn();
const mockSupabaseFrom = vi.fn();
vi.mock('@/src/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockSupabaseFrom,
  })),
}));

const mockCanPerformAnalysis = vi.fn();
const mockTrackAnalysis = vi.fn();
const mockGetDailyUsage = vi.fn();
vi.mock('@/src/lib/subscription/utils', () => ({
  canPerformAnalysis: (...args: unknown[]) => mockCanPerformAnalysis(...args),
  trackAnalysis: (...args: unknown[]) => mockTrackAnalysis(...args),
  getDailyUsage: (...args: unknown[]) => mockGetDailyUsage(...args),
}));

const mockComplete = vi.fn();
vi.mock('@/src/lib/ai/gemini/provider', () => ({
  AIProvider: vi.fn(),
  createAIProvider: vi.fn(() => ({ complete: mockComplete })),
}));

const mockScrapeURL = vi.fn();
vi.mock('@/src/app/api/ai/shared/webSearch', () => ({
  scrapeURL: (...args: unknown[]) => mockScrapeURL(...args),
}));

const mockBuildPrompt = vi.fn();
vi.mock('@/src/app/api/ai/shared/prompts', () => ({
  buildPromptWithScrapedData: (...args: unknown[]) => mockBuildPrompt(...args),
}));

const mockParseAnalysis = vi.fn();
vi.mock('@/src/lib/seo/scoreParser', () => ({
  parseAnalysisResponse: (...args: unknown[]) => mockParseAnalysis(...args),
}));

const mockCacheGet = vi.fn();
const mockCacheSet = vi.fn();
vi.mock('@/src/lib/cache/analysis', () => ({
  analysisCache: {
    get: (...args: unknown[]) => mockCacheGet(...args),
    set: (...args: unknown[]) => mockCacheSet(...args),
  },
}));

vi.mock('@/src/lib/logger/errorTracker', () => ({
  ErrorTracker: {
    trackAuthFailure: vi.fn(),
    trackValidationError: vi.fn(),
    trackAnalysisError: vi.fn(),
  },
  PerformanceTracker: {
    timeOperation: async (_name: string, op: () => Promise<unknown>) => op(),
    startTimer: vi.fn(),
    endTimer: vi.fn(),
  },
}));

// --- Helpers ---

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/ai/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }) as never; // NextRequest is structurally compatible
}

const AUTHED_USER = { id: 'user-1' };
const VALID_BODY = {
  prompt: 'https://example.com/articulo',
  context: {
    selection: 'readability-analyzer',
    url: 'https://example.com/articulo',
    targetKeyword: 'seo',
    competitorUrls: ['https://comp.com/a'],
    directText: undefined,
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({ data: { user: AUTHED_USER }, error: null });
  mockCanPerformAnalysis.mockResolvedValue({ allowed: true, usage: { used: 0, limit: 10, remaining: 10 } });
  mockTrackAnalysis.mockResolvedValue({ analysisId: 'analysis-1' });
  mockGetDailyUsage.mockResolvedValue({ used: 1, limit: 10, remaining: 9 });
  mockCacheGet.mockResolvedValue(null);
  mockScrapeURL.mockResolvedValue({ url: 'https://example.com/articulo', title: 'Art', wordCount: 100 });
  mockBuildPrompt.mockReturnValue('prompt generado');
  mockComplete.mockResolvedValue({ content: 'respuesta IA', model: 'gemini-2.5-flash', cost: 0.001 });
  mockParseAnalysis.mockReturnValue({ scores: { readability: 80 }, markdown: '# Análisis' });
});

describe('POST /api/ai/analyze', () => {
  it('devuelve 401 cuando el usuario no está autenticado', async () => {
    mockGetUser.mockResolvedValueOnce({ data: { user: null }, error: null });
    const { POST } = await import('@/src/app/api/ai/analyze/route');
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(401);
  });

  it('devuelve 429 con limitReached cuando se supera el límite', async () => {
    mockCanPerformAnalysis.mockResolvedValueOnce({
      allowed: false,
      reason: 'Límite diario alcanzado',
      usage: { used: 10, limit: 10, remaining: 0 },
    });
    const { POST } = await import('@/src/app/api/ai/analyze/route');
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(429);
    const data = await res.json();
    expect(data.limitReached).toBe(true);
    expect(data.error).toBe('Límite diario alcanzado');
  });

  it('devuelve 400 cuando el body no valida el schema', async () => {
    const { POST } = await import('@/src/app/api/ai/analyze/route');
    const res = await POST(makeRequest({ prompt: '' }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe('Datos de entrada inválidos');
  });

  it('devuelve 200 con el análisis parseado y registra el uso', async () => {
    const { POST } = await import('@/src/app/api/ai/analyze/route');
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.scores).toEqual({ readability: 80 });
    expect(data.message).toBe('# Análisis');
    expect(data.analysisId).toBe('analysis-1');
    expect(mockTrackAnalysis).toHaveBeenCalledWith('user-1', 'https://example.com/articulo', 'readability-analyzer');
    expect(mockCacheSet).toHaveBeenCalledOnce();
  });

  it('devuelve caché sin llamar al provider ni trackear', async () => {
    const cached = { message: 'cacheado', scores: { readability: 50 }, analysisId: 'old' };
    mockCacheGet.mockResolvedValueOnce(cached);
    const { POST } = await import('@/src/app/api/ai/analyze/route');
    const res = await POST(makeRequest(VALID_BODY));
    const data = await res.json();
    expect(data.cached).toBe(true);
    expect(data.message).toBe('cacheado');
    expect(mockComplete).not.toHaveBeenCalled();
    expect(mockTrackAnalysis).not.toHaveBeenCalled();
  });

  it('scrapea competidores con Promise.allSettled y tolera fallos', async () => {
    mockScrapeURL
      .mockResolvedValueOnce({ url: 'https://example.com/articulo', title: 'Art', wordCount: 100 })
      .mockRejectedValueOnce(new Error('timeout competidor'));
    const { POST } = await import('@/src/app/api/ai/analyze/route');
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.competitorData).toEqual([]);
    expect(mockBuildPrompt).toHaveBeenCalledOnce();
  });

  it('devuelve 500 y trackea el error cuando el provider falla', async () => {
    mockComplete.mockRejectedValueOnce(new Error('IA caída'));
    const { POST } = await import('@/src/app/api/ai/analyze/route');
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error).toBe('IA caída');
  });
});

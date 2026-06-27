import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AIProvider, createAIProvider } from '@/src/lib/ai/gemini/provider';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
  vi.stubEnv('GEMINI_API_KEY', 'test-key');
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  mockFetch.mockReset();
});

function geminiResponse(content = 'respuesta', usage = { promptTokenCount: 10, candidatesTokenCount: 5, totalTokenCount: 15 }) {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      candidates: [{ content: { parts: [{ text: content }] } }],
      usageMetadata: usage,
    }),
  };
}

describe('createAIProvider', () => {
  it('usa GEMINI_API_KEY del entorno y gemini-2.5-flash por defecto', () => {
    const provider = createAIProvider();
    expect(provider).toBeInstanceOf(AIProvider);
  });
});

describe('AIProvider.complete', () => {
  it('llama a la API de Gemini con el modelo y apiKey configurados', async () => {
    mockFetch.mockResolvedValueOnce(geminiResponse('hola'));
    const provider = createAIProvider();

    const result = await provider.complete({
      messages: [{ role: 'user', content: 'test' }],
    });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent');
    expect(url).toContain('key=test-key');

    expect(result.content).toBe('hola');
    expect(result.model).toBe('gemini-2.5-flash');
    expect(result.usage?.inputTokens).toBe(10);
    expect(result.usage?.outputTokens).toBe(5);
    expect(result.usage?.totalTokens).toBe(15);
  });

  it('traduce el rol assistant a model en el cuerpo de la petición', async () => {
    mockFetch.mockResolvedValueOnce(geminiResponse());
    const provider = createAIProvider();

    await provider.complete({
      messages: [
        { role: 'user', content: 'pregunta' },
        { role: 'assistant', content: 'respuesta previa' },
      ],
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.contents[0].role).toBe('user');
    expect(body.contents[1].role).toBe('model');
  });

  it('habilita googleSearch salvo para reescrituras (maxTokens<=1024 y copywriting SEO)', async () => {
    mockFetch.mockResolvedValueOnce(geminiResponse());
    const provider = createAIProvider();

    await provider.complete({
      messages: [{ role: 'user', content: 'Eres un experto en copywriting SEO' }],
      maxTokens: 1024,
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.tools).toBeUndefined();
  });

  it('habilita googleSearch para análisis normales', async () => {
    mockFetch.mockResolvedValueOnce(geminiResponse());
    const provider = createAIProvider();

    await provider.complete({
      messages: [{ role: 'user', content: 'analiza este contenido' }],
      maxTokens: 4096,
    });

    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.tools).toEqual([{ googleSearch: {} }]);
  });

  it('lanza un error claro si falta GEMINI_API_KEY', async () => {
    vi.stubEnv('GEMINI_API_KEY', '');
    const provider = createAIProvider({ apiKey: '' });

    await expect(
      provider.complete({ messages: [{ role: 'user', content: 'x' }] })
    ).rejects.toThrow('GEMINI_API_KEY');
  });

  it('propaga errores HTTP de la API de Gemini', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => 'bad request',
    });
    const provider = createAIProvider();

    await expect(
      provider.complete({ messages: [{ role: 'user', content: 'x' }] })
    ).rejects.toThrow('Google Gemini API error (400)');
  });

  it('normaliza el prefijo google/ en el nombre del modelo', async () => {
    mockFetch.mockResolvedValueOnce(geminiResponse());
    const provider = new AIProvider({ apiKey: 'test-key', model: 'google/gemini-2.5-flash' });

    await provider.complete({ messages: [{ role: 'user', content: 'x' }] });

    const url = mockFetch.mock.calls[0][0];
    expect(url).toContain('models/gemini-2.5-flash:generateContent');
    expect(url).not.toContain('google/');
  });

  it('estima el coste a partir de los tokens reportados', async () => {
    mockFetch.mockResolvedValueOnce(
      geminiResponse('x', { promptTokenCount: 1_000_000, candidatesTokenCount: 0, totalTokenCount: 1_000_000 })
    );
    const provider = createAIProvider();

    const result = await provider.complete({ messages: [{ role: 'user', content: 'x' }] });

    // 1M input * 0.075 + 0 output = 0.075
    expect(result.cost).toBeCloseTo(0.075, 6);
  });
});

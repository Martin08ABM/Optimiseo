/**
 * Componente Hero - Sección principal de la landing page
 *
 * Este componente muestra el mensaje principal de la aplicación en la página de inicio.
 * Presenta el valor principal de OptimiSEO de forma clara y centrada.
 *
 * @component
 * @returns {JSX.Element} Sección hero con el mensaje principal
 */

'use client'

import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ExportButtons from "./dashboard/ExportButtons";
import SEOChecklist from "./SEOChecklist";
import SEOScoreDisplay from "./SEOScoreDisplay";
import RewritePanel from "./RewritePanel";
import type { ScrapedContent } from "@/src/app/api/ai/shared/types";
import type { SEOScores } from "@/src/lib/seo/scoreParser";

interface AnalysisResult {
  selection: string;
  provider: string;
  message: string;
  analysisId: string | null;
  scrapedData: Record<string, unknown> | null;
  scores: SEOScores | null;
}

interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
}

interface HeroProps {
  isAuthenticated: boolean;
  usage?: UsageStats;
  isPro?: boolean;
}

export default function Hero({ isAuthenticated, usage: initialUsage, isPro }: HeroProps) {

  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageStats | undefined>(initialUsage)
  const [saved, setSaved] = useState(false)
  const [monitored, setMonitored] = useState(false)

  // Actualizar el estado cuando cambien las props
  useEffect(() => {
    setUsage(initialUsage);
  }, [initialUsage]);

  const sendInputToApi = async function(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setSaved(false);
    setMonitored(false);

    const formData = new FormData(e.currentTarget);
    const message = formData.get('message') as string;
    const selection = formData.get('selection') as string;

    if (!message || message.trim() === '') {
      setError('Por favor ingresa una URL válida');
      setLoading(false);
      return;
    }

    if (!selection || selection.trim() === '') {
      setError('Por favor selecciona un tipo de análisis');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/ai/claude', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: message,
          context: { selection }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al analizar la URL');
      }

      setResult(data);

      // Actualizar el contador de uso si viene en la respuesta
      if (data.usage) {
        setUsage(data.usage);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);

      // Si es un error 429, actualizar el uso
      if (err instanceof Error && err.message.includes('limit')) {
        // Recargar los datos de uso desde el servidor
        try {
          const usageResponse = await fetch('/api/subscription/status');
          if (usageResponse.ok) {
            const data = await usageResponse.json();
            if (data.usage) {
              setUsage(data.usage);
            }
          }
        } catch {
          // Ignorar errores al actualizar el uso
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex flex-col gap-6 mt-8 items-center max-w-full">
      <div className="text-center max-w-3xl px-4">
        <h1 className="font-title text-white text-xl md:text-2xl font-black mb-3">
          Tu ayudante para impulsar tus páginas optimizando el SEO sin parecer un robot
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Análisis inteligente con IA que detecta problemas y te da soluciones concretas
        </p>
      </div>

      <section className="max-w-full flex justify-center w-full">
        <div className="max-w-full flex justify-center w-full">
          <form onSubmit={sendInputToApi} className="max-w-full flex justify-center w-full">
            <div className="text-center items-center text-white flex flex-col w-full max-w-2xl px-4">
              <label htmlFor="message" className="text-lg font-medium mb-3">Analiza tu sitio web ahora</label>

              {/* Contador de análisis disponibles */}
              {isAuthenticated && usage && (
                <div className="mt-2 mb-3">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span className={`font-semibold ${
                      usage.remaining === 0
                        ? 'text-red-400'
                        : usage.remaining < 3
                        ? 'text-yellow-400'
                        : 'text-green-400'
                    }`}>
                      {usage.remaining} de {usage.limit} análisis disponibles hoy
                    </span>
                  </div>
                  <div className="w-full max-w-xs mx-auto mt-1 bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        usage.remaining === 0
                          ? 'bg-red-500'
                          : usage.remaining < 3
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${(usage.remaining / usage.limit) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="w-full space-y-4">
                <input
                  type="url"
                  name="message"
                  id="message"
                  className="w-full border-2 border-gray-600 rounded-xl bg-gray-800 px-4 py-3 outline-none text-white placeholder-gray-500 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all"
                  placeholder="https://tu-sitio-web.com"
                  required
                />

                <div className="w-full">
                  <label htmlFor="selection" className="block text-sm text-gray-400 mb-2">Tipo de análisis:</label>
                  <select
                    name="selection"
                    id="selection"
                    className="w-full border-2 border-gray-600 outline-none rounded-xl px-4 py-3 bg-gray-800 text-white focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 transition-all"
                    required
                  >
                    <option value="">Selecciona una opción</option>
                    <option value="readability-analyzer">Comprobador de legibilidad</option>
                    <option value="words-repetition">Repetición de palabras</option>
                    <option value="coherency-evaluator">Coherencia del contenido</option>
                    <option value="keyword-suggestions">Sugerencias de Keywords</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || (isAuthenticated && usage?.remaining === 0)}
                className="mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/50 w-full md:w-auto min-w-50"
              >
                {loading
                  ? 'Analizando...'
                  : (isAuthenticated && usage?.remaining === 0)
                    ? 'Límite alcanzado'
                    : 'Analizar'}
              </button>

              {/* Mensaje cuando se alcanza el límite */}
              {isAuthenticated && usage?.remaining === 0 && (
                <p className="text-yellow-400 text-sm mt-2">
                  Has alcanzado tu límite diario de análisis. Mejora a Pro para obtener más análisis diarios.
                </p>
              )}
            </div>
          </form>
        </div>
      </section>

      {loading && (
        <div className="mt-8 max-w-3xl w-full px-4">
          <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-2">
                <div className="h-8 bg-gray-700 rounded-lg w-56 animate-pulse"></div>
                <div className="h-4 bg-gray-700/60 rounded w-40 animate-pulse"></div>
              </div>
              <div className="h-7 bg-blue-600/40 rounded-full w-12 animate-pulse"></div>
            </div>

            <div className="mb-6 space-y-2">
              <div className="h-4 bg-gray-700/80 rounded w-3/4 animate-pulse"></div>
              <div className="h-4 bg-gray-700/60 rounded w-2/3 animate-pulse"></div>
            </div>

            <div className="bg-gray-900 rounded-xl p-5 space-y-4">
              <div className="h-4 bg-gray-700/70 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-700/60 rounded w-11/12 animate-pulse"></div>
              <div className="h-4 bg-gray-700/50 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-700/70 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-700/60 rounded w-4/5 animate-pulse"></div>
            </div>

            <div className="text-center mt-6">
              <div className="inline-flex items-center gap-2 text-blue-400">
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium">Claude está analizando tu sitio web...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="mt-6 max-w-3xl w-full px-4">
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 text-white">
            <h3 className="font-semibold mb-2">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="mt-8 max-w-3xl w-full px-4">
          <div className="bg-gray-800 border-2 border-gray-700 rounded-2xl p-6 md:p-8 text-white shadow-2xl">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-2xl mb-1">Resultados del Análisis</h3>
                <p className="text-sm text-gray-400">Análisis completado con éxito</p>
              </div>
              <span className="text-xs bg-blue-600/80 px-3 py-1.5 rounded-full font-medium">
                IA
              </span>
            </div>

            <div className="mb-4 text-sm text-gray-400">
              <p><strong>Tipo:</strong> {result.selection === 'readability-analyzer' ? 'Legibilidad' : result.selection === 'words-repetition' ? 'Repetición de palabras' : result.selection === 'keyword-suggestions' ? 'Sugerencias de Keywords' : 'Coherencia'}</p>
              <p><strong>Proveedor:</strong> {result.provider}</p>
            </div>

            {result.scores && (
              <SEOScoreDisplay scores={result.scores} />
            )}

            {result.scrapedData && !(result.scrapedData as unknown as ScrapedContent).error && (
              <SEOChecklist scrapedData={result.scrapedData as unknown as ScrapedContent} />
            )}

            {result.scrapedData && !(result.scrapedData as unknown as ScrapedContent).error && (
              <RewritePanel scrapedData={result.scrapedData as unknown as ScrapedContent} />
            )}

            <div className="bg-gray-900 rounded-lg p-4 prose prose-invert prose-sm max-w-none
              prose-headings:text-white prose-headings:mt-4 prose-headings:mb-2
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-strong:text-white
              prose-ul:text-gray-300 prose-ol:text-gray-300
              prose-li:marker:text-blue-400
              prose-code:text-blue-300 prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-700
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-table:text-gray-300 prose-th:text-white prose-th:border-gray-600 prose-td:border-gray-700
              prose-hr:border-gray-700">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {result.message}
              </ReactMarkdown>
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={async () => {
                  if (!result.analysisId) return;
                  try {
                    const res = await fetch('/api/analyses/save', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        analysisId: result.analysisId,
                        message: result.message,
                        scrapedData: result.scrapedData,
                        scores: result.scores,
                      }),
                    });
                    if (res.ok) setSaved(true);
                  } catch {
                    // silent fail
                  }
                }}
                disabled={saved || !result.analysisId}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg disabled:hover:scale-100"
              >
              {saved ? (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Guardado
                </>
              ) : (
                <>
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  Guardar resultado
                </>
              )}
            </button>

            {isPro && (result.scrapedData?.url as string) && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/monitoring', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url: result.scrapedData?.url as string }),
                    });
                    if (res.ok) setMonitored(true);
                  } catch {
                    // silent fail
                  }
                }}
                disabled={monitored}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg disabled:hover:scale-100"
              >
                {monitored ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Monitorizada
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Monitorizar URL
                  </>
                )}
              </button>
            )}
            </div>

            <ExportButtons
              analysisResult={result.message}
              analysisData={{
                url: result.scrapedData?.url as string || '',
                type: result.selection,
                date: new Date().toISOString(),
                result: result.message,
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
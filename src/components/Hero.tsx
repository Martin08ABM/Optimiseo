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

interface AnalysisResult {
  selection: string;
  provider: string;
  message: string;
}

interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
}

interface HeroProps {
  isAuthenticated: boolean;
  usage?: UsageStats;
}

export default function Hero({ isAuthenticated, usage: initialUsage }: HeroProps) {

  // const [  message, setMessage] = useState('')
  // const [selection, setSelection] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usage, setUsage] = useState<UsageStats | undefined>(initialUsage)

  // Actualizar el estado cuando cambien las props
  useEffect(() => {
    setUsage(initialUsage);
  }, [initialUsage]);

  const sendInputToApi = async function(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

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
    <section className="flex flex-col gap-4 mt-4 items-center w-screen">
      <h1 className="font-title text-white text-md md:text-lg max-w-2xl md:max-w-3xl font-black text-center">
        Tu ayudante para impulsar tus páginas optimizando el SEO sin parecer un
        robot
      </h1>
      <section className="w-screen flex justify-center">
        <div className="w-screen flex justify-center">
          <form onSubmit={sendInputToApi} className="w-screen flex justify-center">
            <div className="text-center items-center  text-white flex flex-col mt-4 w-full">
              <label htmlFor="message">Escribe tu dirección URL para comprobarla:</label>

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

              <input type="url" name="message" id="message" className="border-2 border-black rounded-xl bg-gray-300 px-2 py-2 outline-none text-black w-3/4 md:max-w-[33.333vw]" placeholder="https://tu-web-increible.com" required/>
              <div className="items-center text-[10px] justify-between flex flex-col gap-2 mt-2">
                <p>Elije que hay que revisar:</p>
                <select name="selection" id="selection" className="text-white max-w-1/2 border-2 border-black outline-none rounded-xl px-1 py-1 bg-gray-500" required>
                  <option value="">-- Selecciona una opción --</option>
                  <option value="readability-analyzer">Comprobador de legibilidad</option>
                  <option value="words-repetition">Comprobar la repetición de palabras</option>
                  <option value="coherency-evaluator">Comprobar la coherencia</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading || (isAuthenticated && usage?.remaining === 0)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-semibold px-6 py-2 rounded-xl transition-colors w-1/4 md:w-1/6"
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
        <div className="mt-6 max-w-3xl w-full px-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <div className="h-7 bg-gray-700 rounded w-48 animate-pulse"></div>
              <div className="h-6 bg-blue-600/50 rounded-full w-16 animate-pulse"></div>
            </div>

            <div className="mb-4 space-y-2">
              <div className="h-4 bg-gray-700 rounded w-64 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-48 animate-pulse"></div>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 space-y-3">
              <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-4/5 animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
            </div>

            <p className="text-center text-gray-400 mt-4 text-sm">
              Claude está analizando tu sitio web...
            </p>
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
        <div className="mt-6 max-w-3xl w-full px-4">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-white">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-xl">Resultados del Análisis</h3>
              <span className="text-xs bg-blue-600 px-3 py-1 rounded-full">
                {'basic'}
              </span>
            </div>

            <div className="mb-4 text-sm text-gray-400">
              <p><strong>Tipo:</strong> {result.selection === 'readability-analyzer' ? 'Legibilidad' : result.selection === 'words-repetition' ? 'Repetición de palabras' : 'Coherencia'}</p>
              <p><strong>Proveedor:</strong> {result.provider}</p>
            </div>

            <div className="bg-gray-900 rounded-lg p-4 whitespace-pre-wrap">
              {result.message}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
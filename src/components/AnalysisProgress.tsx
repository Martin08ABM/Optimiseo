'use client';

export function AnalysisProgress() {
  return (
    <div
      className="mt-8 w-full max-w-2xl mx-auto"
      role="status"
      aria-live="polite"
      aria-label="Analizando tu contenido con IA"
    >
      <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-5 animate-pulse">
        <div className="flex items-center gap-3 mb-4">
          <span
            aria-hidden="true"
            className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-400/40 border-t-blue-400"
          />
          <span className="text-gray-200 font-medium">Analizando tu contenido con IA…</span>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-700 rounded w-2/3" />
        </div>
      </div>
      <p className="mt-3 text-sm text-gray-500 text-center">
        Esto puede tomar 10-30 segundos dependiendo de la complejidad
      </p>
      <span className="sr-only">El análisis está en curso, espera por favor.</span>
    </div>
  );
}

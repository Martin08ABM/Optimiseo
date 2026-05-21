'use client';

export function AnalysisProgress() {
  return (
    <div className="mt-8 text-center py-8">
      <div className="inline-flex items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="text-gray-300">Analizando tu contenido con IA...</span>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        Esto puede tomar 10-30 segundos dependiendo de la complejidad
      </div>
    </div>
  );
}
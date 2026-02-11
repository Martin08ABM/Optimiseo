'use client';

import { useState } from 'react';

export default function ImageAltShowcase() {
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="border-2 border-gray-600 rounded-2xl px-6 py-5 bg-linear-to-br from-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-bold text-white">Texto alternativo en imágenes</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Optimiza alt text para accesibilidad y posicionamiento en Google Imágenes
          </p>
        </div>
        <button
          onClick={() => setShowExample(!showExample)}
          className="ml-4 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-medium transition-colors"
        >
          {showExample ? 'Ocultar' : 'Ver ejemplo'}
        </button>
      </div>

      {showExample && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
          <div className="bg-gray-950 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">PROBLEMA (Alt vacío o genérico)</p>
            <p className="text-sm text-red-300">alt=""</p>
            <p className="text-sm text-red-300 mt-1">alt="imagen"</p>
            <p className="text-xs text-yellow-400 mt-2">⚠️ Sin contexto - Pierde ranking en búsqueda de imágenes</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">SOLUCIÓN (Descriptivo y con keywords)</p>
            <p className="text-sm text-green-300">alt="ejemplo análisis SEO mostrando checklist optimizado en dashboard"</p>
            <p className="text-xs text-green-400 mt-2">✓ Descriptivo, natural, incluye contexto y keywords relevantes</p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function KeywordDensityShowcase() {
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="border-2 border-gray-600 rounded-2xl px-6 py-5 bg-linear-to-br from-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h2 className="text-lg font-bold text-white">Densidad de keywords</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Detecta uso excesivo de palabras clave que penalizan tu ranking
          </p>
        </div>
        <button
          onClick={() => setShowExample(!showExample)}
          className="ml-4 px-3 py-1 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium transition-colors"
        >
          {showExample ? 'Ocultar' : 'Ver ejemplo'}
        </button>
      </div>

      {showExample && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
          <div className="bg-gray-950 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">PROBLEMA (Keyword stuffing)</p>
            <p className="text-sm text-red-300 italic">"SEO tips, mejores SEO tips, guía SEO tips definitiva para SEO..."</p>
            <p className="text-xs text-yellow-400 mt-2">⚠️ Densidad: 8% - Penalización probable</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">SOLUCIÓN (Natural y variado)</p>
            <p className="text-sm text-green-300 italic">"Consejos de optimización, mejores prácticas SEO, guía definitiva..."</p>
            <p className="text-xs text-green-400 mt-2">✓ Densidad: 2-3% - Óptimo</p>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';

export default function RevisionTitleConcordancy() {
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="border-2 border-gray-600 rounded-2xl px-6 py-5 bg-linear-to-br from-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-lg font-bold text-white">Coherencia título-contenido</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Evalúa si tu título refleja fielmente el contenido del artículo
          </p>
        </div>
        <button
          onClick={() => setShowExample(!showExample)}
          className="ml-4 px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium transition-colors"
        >
          {showExample ? 'Ocultar' : 'Ver ejemplo'}
        </button>
      </div>

      {showExample && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
          <div className="bg-gray-950 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">ANTES (Título engañoso)</p>
            <p className="text-sm text-red-300">"Los 10 mejores trucos de SEO"</p>
            <p className="text-xs text-gray-400 mt-2">→ Contenido: Solo habla de meta tags</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">DESPUÉS (Título coherente)</p>
            <p className="text-sm text-green-300">"Guía completa de Meta Tags para SEO"</p>
            <p className="text-xs text-gray-400 mt-2">→ Contenido: Coincide perfectamente</p>
          </div>
        </div>
      )}
    </div>
  );
}

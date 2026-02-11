'use client';

import { useState } from 'react';

export default function MetaDescriptionShowcase() {
  const [showExample, setShowExample] = useState(false);

  return (
    <div className="border-2 border-gray-600 rounded-2xl px-6 py-5 bg-linear-to-br from-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <h2 className="text-lg font-bold text-white">Meta descriptions optimizadas</h2>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">
            Genera descripciones que aumentan el CTR en resultados de búsqueda
          </p>
        </div>
        <button
          onClick={() => setShowExample(!showExample)}
          className="ml-4 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-medium transition-colors"
        >
          {showExample ? 'Ocultar' : 'Ver ejemplo'}
        </button>
      </div>

      {showExample && (
        <div className="mt-4 pt-4 border-t border-gray-700 space-y-3">
          <div className="bg-gray-950 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">ANTES (Genérica y aburrida)</p>
            <p className="text-sm text-red-300">"Aprende sobre SEO. Artículo completo."</p>
            <p className="text-xs text-gray-400 mt-2">→ 42 caracteres - Demasiado corta, sin CTA</p>
          </div>
          <div className="bg-gray-950 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">DESPUÉS (Optimizada con CTA)</p>
            <p className="text-sm text-green-300">"Descubre 15 técnicas SEO probadas que aumentarán tu tráfico orgánico en 90 días. Guía paso a paso con ejemplos reales. ¡Empieza hoy!"</p>
            <p className="text-xs text-green-400 mt-2">✓ 148 caracteres - Longitud ideal, incluye CTA y beneficios</p>
          </div>
        </div>
      )}
    </div>
  );
}

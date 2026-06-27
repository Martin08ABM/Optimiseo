import Showcase from './Showcase';

export default function KeywordDensityShowcase() {
  return (
    <Showcase
      title="Densidad de keywords"
      description="Detecta uso excesivo de palabras clave que penalizan tu ranking"
      accentClass="bg-green-600 hover:bg-green-700"
      icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      }
    >
      <div className="bg-gray-950 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">PROBLEMA (Keyword stuffing)</p>
        <p className="text-sm text-red-300 italic">{'"SEO tips, mejores SEO tips, guía SEO tips definitiva para SEO..."'}</p>
        <p className="text-xs text-yellow-400 mt-2">{'⚠️ Densidad: 8% - Penalización probable'}</p>
      </div>
      <div className="bg-gray-950 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">SOLUCIÓN (Natural y variado)</p>
        <p className="text-sm text-green-300 italic">{'"Consejos de optimización, mejores prácticas SEO, guía definitiva..."'}</p>
        <p className="text-xs text-green-400 mt-2">{'✓ Densidad: 2-3% - Óptimo'}</p>
      </div>
    </Showcase>
  );
}

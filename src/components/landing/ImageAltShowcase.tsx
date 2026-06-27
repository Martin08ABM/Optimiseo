import Showcase from '@/src/components/landing/Showcase';

export default function ImageAltShowcase() {
  return (
    <Showcase
      title="Texto alternativo en imágenes"
      description="Optimiza alt text para accesibilidad y posicionamiento en Google Imágenes"
      accentClass="bg-yellow-600 hover:bg-yellow-700"
      icon={
        <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
    >
      <div className="bg-gray-950 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">PROBLEMA (Alt vacío o genérico)</p>
        <p className="text-sm text-red-300">{'alt=""'}</p>
        <p className="text-sm text-red-300 mt-1">{'alt="imagen"'}</p>
        <p className="text-xs text-yellow-400 mt-2">{'⚠️ Sin contexto - Pierde ranking en búsqueda de imágenes'}</p>
      </div>
      <div className="bg-gray-950 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">SOLUCIÓN (Descriptivo y con keywords)</p>
        <p className="text-sm text-green-300">{'alt="ejemplo análisis SEO mostrando checklist optimizado en dashboard"'}</p>
        <p className="text-xs text-green-400 mt-2">✓ Descriptivo, natural, incluye contexto y keywords relevantes</p>
      </div>
    </Showcase>
  );
}

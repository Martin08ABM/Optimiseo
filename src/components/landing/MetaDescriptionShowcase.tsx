import Showcase from './Showcase';

export default function MetaDescriptionShowcase() {
  return (
    <Showcase
      title="Meta descriptions optimizadas"
      description="Genera descripciones que aumentan el CTR en resultados de búsqueda"
      accentClass="bg-purple-600 hover:bg-purple-700"
      icon={
        <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        </svg>
      }
    >
      <div className="bg-gray-950 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">ANTES (Genérica y aburrida)</p>
        <p className="text-sm text-red-300">{'"Aprende sobre SEO. Artículo completo."'}</p>
        <p className="text-xs text-gray-400 mt-2">→ 42 caracteres - Demasiado corta, sin CTA</p>
      </div>
      <div className="bg-gray-950 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">DESPUÉS (Optimizada con CTA)</p>
        <p className="text-sm text-green-300">{'"Descubre 15 técnicas SEO probadas que aumentarán tu tráfico orgánico en 90 días. Guía paso a paso con ejemplos reales. ¡Empieza hoy!"'}</p>
        <p className="text-xs text-green-400 mt-2">✓ 148 caracteres - Longitud ideal, incluye CTA y beneficios</p>
      </div>
    </Showcase>
  );
}

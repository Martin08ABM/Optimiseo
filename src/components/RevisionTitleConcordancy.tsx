import Showcase from '@/src/components/landing/Showcase';

export default function RevisionTitleConcordancy() {
  return (
    <Showcase
      title="Coherencia título-contenido"
      description="Evalúa si tu título refleja fielmente el contenido del artículo"
      accentClass="bg-blue-600 hover:bg-blue-700"
      icon={
        <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      }
    >
      <div className="bg-gray-950 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">ANTES (Título engañoso)</p>
        <p className="text-sm text-red-300">{'"Los 10 mejores trucos de SEO"'}</p>
        <p className="text-xs text-gray-400 mt-2">→ Contenido: Solo habla de meta tags</p>
      </div>
      <div className="bg-gray-950 rounded-lg p-3">
        <p className="text-xs text-gray-500 mb-1">DESPUÉS (Título coherente)</p>
        <p className="text-sm text-green-300">{'"Guía completa de Meta Tags para SEO"'}</p>
        <p className="text-xs text-gray-400 mt-2">→ Contenido: Coincide perfectamente</p>
      </div>
    </Showcase>
  );
}

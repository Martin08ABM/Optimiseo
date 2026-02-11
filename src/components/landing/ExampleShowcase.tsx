export default function ExampleShowcase() {
  return (
    <section className="py-16 px-6">
      <h2 className="text-2xl font-bold text-white text-center mb-8">Ejemplo de análisis</h2>
      <div className="max-w-3xl mx-auto bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex flex-col md:flex-row">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm text-gray-400">https://ejemplo.com/blog/seo-tips</p>
              <p className="text-xs text-gray-500 mt-1">Análisis de legibilidad</p>
            </div>
            
          </div>
          <span className="text-xs bg-green-600/80 text-white text-center px-2 py-1 rounded-full mt-2 mb-4 md:mt-2 md:mb-4 max-w-24">Completado</span>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 text-sm text-gray-300 space-y-3">
          <p><strong className="text-white">Puntuación general:</strong> 7.5/10</p>
          <p>
            El contenido presenta una estructura clara con encabezados bien definidos.
            Sin embargo, se detectaron párrafos demasiado extensos en las secciones 2 y 4
            que podrían dificultar la lectura.
          </p>
          <p><strong className="text-white">Recomendaciones:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-gray-400">
            <li>Dividir los párrafos de más de 150 palabras en secciones más cortas</li>
            <li>Añadir subtítulos H3 para mejorar la escaneabilidad</li>
            <li>Incluir listas con viñetas para los puntos clave</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

import Link from 'next/link';
import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';

export const metadata = {
  title: 'Guía de Etiquetas HTML para SEO | OptimiSEO',
  description: 'Aprende qué significan los términos H1, H2, H3, P y otras etiquetas HTML que aparecen en los análisis de OptimiSEO.',
};

export default function GuiaHTMLPage() {
  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-gray-600 to-gray-700">
      <Header />

      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Optimiseo - Guía de Etiquetas HTML
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
            Comprende los términos que aparecen en tu análisis de SEO
          </p>
        </section>

        {/* Introducción */}
        <section className="bg-gray-400 border-2 border-black rounded-xl p-6 md:p-8 mb-6 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">¿Qué son las Etiquetas HTML?</h2>
          <p className="text-gray-900 text-base leading-relaxed mb-3">
            Las <strong>etiquetas HTML</strong> son códigos que definen la estructura y el formato de tu contenido web.
            Son como las instrucciones que le dicen a los navegadores y buscadores cómo organizar y mostrar tu información.
          </p>
          <p className="text-gray-900 text-base leading-relaxed">
            Cuando OptimiSEO analiza tu contenido, identifica estas etiquetas para evaluar si tu estructura es óptima para SEO.
            ¡No te preocupes si no sabes programar! Aquí te explicamos cada una de manera simple.
          </p>
        </section>

        {/* Encabezados */}
        <section className="mt-6 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">Encabezados (H1, H2, H3, H4, H5, H6)</h2>

          <div className="grid md:grid-cols-2 gap-4">
            {/* H1 */}
            <div className="bg-gray-400 border-2 border-black rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-sm">H1</span>
                <h3 className="text-xl font-bold text-black">Título Principal</h3>
              </div>
              <p className="text-gray-900 mb-3 text-sm">
                Es el <strong>título más importante</strong> de tu página. Como el título de un libro.
              </p>
              <div className="bg-gray-700 rounded-lg p-3 mb-3">
                <p className="text-gray-400 text-xs mb-2">Ejemplo:</p>
                <p className="text-white text-xl font-bold">Cómo Hacer Pan Casero</p>
              </div>
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-600">
                <p className="text-blue-300 text-xs font-semibold mb-2">Importancia SEO:</p>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Solo debe haber <strong>uno por página</strong></li>
                  <li>• Es el tema principal para buscadores</li>
                  <li>• Debe contener tu palabra clave</li>
                </ul>
              </div>
            </div>

            {/* H2 */}
            <div className="bg-gray-400 border-2 border-black rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-lg font-bold text-sm">H2</span>
                <h3 className="text-xl font-bold text-black">Subtítulos Principales</h3>
              </div>
              <p className="text-gray-900 mb-3 text-sm">
                Son las <strong>secciones principales</strong> de tu contenido. Como los capítulos de un libro.
              </p>
              <div className="bg-gray-700 rounded-lg p-3 mb-3">
                <p className="text-gray-400 text-xs mb-2">Ejemplo:</p>
                <p className="text-white text-lg font-bold">Ingredientes Necesarios</p>
              </div>
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-600">
                <p className="text-blue-300 text-xs font-semibold mb-2">Importancia SEO:</p>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Puedes tener varios H2 en una página</li>
                  <li>• Ayudan a organizar tu contenido</li>
                  <li>• Facilitan la lectura</li>
                </ul>
              </div>
            </div>

            {/* H3 */}
            <div className="bg-gray-400 border-2 border-black rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-400 text-white px-3 py-1 rounded-lg font-bold text-sm">H3</span>
                <h3 className="text-xl font-bold text-black">Subtítulos Secundarios</h3>
              </div>
              <p className="text-gray-900 mb-3 text-sm">
                Son <strong>subsecciones dentro de un H2</strong>. Como los temas dentro de un capítulo.
              </p>
              <div className="bg-gray-700 rounded-lg p-3 mb-3">
                <p className="text-gray-400 text-xs mb-2">Ejemplo:</p>
                <p className="text-white text-base font-bold">Ingredientes Secos</p>
              </div>
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-600">
                <p className="text-blue-300 text-xs font-semibold mb-2">Importancia SEO:</p>
                <ul className="text-gray-300 text-xs space-y-1">
                  <li>• Añaden estructura y profundidad</li>
                  <li>• Mejoran la jerarquía</li>
                  <li>• Facilitan la navegación</li>
                </ul>
              </div>
            </div>

            {/* H4-H6 */}
            <div className="bg-gray-400 border-2 border-black rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-300 text-white px-3 py-1 rounded-lg font-bold text-sm">H4-H6</span>
                <h3 className="text-xl font-bold text-black">Niveles Menores</h3>
              </div>
              <p className="text-gray-900 mb-3 text-sm">
                Encabezados para <strong>detalles muy específicos</strong>. Se usan menos frecuentemente.
              </p>
              <div className="bg-gray-700 rounded-lg p-3 mb-3">
                <p className="text-gray-400 text-xs mb-2">Tamaños decrecientes:</p>
                <p className="text-white text-sm">H4 → H5 → H6</p>
              </div>
              <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-600">
                <p className="text-blue-300 text-xs font-semibold mb-2">Consejo:</p>
                <p className="text-gray-300 text-xs">
                  En la mayoría de contenidos, con H1, H2 y H3 es suficiente.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Jerarquía Visual */}
        <section className="bg-gray-400 border-2 border-black rounded-xl p-6 md:p-8 mb-6 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-4">📊 Jerarquía Visual</h2>
          <p className="text-gray-900 mb-4">
            Así es como se ve la estructura correcta de encabezados:
          </p>
          <div className="bg-gray-700 rounded-lg p-6 space-y-3">
            <div className="border-l-4 border-blue-600 pl-4">
              <p className="text-blue-400 text-xs font-mono mb-1">H1</p>
              <p className="text-white text-2xl font-bold">Título Principal</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 ml-4">
              <p className="text-blue-400 text-xs font-mono mb-1">H2</p>
              <p className="text-white text-xl font-bold">Primera Sección</p>
            </div>
            <div className="border-l-4 border-blue-400 pl-4 ml-8">
              <p className="text-blue-400 text-xs font-mono mb-1">H3</p>
              <p className="text-white text-lg font-bold">Subsección 1.1</p>
            </div>
            <div className="border-l-4 border-blue-400 pl-4 ml-8">
              <p className="text-blue-400 text-xs font-mono mb-1">H3</p>
              <p className="text-white text-lg font-bold">Subsección 1.2</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4 ml-4">
              <p className="text-blue-400 text-xs font-mono mb-1">H2</p>
              <p className="text-white text-xl font-bold">Segunda Sección</p>
            </div>
          </div>
        </section>

        {/* Párrafos */}
        <section className="bg-gray-400 border-2 border-black rounded-xl p-6 md:p-8 mb-6 shadow-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-600 text-white px-3 py-1 rounded-lg font-bold text-sm">P</span>
            <h2 className="text-2xl md:text-3xl font-bold text-black">Párrafos</h2>
          </div>
          <p className="text-gray-900 mb-4">
            Son los <strong>bloques de texto normal</strong> donde escribes tu contenido principal.
          </p>
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <p className="text-gray-400 text-xs mb-2">Ejemplo:</p>
            <p className="text-white text-sm leading-relaxed">
              Este es un párrafo de ejemplo. Contiene el texto normal que los usuarios leen.
              Es donde desarrollas tus ideas y proporcionas información detallada sobre el tema.
            </p>
          </div>
          <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-600">
            <p className="text-blue-300 text-sm font-semibold mb-2">Importancia para SEO:</p>
            <ul className="text-gray-300 text-sm space-y-2">
              <li>• Deben ser fáciles de leer y comprender</li>
              <li>• Idealmente entre 50-150 palabras por párrafo</li>
              <li>• Contienen el grueso de tu contenido y keywords</li>
            </ul>
          </div>
        </section>

        {/* Otras etiquetas */}
        <section className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">Otras Etiquetas Importantes</h2>

          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-400 border-2 border-black rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <span className="bg-orange-600 text-white px-2 py-1 rounded text-xs font-bold">STRONG</span>
              <h3 className="text-lg font-bold text-black mt-2 mb-2">Texto en Negrita</h3>
              <p className="text-gray-900 text-sm mb-2">
                Resalta palabras <strong>importantes</strong>.
              </p>
              <p className="text-xs text-gray-700">
                Para keywords y conceptos clave
              </p>
            </div>

            <div className="bg-gray-400 border-2 border-black rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <span className="bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold">EM</span>
              <h3 className="text-lg font-bold text-black mt-2 mb-2">Texto en Cursiva</h3>
              <p className="text-gray-900 text-sm mb-2">
                Da <em>énfasis</em> a palabras o frases.
              </p>
              <p className="text-xs text-gray-700">
                Para énfasis sutil
              </p>
            </div>

            <div className="bg-gray-400 border-2 border-black rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <span className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-bold">A</span>
              <h3 className="text-lg font-bold text-black mt-2 mb-2">Enlaces</h3>
              <p className="text-gray-900 text-sm mb-2">
                <a href="#" className="text-blue-600 underline">Links</a> a otras páginas.
              </p>
              <p className="text-xs text-gray-700">
                Esenciales para SEO
              </p>
            </div>

            <div className="bg-gray-400 border-2 border-black rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold">IMG</span>
              <h3 className="text-lg font-bold text-black mt-2 mb-2">Imágenes</h3>
              <p className="text-gray-900 text-sm mb-2">
                Etiqueta para mostrar imágenes.
              </p>
              <p className="text-xs text-gray-700">
                El atributo &quot;alt&quot; es crucial
              </p>
            </div>

            <div className="bg-gray-400 border-2 border-black rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <span className="bg-emerald-600 text-white px-2 py-1 rounded text-xs font-bold">UL/OL</span>
              <h3 className="text-lg font-bold text-black mt-2 mb-2">Listas</h3>
              <p className="text-gray-900 text-sm mb-2">
                Con viñetas (UL) o numeradas (OL).
              </p>
              <p className="text-xs text-gray-700">
                Mejoran la legibilidad
              </p>
            </div>

            <div className="bg-gray-400 border-2 border-black rounded-xl p-5 shadow-lg hover:shadow-xl transition-shadow">
              <span className="bg-amber-600 text-white px-2 py-1 rounded text-xs font-bold">META</span>
              <h3 className="text-lg font-bold text-black mt-2 mb-2">Meta Etiquetas</h3>
              <p className="text-gray-900 text-sm mb-2">
                Información invisible para buscadores.
              </p>
              <p className="text-xs text-gray-700">
                Título y descripción en Google
              </p>
            </div>
          </div>
        </section>

        {/* Buenas Prácticas */}
        <section className="bg-gray-400 border-2 border-black rounded-xl p-6 md:p-8 mb-6 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">✅ Buenas Prácticas</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-bold text-green-600 mb-3">✓ Hacer</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-900">Usar solo un H1 por página</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-900">Mantener jerarquía lógica (H1 → H2 → H3)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-900">Incluir keywords en encabezados</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-900">Escribir párrafos cortos y legibles</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span className="text-gray-900">Usar listas para organizar información</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-bold text-red-600 mb-3">✗ Evitar</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-900">Usar múltiples H1 en una página</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-900">Saltar niveles (H1 → H3 sin H2)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-900">Usar encabezados solo por estética</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-900">Escribir párrafos demasiado largos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✗</span>
                  <span className="text-gray-900">Rellenar con keywords de forma antinatural</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Por qué importa */}
        <section className="bg-gray-400 border-2 border-black rounded-xl p-6 md:p-8 mb-6 shadow-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-6">🎯 ¿Por Qué Importa para SEO?</h2>

          <div className="space-y-4">
            <div className="bg-gray-700 rounded-lg p-5">
              <h3 className="text-lg font-bold text-blue-400 mb-2">🤖 Para los Buscadores</h3>
              <p className="text-gray-300 text-sm">
                Google y otros buscadores leen estas etiquetas para entender de qué trata tu contenido.
                Una estructura clara ayuda a que te encuentren mejor.
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-5">
              <h3 className="text-lg font-bold text-blue-400 mb-2">👥 Para los Usuarios</h3>
              <p className="text-gray-300 text-sm">
                Los encabezados bien organizados hacen que tu contenido sea más fácil de leer y escanear.
                Los usuarios encuentran lo que buscan más rápido.
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-5">
              <h3 className="text-lg font-bold text-blue-400 mb-2">♿ Para la Accesibilidad</h3>
              <p className="text-gray-300 text-sm">
                Las personas que usan lectores de pantalla dependen de estas etiquetas para navegar tu contenido.
                Una buena estructura hace tu sitio más inclusivo.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-linear-to-r from-blue-800 to-purple-950 rounded-xl p-8 text-center shadow-2xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            🚀 ¡Analiza tu contenido ahora!
          </h2>
          <p className="text-white/90 text-base md:text-lg mb-6 max-w-2xl mx-auto">
            Con OptimiSEO, verás exactamente cómo está estructurado tu contenido y recibirás recomendaciones para mejorarlo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="bg-white text-gray-600 px-6 py-3 rounded-lg font-bold text-base hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Analizar mi Contenido
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-800 text-white px-6 py-3 rounded-lg font-bold text-base hover:bg-gray-700 transition-all duration-300 border-2 border-white/30"
            >
              Ir al Dashboard
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

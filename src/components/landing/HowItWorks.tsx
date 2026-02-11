const steps = [
  {
    number: '1',
    title: 'Pega tu URL',
    description: 'Introduce la dirección de la página web que quieres analizar.',
  },
  {
    number: '2',
    title: 'Elige el análisis',
    description: 'Selecciona entre legibilidad, repetición de palabras o coherencia.',
  },
  {
    number: '3',
    title: 'Recibe recomendaciones',
    description: 'Obtén un informe detallado con sugerencias concretas para mejorar tu SEO.',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 px-6 max-w-full">
      <h2 className="text-2xl font-bold text-white text-center mb-12">Cómo funciona</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map(step => (
          <div key={step.number} className="flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg mb-4">
              {step.number}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-gray-400 text-sm">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

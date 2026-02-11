import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '0',
    features: ['5 análisis diarios', 'Legibilidad, repetición y coherencia', 'Resultados con IA'],
  },
  {
    name: 'Pro',
    price: '12',
    features: [
      '100 análisis diarios',
      'Historial de análisis',
      'Análisis por lotes',
      'Comparación de revisiones',
      'Métricas y gráficos',
    ],
    highlighted: true,
  },
];

export default function PricingSummary() {
  return (
    <section className="py-16 px-4 max-w-full">
      <h2 className="text-2xl font-bold text-white text-center mb-8">Planes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {plans.map(plan => (
          <div
            key={plan.name}
            className={`rounded-xl p-6 border ${
              plan.highlighted
                ? 'bg-blue-600/10 border-blue-500'
                : 'bg-gray-800 border-gray-700'
            }`}
          >
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {plan.price}&euro;<span className="text-sm font-normal text-gray-400">/mes</span>
            </p>
            <ul className="mt-4 space-y-2">
              {plan.features.map(feature => (
                <li key={feature} className="flex items-center gap-2 text-sm text-gray-300">
                  <svg className="w-4 h-4 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="text-center mt-8">
        <Link
          href="/pricing"
          className="text-blue-400 hover:text-blue-300 text-sm underline"
        >
          Ver detalles completos de precios
        </Link>
      </div>
    </section>
  );
}

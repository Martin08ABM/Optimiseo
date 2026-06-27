/**
 * Página de Precios
 *
 * Muestra los planes disponibles (Free y Pro) con sus características y precios.
 * Detecta si el usuario está autenticado para personalizar los CTAs.
 *
 * Ruta: /pricing
 *
 * @page
 */

import Header from '@/src/components/Header';
import Footer from '@/src/components/Footer';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import PricingClient from './PricingClient';
import { PLANS } from '@/src/lib/config/pricing';

export default async function PricingPage() {
  // Obtener cliente de Supabase y verificar autenticación
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si está autenticado, obtener su plan actual
  let currentPlanId = 'free';
  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single();

    if (subscription) {
      currentPlanId = subscription.plan_id;
    }
  }

  const plans = PLANS;

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-slate-900 via-zinc-950 to-black">
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Precios simples y transparentes
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a tus necesidades. Sin sorpresas,
          sin tarifas ocultas.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden ${
                plan.highlighted ? 'md:scale-[1.02] shadow-2xl border-blue-500' : 'shadow-lg'
              }`}
            >
              {plan.highlighted && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-semibold">
                  ⭐ Más popular
                </div>
              )}

              <div className="p-6 md:p-8">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-400 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl md:text-5xl font-bold text-white">
                    {plan.price}€
                  </span>
                  <span className="text-gray-400 text-lg">/mes</span>
                </div>

                <PricingClient
                  planId={plan.id}
                  planName={plan.name}
                  planPrice={plan.price}
                  isAuthenticated={!!user}
                  currentPlanId={currentPlanId}
                  isHighlighted={plan.highlighted}
                />

                <div className="space-y-4 mt-8">
                  <p className="font-semibold text-white text-lg">
                    Incluye:
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="w-5 h-5 text-green-400 mr-3 flex-shrink-0 mt-0.5"
                          aria-hidden="true"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            Preguntas frecuentes
          </h2>
          <div className="space-y-4">
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2 text-lg">
                ¿Puedo cambiar de plan en cualquier momento?
              </h3>
              <p className="text-gray-300">
                Sí, puedes actualizar o degradar tu plan en cualquier momento
                desde el dashboard. Los cambios se aplicarán inmediatamente.
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2 text-lg">
                ¿Qué métodos de pago aceptan?
              </h3>
              <p className="text-gray-300">
                Aceptamos todas las tarjetas de crédito y débito principales a
                través de Stripe, nuestra plataforma de pagos segura.
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2 text-lg">
                ¿Los límites diarios se reinician cada día?
              </h3>
              <p className="text-gray-300">
                Sí, los límites de análisis diarios se reinician a medianoche
                (hora local) cada día.
              </p>
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
              <h3 className="font-semibold text-white mb-2 text-lg">
                ¿Hay garantía de devolución?
              </h3>
              <p className="text-gray-300">
                Ofrecemos una garantía de devolución de 14 días para el Plan
                Pro. Si no estás satisfecho, te reembolsaremos el 100% de tu
                dinero.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

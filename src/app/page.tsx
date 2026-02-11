/**
 * Página principal de la aplicación OptimiSEO
 *
 * Esta es la landing page que se muestra cuando el usuario accede a la raíz del sitio.
 * Renderiza el header de navegación y el hero con el mensaje principal.
 *
 * @component
 * @returns {JSX.Element} Página de inicio con header y hero
 */

'use server';
import Hero from "@/src/components/Hero";
import Header from "@/src/components/Header";
import RevisionTitleConcordancy from "../components/RevisionTitleConcordancy";
import KeywordDensityShowcase from "@/src/components/landing/KeywordDensityShowcase";
import MetaDescriptionShowcase from "@/src/components/landing/MetaDescriptionShowcase";
import ImageAltShowcase from "@/src/components/landing/ImageAltShowcase";
import HowItWorks from "@/src/components/landing/HowItWorks";
import ExampleShowcase from "@/src/components/landing/ExampleShowcase";
import PricingSummary from "@/src/components/landing/PricingSummary";
import StatsSection from "@/src/components/landing/StatsSection";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { getDailyUsage } from "@/src/lib/subscription/utils";
import Footer from "../components/Footer";

export default async function Home() {
  // Obtener información del usuario autenticado
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Si está autenticado, obtener su uso diario y plan
  let usage = undefined;
  let isPro = false;
  if (user) {
    usage = await getDailyUsage(user.id);
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single();
    isPro = subscription?.plan_id === 'pro';
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-b from-gray-600 to-gray-950 max-w-full">
      <Header />
      <Hero isAuthenticated={!!user} usage={usage} isPro={isPro} />

      {/* Showcase de funcionalidades */}
      <section className="flex flex-col gap-6 items-center justify-center px-6 md:px-10 py-8">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-2">
          ¿Qué puedes hacer con OptimiSEO?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-6xl w-full">
          <RevisionTitleConcordancy />
          <KeywordDensityShowcase />
          <MetaDescriptionShowcase />
          <ImageAltShowcase />
        </div>
      </section>

      <HowItWorks />
      <ExampleShowcase />
      <StatsSection />
      {!user && <PricingSummary />}
      <Footer />
    </div>
  );
}

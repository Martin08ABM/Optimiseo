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
import HowItWorks from "@/src/components/landing/HowItWorks";
import ExampleShowcase from "@/src/components/landing/ExampleShowcase";
import PricingSummary from "@/src/components/landing/PricingSummary";
import StatsSection from "@/src/components/landing/StatsSection";
import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { getDailyUsage } from "@/src/lib/subscription/utils";
import Link from "next/link";
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
      <section className="flex flex-col gap-4 items-center justify-center px-10 py-4">
        <div className="flex flex-col max-w-[60%]">
          <Link href="/"><RevisionTitleConcordancy /></Link>
        </div>
      </section>
      <HowItWorks />
      <ExampleShowcase />
      <StatsSection />
      <PricingSummary />
      <Footer />
    </div>
  );
}

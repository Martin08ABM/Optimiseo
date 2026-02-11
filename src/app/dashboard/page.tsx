/**
 * Página del Dashboard
 *
 * Página principal del dashboard del usuario autenticado.
 * Muestra el componente MainDashboard con toda la información del usuario.
 *
 * Ruta: /dashboard
 *
 * @page
 */

import Header from '@/src/components/Header';
import HeroDashboard from '@/src/components/dashboard/HeroDashboard';
import MainDashboard from '@/src/components/dashboard/MainDashboard';
import CheckoutSuccess from '@/src/components/dashboard/CheckoutSuccess';
import DashboardMetrics from '@/src/components/dashboard/DashboardMetrics';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import Footer from '@/src/components/Footer';

// Desactivar caché para esta página para reflejar cambios de suscripción en tiempo real
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPro = false;
  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_id')
      .eq('user_id', user.id)
      .single();
    isPro = subscription?.plan_id === 'pro';
  }

  return (
    <div className="flex flex-col  min-h-screen bg-gray-700">
      <Header />
      <CheckoutSuccess />
      <HeroDashboard />
      <div className="max-w-4xl mx-auto w-full">
        <DashboardMetrics isPro={isPro} />
      </div>
      <MainDashboard />
      <div className='mt-10'><Footer /></div>
    </div>
  )
}
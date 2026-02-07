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

// Desactivar caché para esta página para reflejar cambios de suscripción en tiempo real
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  return (
    <div className="flex flex-col px-4 py-2 min-h-screen bg-gray-700">
      <Header />
      <HeroDashboard />
      <MainDashboard />
    </div>
  )
}
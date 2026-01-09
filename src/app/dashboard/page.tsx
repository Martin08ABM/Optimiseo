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

export default async function Dashboard() {
  return (
    <div className="flex flex-col px-4 py-2 min-h-screen bg-gray-700">
      <Header />
      <HeroDashboard />
      <MainDashboard />
    </div>
  )
}
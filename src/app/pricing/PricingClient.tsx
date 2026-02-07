/**
 * Componente Cliente para los CTAs de Pricing
 *
 * Maneja la lógica de los botones de acción según:
 * - Si el usuario está autenticado o no
 * - Cuál es su plan actual
 * - Qué plan está viendo
 *
 * @component
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface PricingClientProps {
  planId: string;
  planName: string;
  isAuthenticated: boolean;
  currentPlanId: string;
  isHighlighted: boolean;
}

export default function PricingClient({
  planId,
  planName,
  isAuthenticated,
  currentPlanId,
  isHighlighted,
}: PricingClientProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Usuario NO autenticado
  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/register"
        className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
          isHighlighted
            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
            : 'bg-gray-600 text-white hover:bg-gray-700'
        }`}
      >
        {planId === 'free' ? 'Comenzar gratis' : 'Comenzar prueba'}
      </Link>
    );
  }

  // Usuario autenticado - Plan actual
  if (planId === currentPlanId) {
    return (
      <button
        disabled
        className="w-full py-3 px-6 rounded-lg font-semibold bg-gray-500 text-gray-300 cursor-not-allowed"
      >
        ✓ Plan actual
      </button>
    );
  }

  // Usuario con plan Free mirando el plan Pro
  if (currentPlanId === 'free' && planId === 'pro') {
    const handleUpgrade = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/subscription/checkout', {
          method: 'POST',
        });
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } catch (error) {
        console.error('Error creating checkout session:', error);
        setLoading(false);
      }
    };

    return (
      <button
        onClick={handleUpgrade}
        disabled={loading}
        className="w-full py-3 px-6 rounded-lg font-semibold transition-colors bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Procesando...' : 'Mejorar a Pro'}
      </button>
    );
  }

  // Usuario con plan Pro mirando el plan Free
  if (currentPlanId === 'pro' && planId === 'free') {
    const handleManageBilling = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/subscription/portal', {
          method: 'POST',
        });
        const { url } = await response.json();
        if (url) {
          window.location.href = url;
        }
      } catch (error) {
        console.error('Error creating portal session:', error);
        setLoading(false);
      }
    };

    return (
      <button
        onClick={handleManageBilling}
        disabled={loading}
        className="w-full py-3 px-6 rounded-lg font-semibold transition-colors bg-gray-600 text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Cargando...' : 'Gestionar suscripción'}
      </button>
    );
  }

  // Fallback: ir al dashboard
  return (
    <Link
      href="/dashboard"
      className="block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors bg-gray-600 text-white hover:bg-gray-700"
    >
      Ir al Dashboard
    </Link>
  );
}

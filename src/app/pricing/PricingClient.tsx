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

interface PricingClientProps {
  planId: string;
  planName: string;
  planPrice: number;
  isAuthenticated: boolean;
  currentPlanId: string;
  isHighlighted: boolean;
}

export default function PricingClient({
  planId,
  planPrice,
  isAuthenticated,
  currentPlanId,
  isHighlighted,
}: PricingClientProps) {
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<{
    valid: boolean;
    discountAmount?: number;
    finalPrice?: number;
    error?: string;
  } | null>(null);
  const [validating, setValidating] = useState(false);

  // Validar código de descuento
  const validateDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountInfo(null);
      return;
    }

    setValidating(true);
    try {
      const response = await fetch('/api/discount-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode.trim(), price: planPrice }),
        credentials: 'include', // Asegurar que se envíen las cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          setDiscountInfo({ valid: false, error: 'Debes iniciar sesión para usar códigos de descuento' });
        } else {
          const data = await response.json();
          setDiscountInfo({ valid: false, error: data.error || 'Error al validar código' });
        }
        return;
      }

      const data = await response.json();
      setDiscountInfo(data);
    } catch (error) {
      console.error('Error validating discount:', error);
      setDiscountInfo({ valid: false, error: 'Error al validar código' });
    } finally {
      setValidating(false);
    }
  };

  // Usuario NO autenticado
  if (!isAuthenticated) {
    return (
      <Link
        href="/auth/register"
        className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${
          isHighlighted
            ? 'bg-linear-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            discountCode: discountInfo?.valid ? discountCode.trim() : null
          }),
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
      <div className="space-y-3">
        {/* Campo de código de descuento */}
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value.toUpperCase());
                setDiscountInfo(null);
              }}
              onBlur={validateDiscount}
              placeholder="Código de descuento"
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 text-black"
            />
            <button
              onClick={validateDiscount}
              disabled={validating || !discountCode.trim()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validating ? '...' : 'Aplicar'}
            </button>
          </div>

          {/* Mensaje de validación */}
          {discountInfo && (
            <div className={`text-sm font-medium ${discountInfo.valid ? 'text-green-600' : 'text-red-600'}`}>
              {discountInfo.valid ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Código válido</span>
                  </div>
                  {/* Precio con descuento destacado */}
                  <div className="bg-green-50 border-2 border-green-600 rounded-lg p-3">
                    <div className="text-gray-600 text-xs mb-1">Precio con descuento:</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-green-700">
                        {discountInfo.finalPrice?.toFixed(2)}€
                      </span>
                      <span className="text-sm text-gray-500 line-through">{planPrice}€</span>
                      <span className="text-sm font-semibold text-green-700">
                        (-{discountInfo.discountAmount}€)
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">/mes</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{discountInfo.error}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botón de actualizar */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full py-3 px-6 rounded-lg font-semibold transition-colors bg-linear-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : 'Mejorar a Pro'}
        </button>
      </div>
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
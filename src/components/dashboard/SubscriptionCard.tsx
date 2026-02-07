'use client';

import { useEffect, useState } from 'react';
import type { UserSubscriptionData } from '@/src/types/subscription';

export function SubscriptionCard() {
  const [subscriptionData, setSubscriptionData] =
    useState<UserSubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradingToPro, setUpgradingToPro] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/subscription/status');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPro = async () => {
    setUpgradingToPro(true);
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
      setUpgradingToPro(false);
    }
  };

  const handleManageBilling = async () => {
    setManagingBilling(true);
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
      setManagingBilling(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (!subscriptionData) {
    return null;
  }

  const { subscription, plan, usage } = subscriptionData;
  const isPro = plan.id === 'pro';
  const usagePercentage = (usage.used / usage.limit) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
          <p className="text-sm text-gray-600">{plan.description}</p>
        </div>
        <div className="text-right">
          {isPro ? (
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                Pro
              </span>
              <p className="text-lg font-bold text-gray-900 mt-2">
                {plan.price_monthly.toFixed(2)}€
                <span className="text-sm font-normal text-gray-600">/mes</span>
              </p>
            </div>
          ) : (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
              Free
            </span>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Análisis utilizados hoy
          </span>
          <span className="text-sm font-medium text-gray-900">
            {usage.used} / {usage.limit}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all ${
              usagePercentage >= 100
                ? 'bg-red-600'
                : usagePercentage >= 80
                  ? 'bg-yellow-500'
                  : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Reinicia en:{' '}
          {new Date(usage.resetAt).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>

      {/* Features List */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Características:
        </h4>
        <ul className="space-y-1">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start text-sm text-gray-600">
              <svg
                className="w-5 h-5 text-green-500 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {!isPro ? (
          <button
            onClick={handleUpgradeToPro}
            disabled={upgradingToPro}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {upgradingToPro ? 'Procesando...' : 'Mejorar a Pro'}
          </button>
        ) : (
          <button
            onClick={handleManageBilling}
            disabled={managingBilling}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {managingBilling ? 'Cargando...' : 'Gestionar suscripción'}
          </button>
        )}
      </div>

      {/* Subscription Status */}
      {isPro && subscription.cancel_at_period_end && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Tu suscripción se cancelará el{' '}
            {new Date(subscription.current_period_end!).toLocaleDateString(
              'es-ES'
            )}
          </p>
        </div>
      )}
    </div>
  );
}

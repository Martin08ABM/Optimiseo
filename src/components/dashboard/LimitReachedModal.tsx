'use client';

import type { UsageStats } from '@/src/types/subscription';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  usage?: UsageStats;
}

export function LimitReachedModal({
  isOpen,
  onClose,
  usage,
}: LimitReachedModalProps) {
  if (!isOpen) return null;

  const handleUpgrade = async () => {
    const response = await fetch('/api/subscription/checkout', {
      method: 'POST',
    });
    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-100 rounded-full mb-4">
          <svg
            className="w-6 h-6 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
          Límite de análisis alcanzado
        </h3>

        <p className="text-gray-600 text-center mb-6">
          Has alcanzado el límite de {usage?.limit || 5} análisis diarios del
          plan gratuito.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-blue-900 mb-2">
            ¿Necesitas más análisis?
          </h4>
          <p className="text-sm text-blue-800 mb-3">
            Actualiza a Pro y obtén:
          </p>
          <ul className="space-y-1 text-sm text-blue-800">
            <li className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              100 análisis diarios
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Historial de análisis
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Exportación de resultados
            </li>
            <li className="flex items-center">
              <svg
                className="w-4 h-4 mr-2 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Solo 12€/mes
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Actualizar a Pro
          </button>
        </div>

        {usage && (
          <p className="text-xs text-gray-500 text-center mt-4">
            Tus análisis se reiniciarán en{' '}
            {new Date(usage.resetAt).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}

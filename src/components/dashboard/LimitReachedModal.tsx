'use client';

import { useState } from 'react';
import { Modal } from '@/src/components/ui/Modal';
import { useToast } from '@/src/components/ui/Toast';
import { PRO_PRICE_MONTHLY } from '@/src/lib/config/pricing';
import type { UsageStats } from '@/src/types/subscription';

interface LimitReachedModalProps {
  isOpen: boolean;
  onClose: () => void;
  usage?: UsageStats;
}

const PRO_BENEFITS = ['100 análisis diarios', 'Historial de análisis', 'Exportación de resultados'];

export function LimitReachedModal({ isOpen, onClose, usage }: LimitReachedModalProps) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/checkout', { method: 'POST' });
      const { url, error } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        toast.error(error || 'No se pudo iniciar el pago.');
        setLoading(false);
      }
    } catch {
      toast.error('Error de conexión al iniciar el pago');
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Límite de análisis alcanzado"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleUpgrade}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white transition"
          >
            {loading ? 'Procesando…' : 'Actualizar a Pro'}
          </button>
        </>
      }
    >
      <div className="flex items-center justify-center w-12 h-12 mx-auto bg-yellow-900/40 rounded-full mb-4">
        <svg className="w-6 h-6 text-yellow-400" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>

      <p className="text-gray-300 text-center mb-6">
        Has alcanzado el límite de {usage?.limit || 5} análisis diarios del plan gratuito.
      </p>

      <div className="bg-blue-600/10 border border-blue-500/40 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-white mb-2">¿Necesitas más análisis?</h4>
        <p className="text-sm text-blue-300 mb-3">Actualiza a Pro y obtén:</p>
        <ul className="space-y-1 text-sm text-blue-200">
          {PRO_BENEFITS.map((b) => (
            <li key={b} className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-blue-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {b}
            </li>
          ))}
          <li className="flex items-center">
            <svg className="w-4 h-4 mr-2 text-blue-400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Solo {PRO_PRICE_MONTHLY}€/mes
          </li>
        </ul>
      </div>

      {usage && (
        <p className="text-xs text-gray-500 text-center">
          Tus análisis se reiniciarán en{' '}
          {new Date(usage.resetAt).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </Modal>
  );
}

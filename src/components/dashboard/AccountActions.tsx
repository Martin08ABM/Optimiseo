/**
 * Componente AccountActions - Acciones de gestión de cuenta
 *
 * Proporciona botones para:
 * - Cancelar suscripción Pro (solo si tiene plan Pro)
 * - Cerrar sesión
 * - Eliminar cuenta permanentemente
 *
 * @component
 */

'use client';

import { useState } from 'react';
import { logoutAction } from '@/src/actions/account/logout';
import { deleteAccountAction } from '@/src/actions/account/delete-account';
import { cancelSubscriptionAction } from '@/src/actions/account/cancel-subscription';

interface AccountActionsProps {
  userPlan: string;
  hasActiveProSubscription: boolean;
}

export default function AccountActions({
  userPlan,
  hasActiveProSubscription
}: AccountActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutAction();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await cancelSubscriptionAction();

      if (result.success) {
        setSuccess(result.message || 'Suscripción cancelada correctamente');
        setShowCancelConfirm(false);
        // Recargar la página después de 2 segundos para reflejar los cambios
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setError(result.error || 'Error al cancelar la suscripción');
      }
    } catch (err) {
      setError('Error inesperado al cancelar la suscripción');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await deleteAccountAction();

      if (!result.success) {
        setError(result.error || 'Error al eliminar la cuenta');
        setLoading(false);
      }
      // Si tiene éxito, redirigirá automáticamente
    } catch (err) {
      setError('Error inesperado al eliminar la cuenta');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-y-4">
      {/* Mensajes de error/éxito */}
      {error && (
        <div className="bg-red-900/20 border-2 border-red-500 rounded-xl px-4 py-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900/20 border-2 border-green-500 rounded-xl px-4 py-3">
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Botón de cancelar suscripción (solo para usuarios Pro) */}
      {userPlan === 'pro' && hasActiveProSubscription && (
        <>
          <button
            onClick={() => setShowCancelConfirm(true)}
            disabled={loading}
            className="border-2 border-orange-500 rounded-xl px-4 py-2 bg-orange-900/20 text-orange-400 hover:bg-orange-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar suscripción Pro
          </button>

          {/* Modal de confirmación de cancelación */}
          {showCancelConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
              <div className="bg-gray-800 border-2 border-black rounded-xl max-w-md w-full p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  ¿Cancelar suscripción Pro?
                </h3>
                <p className="text-gray-300 mb-6">
                  Tu suscripción se cancelará al final del período de facturación actual.
                  Mantendrás acceso a las funciones Pro hasta entonces, después volverás
                  al plan gratuito.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={loading}
                    className="flex-1 border-2 border-black rounded-xl px-4 py-2 bg-gray-400 text-black hover:bg-gray-500 transition-colors disabled:opacity-50"
                  >
                    No, mantener Pro
                  </button>
                  <button
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="flex-1 border-2 border-orange-500 rounded-xl px-4 py-2 bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Cancelando...' : 'Sí, cancelar'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Botón de cerrar sesión */}
      <button
        onClick={handleLogout}
        disabled={loading}
        className="border-2 border-black rounded-xl px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Cerrando sesión...' : 'Cerrar sesión'}
      </button>

      {/* Botón de eliminar cuenta */}
      <button
        onClick={() => setShowDeleteConfirm(true)}
        disabled={loading}
        className="border-2 border-red-500 rounded-xl px-4 py-2 bg-red-900/20 text-red-400 hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Eliminar cuenta permanentemente
      </button>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-800 border-2 border-red-500 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-900/40 rounded-full mb-4">
              <svg
                className="w-8 h-8 text-red-400"
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

            <h3 className="text-xl font-bold text-white text-center mb-2">
              ⚠️ Eliminar cuenta permanentemente
            </h3>

            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
              <p className="text-red-300 text-sm font-semibold mb-2">
                Esta acción es IRREVERSIBLE
              </p>
              <p className="text-gray-300 text-sm">
                Se eliminarán permanentemente:
              </p>
              <ul className="text-gray-300 text-sm mt-2 space-y-1 ml-4 list-disc">
                <li>Tu cuenta y datos personales</li>
                <li>Todo tu historial de análisis</li>
                <li>Tu información de suscripción</li>
              </ul>
            </div>

            {userPlan === 'pro' && hasActiveProSubscription && (
              <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-3 mb-4">
                <p className="text-orange-300 text-sm">
                  ⚠️ Tienes una suscripción Pro activa. Debes cancelarla primero
                  desde el portal de facturación.
                </p>
              </div>
            )}

            <p className="text-gray-300 text-center mb-6">
              ¿Estás completamente seguro?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
                className="flex-1 border-2 border-black rounded-xl px-4 py-2 bg-gray-400 text-black hover:bg-gray-500 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="flex-1 border-2 border-red-500 rounded-xl px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Eliminando...' : 'Eliminar cuenta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

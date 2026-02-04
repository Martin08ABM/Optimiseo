'use client'

import { useState, useEffect } from 'react'
import { getMFAFactors } from '@/src/actions/auth/mfa-verify'
import { unenrollMFA } from '@/src/actions/auth/mfa-unenroll'
import { MFAEnrollDialog } from './MFAEnrollDialog'

export function MFASettings() {
  const [hasMFA, setHasMFA] = useState(false)
  const [factorId, setFactorId] = useState('')
  const [loading, setLoading] = useState(true)
  const [showEnrollDialog, setShowEnrollDialog] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const loadMFAStatus = async () => {
      setLoading(true)
      const result = await getMFAFactors()

      if (result.error) {
        setError(result.error)
      } else if (result.factors?.totp && result.factors.totp.length > 0) {
        setHasMFA(true)
        setFactorId(result.factors.totp[0].id)
      } else {
        setHasMFA(false)
      }
      setLoading(false)
    }

    void loadMFAStatus()
  }, [])

  const handleDisableMFA = async () => {
    if (!confirm('¿Estás seguro de que deseas desactivar la autenticación de dos factores?')) {
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    const result = await unenrollMFA(factorId)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('2FA desactivado correctamente')
      setHasMFA(false)
      setFactorId('')
    }
    setLoading(false)
  }

  const handleEnrolled = () => {
    setShowEnrollDialog(false)
    setSuccess('2FA configurado correctamente')
  }

  const handleCancelled = () => {
    setShowEnrollDialog(false)
  }

  if (loading && !hasMFA && !showEnrollDialog) {
    return (
      <div className="flex justify-center mt-4">
        <p className="text-white">Cargando...</p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-col items-center mt-4">
        <p className="text-lg font-semibold text-white mb-3">
          Autenticación de Dos Factores
        </p>

        {error && (
          <div className="bg-red-200 border-2 border-red-500 text-red-700 px-4 py-2 rounded-lg mb-3 text-center">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-200 border-2 border-green-500 text-green-700 px-4 py-2 rounded-lg mb-3 text-center">
            {success}
          </div>
        )}

        {hasMFA ? (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-white">
                2FA Activado
              </p>
            </div>

            <button
              onClick={handleDisableMFA}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 border-2 border-black rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {loading ? 'Desactivando...' : 'Desactivar'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-3">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-white">
                2FA Desactivado
              </p>
            </div>

            <button
              onClick={() => setShowEnrollDialog(true)}
              disabled={loading}
              className="bg-gray-800 hover:bg-gray-600 text-white font-bold py-2 px-6 border-2 border-black rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              Activar
            </button>
          </div>
        )}
      </div>

      {showEnrollDialog && (
        <MFAEnrollDialog
          onEnrolled={handleEnrolled}
          onCancelled={handleCancelled}
        />
      )}
    </>
  )
}

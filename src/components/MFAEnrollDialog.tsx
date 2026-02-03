'use client'

import { useState, useEffect } from 'react'
import { enrollMFA } from '@/src/actions/auth/mfa-enroll'
import { verifyMFACode } from '@/src/actions/auth/mfa-verify'

interface MFAEnrollDialogProps {
  onEnrolled: () => void
  onCancelled: () => void
}

export function MFAEnrollDialog({ onEnrolled, onCancelled }: MFAEnrollDialogProps) {
  const [factorId, setFactorId] = useState('')
  const [qrCode, setQRCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  useEffect(() => {
    const initEnrollment = async () => {
      setLoading(true)
      const result = await enrollMFA()
      
      if (result.error) {
        setError(result.error)
      } else if (result.factorId && result.qrCode && result.secret) {
        setFactorId(result.factorId)
        setQRCode(result.qrCode)
        setSecret(result.secret)
      }
      setLoading(false)
    }

    initEnrollment()
  }, [])

  const handleEnableClick = async () => {
    if (!verifyCode.trim()) {
      setError('Ingresa el código de verificación')
      return
    }

    setError('')
    setLoading(true)

    const result = await verifyMFACode(factorId, verifyCode.trim())

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      onEnrolled()
    }
  }

  if (loading && !qrCode) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-gray-400 border-2 border-black rounded-xl p-6 max-w-md w-full mx-4">
          <p className="text-center text-gray-900 font-semibold">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-400 border-2 border-black rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 text-center">Configurar 2FA</h2>

        {error && (
          <div className="bg-red-200 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-gray-800 mb-4 text-center">
            Escanea el código QR con tu app de autenticación
          </p>

          {qrCode && (
            <div className="flex justify-center mb-4">
              <img
                src={qrCode}
                alt="QR Code para MFA"
                className="border-2 border-black rounded-lg"
              />
            </div>
          )}

          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="text-sm text-blue-600 hover:text-blue-800 underline font-semibold"
            >
              {showSecret ? 'Ocultar' : 'Mostrar'} código manual
            </button>

            {showSecret && secret && (
              <div className="mt-2 p-3 bg-white border-2 border-black rounded-lg">
                <p className="text-xs text-gray-700 mb-1 font-semibold">Código secreto:</p>
                <code className="text-sm font-mono break-all text-gray-900">{secret}</code>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="verifyCode" className="block text-sm font-semibold text-gray-900 mb-2 text-center">
              Código de verificación
            </label>
            <input
              id="verifyCode"
              type="text"
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.trim())}
              placeholder="000000"
              maxLength={6}
              className="w-full px-3 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black text-center text-lg tracking-widest"
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleEnableClick}
            disabled={loading || !verifyCode.trim()}
            className="flex-1 bg-gray-800 hover:bg-gray-600 text-white font-bold py-2 px-4 border-2 border-black rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {loading ? 'Verificando...' : 'Habilitar'}
          </button>
          <button
            type="button"
            onClick={onCancelled}
            disabled={loading}
            className="flex-1 bg-white hover:bg-gray-200 text-gray-900 font-bold py-2 px-4 border-2 border-black rounded-lg transition-colors disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

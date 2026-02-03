'use client'

import { useState } from 'react'
import { verifyMFACode, getMFAFactors } from '@/src/actions/auth/mfa-verify'
import { useRouter } from 'next/navigation'

export function MFAVerifyDialog() {
  const [verifyCode, setVerifyCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!verifyCode.trim()) {
      setError('Ingresa el código de verificación')
      return
    }

    setError('')
    setLoading(true)

    const factorsResult = await getMFAFactors()
    
    if (factorsResult.error) {
      setError(factorsResult.error)
      setLoading(false)
      return
    }

    const totpFactor = factorsResult.factors?.totp?.[0]
    
    if (!totpFactor) {
      setError('No se encontró configuración MFA')
      setLoading(false)
      return
    }

    const result = await verifyMFACode(totpFactor.id, verifyCode.trim())
    
    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-400 border-2 border-black rounded-xl p-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            Verificación 2FA
          </h2>
          <p className="mt-2 text-center text-sm text-gray-800">
            Ingresa el código de tu app
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-200 border-2 border-red-500 text-red-700 px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="verify-code" className="sr-only">
              Código de verificación
            </label>
            <input
              id="verify-code"
              name="code"
              type="text"
              required
              value={verifyCode}
              onChange={(e) => setVerifyCode(e.target.value.trim())}
              placeholder="000000"
              maxLength={6}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border-2 border-black placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest bg-white"
              disabled={loading}
              autoComplete="off"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !verifyCode.trim()}
              className="group relative w-full flex justify-center py-3 px-4 border-2 border-black text-sm font-bold rounded-lg text-white bg-gray-800 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

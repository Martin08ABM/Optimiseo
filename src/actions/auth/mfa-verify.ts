'use server'

import { createServerSupabaseClient } from '@/src/lib/supabase/server'

export interface MFAVerifyResponse {
  success?: boolean
  error?: string
}

export async function verifyMFACode(
  factorId: string,
  code: string
): Promise<MFAVerifyResponse> {
  try {
    const supabase = await createServerSupabaseClient()

    const challenge = await supabase.auth.mfa.challenge({ factorId })
    if (challenge.error) {
      return { error: challenge.error.message }
    }

    const challengeId = challenge.data.id

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    })

    if (verify.error) {
      return { error: verify.error.message }
    }

    return { success: true }
  } catch {
    return { error: 'Error al verificar el código' }
  }
}

export async function getMFAFactors() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase.auth.mfa.listFactors()
    if (error) {
      return { error: error.message }
    }

    return { factors: data }
  } catch {
    return { error: 'Error al obtener factores MFA' }
  }
}

export async function getAuthenticatorAssuranceLevel() {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
    if (error) {
      return { error: error.message }
    }

    return { 
      currentLevel: data.currentLevel,
      nextLevel: data.nextLevel,
      currentAuthenticationMethods: data.currentAuthenticationMethods
    }
  } catch {
    return { error: 'Error al verificar nivel de autenticación' }
  }
}

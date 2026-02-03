'use server'

import { createServerSupabaseClient } from '@/src/lib/supabase/server'

export interface MFAUnenrollResponse {
  success?: boolean
  error?: string
}

export async function unenrollMFA(factorId: string): Promise<MFAUnenrollResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Usuario no autenticado' }
    }

    const { error } = await supabase.auth.mfa.unenroll({ factorId })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch {
    return { error: 'Error al desactivar MFA' }
  }
}

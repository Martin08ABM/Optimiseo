'use server'

import { createServerSupabaseClient } from '@/src/lib/supabase/server'

export interface MFAEnrollResponse {
  success?: boolean
  factorId?: string
  qrCode?: string
  secret?: string
  error?: string
}

export async function enrollMFA(): Promise<MFAEnrollResponse> {
  try {
    const supabase = await createServerSupabaseClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: 'Usuario no autenticado' }
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
    })

    if (error) {
      return { error: error.message }
    }

    return {
      success: true,
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    }
  } catch {
    return { error: 'Error al configurar MFA' }
  }
}

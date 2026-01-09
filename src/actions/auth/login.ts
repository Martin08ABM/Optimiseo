'use server';

import { createServerSupabaseClient } from "@/src/lib/supabase/server";
import { redirect } from 'next/navigation';
import { validateEmail } from '@/src/utils/validation';
import { checkRateLimit, getRateLimitIdentifier } from '@/src/lib/rateLimit';
import type { AuthResponse } from '@/src/types/auth';

export async function loginAction(formData: FormData): Promise<AuthResponse | void> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !validateEmail(email.trim())) {
    return { error: 'El formato del email no es válido' }
  }

  if (!password) {
    return { error: 'La contraseña es requerida' }
  }

  const rateLimitResult = checkRateLimit(getRateLimitIdentifier(email))
  if (!rateLimitResult.success) {
    const minutes = Math.ceil(rateLimitResult.resetIn / 60000)
    return { error: `Demasiados intentos. Intenta de nuevo en ${minutes} minutos.` }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password: password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

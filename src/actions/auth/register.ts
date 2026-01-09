'use server';

import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { redirect } from 'next/navigation';
import { validatePassword, validateEmail, sanitizeInput } from '@/src/utils/validation';
import { checkRateLimit, getRateLimitIdentifier } from '@/src/lib/rateLimit';
import type { AuthResponse } from '@/src/types/auth';

export async function registerAction(formData: FormData): Promise<AuthResponse | void> {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const firstName = sanitizeInput(formData.get('firstName') as string)
  const lastName = sanitizeInput(formData.get('lastName') as string)

  if (!email || !validateEmail(email.trim())) {
    return { error: 'El formato del email no es válido' }
  }

  const rateLimitResult = checkRateLimit(getRateLimitIdentifier(email))
  if (!rateLimitResult.success) {
    const minutes = Math.ceil(rateLimitResult.resetIn / 60000)
    return { error: `Demasiados intentos. Intenta de nuevo en ${minutes} minutos.` }
  }

  const passwordValidation = validatePassword(password)
  if (!passwordValidation.isValid) {
    return { error: passwordValidation.error }
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password: password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
      }
    }
  })

  if (error) {
    return { error: error.message || 'Error al registrar el usuario' }
  }

  if (data.user?.id) {
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: data.user.id,
        role: "basic"
      })

    if (roleError) {
      return { error: "Usuario creado pero hubo un error asignando el rol" }
    }
  }

  redirect('/')
}

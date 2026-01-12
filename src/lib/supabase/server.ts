'use server';

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type CookieStore = Awaited<ReturnType<typeof cookies>>
type CookieSetOptions = Parameters<CookieStore['set']>[2]

export async function createServerSupabaseClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieSetOptions) {
          try {
            cookieStore.set(name, value, options)
          } catch {
          }
        },
        remove(name: string, options: CookieSetOptions) {
          void options
          try {
            cookieStore.delete(name)
          } catch {
          }
        },
      },
    }
  )
}

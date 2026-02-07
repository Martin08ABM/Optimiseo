/**
 * Server Action: Cerrar sesión
 *
 * Cierra la sesión del usuario actual en Supabase.
 */

'use server';

import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function logoutAction() {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

/**
 * Server Action: Eliminar cuenta
 *
 * Elimina permanentemente la cuenta del usuario y todos sus datos asociados.
 * ADVERTENCIA: Esta acción es irreversible.
 */

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteAccountAction() {
  try {
    // Llamar a la API route que tiene acceso al Service Role
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/account/delete`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Error al eliminar la cuenta'
      };
    }

    revalidatePath('/', 'layout');
    redirect('/');
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    return {
      success: false,
      error: 'Error al eliminar la cuenta. Por favor contacta al soporte.'
    };
  }
}

/**
 * API Route: Eliminar cuenta de usuario
 *
 * Endpoint para eliminar permanentemente la cuenta del usuario autenticado.
 * Requiere que el usuario no tenga suscripción Pro activa.
 */

import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { createAdminClient } from '@/src/lib/supabase/admin';

export async function DELETE() {
  try {
    // Obtener usuario autenticado usando el cliente normal
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar si tiene suscripción Pro activa
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, plan_id')
      .eq('user_id', user.id)
      .single();

    // Si tiene plan Pro activo, no permitir eliminación
    if (subscription?.plan_id === 'pro' && subscription?.stripe_subscription_id) {
      return NextResponse.json(
        {
          error: 'Debes cancelar tu suscripción Pro antes de eliminar tu cuenta. Ve al portal de facturación.'
        },
        { status: 400 }
      );
    }

    // Eliminar datos del usuario en orden
    // 1. Eliminar análisis
    await supabase
      .from('analyses')
      .delete()
      .eq('user_id', user.id);

    // 2. Eliminar pagos si existen
    const { data: userSubscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (userSubscription) {
      await supabase
        .from('payments')
        .delete()
        .eq('subscription_id', userSubscription.id);
    }

    // 3. Eliminar suscripción
    await supabase
      .from('subscriptions')
      .delete()
      .eq('user_id', user.id);

    // 4. Eliminar usuario usando el cliente admin
    const supabaseAdmin = createAdminClient();
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error('Error al eliminar usuario:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar la cuenta. Por favor contacta al soporte.' },
        { status: 500 }
      );
    }

    // Cerrar sesión
    await supabase.auth.signOut();

    return NextResponse.json({
      success: true,
      message: 'Cuenta eliminada correctamente'
    });
  } catch (error) {
    console.error('Error en eliminación de cuenta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * Server Action: Cancelar suscripción Pro
 *
 * Cancela la suscripción del usuario al finalizar el período actual.
 * El usuario mantendrá acceso Pro hasta el final del período de facturación.
 */

'use server';

import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { cancelSubscription } from '@/src/lib/stripe/subscription';

export async function cancelSubscriptionAction() {
  const supabase = await createServerSupabaseClient();

  // Obtener usuario actual
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, error: 'No se pudo obtener el usuario' };
  }

  // Obtener suscripción del usuario
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id, plan_id, current_period_end')
    .eq('user_id', user.id)
    .single();

  if (subError || !subscription) {
    return { success: false, error: 'No se encontró la suscripción' };
  }

  // Verificar que tiene plan Pro
  if (subscription.plan_id !== 'pro') {
    return { success: false, error: 'No tienes una suscripción Pro activa' };
  }

  // Verificar que tiene ID de suscripción de Stripe
  if (!subscription.stripe_subscription_id) {
    return { success: false, error: 'No se encontró la suscripción en Stripe' };
  }

  try {
    // Cancelar en Stripe (al final del período)
    await cancelSubscription(subscription.stripe_subscription_id, true);

    // Actualizar en base de datos
    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', user.id);

    return {
      success: true,
      message: `Tu suscripción se cancelará el ${new Date(subscription.current_period_end!).toLocaleDateString('es-ES')}. Mantendrás acceso Pro hasta entonces.`
    };
  } catch (error) {
    console.error('Error al cancelar suscripción:', error);
    return {
      success: false,
      error: 'Error al cancelar la suscripción. Por favor intenta desde el portal de facturación.'
    };
  }
}

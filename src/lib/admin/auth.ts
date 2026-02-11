import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { createAdminClient } from '@/src/lib/supabase/admin';

/**
 * Verifica si un email está en la lista de administradores
 */
export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;

  const adminEmails = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim().toLowerCase()) || [];
  return adminEmails.includes(email.toLowerCase());
}

/**
 * Verifica si el usuario actual es admin
 * Retorna { isAdmin: boolean, user: User | null }
 */
export async function checkIsAdmin() {
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return { isAdmin: false, user: null };
  }

  const isAdmin = isAdminEmail(user.email);

  return { isAdmin, user };
}

/**
 * Middleware para proteger rutas admin
 * Retorna el usuario si es admin, o null si no lo es
 */
export async function requireAdmin() {
  const { isAdmin, user } = await checkIsAdmin();

  if (!isAdmin) {
    return null;
  }

  return user;
}

/**
 * Verifica si un usuario está bloqueado
 */
export async function isUserBlocked(userId: string): Promise<boolean> {
  const supabaseAdmin = createAdminClient();

  const { data } = await supabaseAdmin
    .from('user_metadata')
    .select('is_blocked')
    .eq('user_id', userId)
    .single();

  return data?.is_blocked || false;
}

/**
 * Bloquea o desbloquea un usuario
 */
export async function setUserBlockedStatus(
  userId: string,
  isBlocked: boolean,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabaseAdmin = createAdminClient();

  // Upsert en user_metadata
  const { error: metadataError } = await supabaseAdmin
    .from('user_metadata')
    .upsert({
      user_id: userId,
      is_blocked: isBlocked,
      blocked_at: isBlocked ? new Date().toISOString() : null,
      blocked_reason: isBlocked ? reason : null,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id'
    });

  if (metadataError) {
    return { success: false, error: metadataError.message };
  }

  // Si se bloquea, cancelar suscripción en Stripe
  if (isBlocked) {
    try {
      const stripe = (await import('@/src/lib/stripe/config')).stripe;

      // Buscar el customer_id del usuario
      const { data: subscription } = await supabaseAdmin
        .from('subscriptions')
        .select('stripe_customer_id, stripe_subscription_id')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      if (subscription?.stripe_subscription_id) {
        // Cancelar la suscripción en Stripe
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id);

        // Actualizar en base de datos
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: 'canceled',
            canceled_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.stripe_subscription_id);
      }
    } catch (stripeError) {
      console.error('Error canceling subscription:', stripeError);
      // No retornamos error aquí porque el bloqueo sí se aplicó
    }
  }

  return { success: true };
}
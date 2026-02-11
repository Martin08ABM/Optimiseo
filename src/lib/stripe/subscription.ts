import { stripe, STRIPE_CONFIG } from './config';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { supabaseAdmin } from '@/src/lib/supabase/admin';
import { revalidatePath } from 'next/cache';
import type Stripe from 'stripe';
import { validateDiscountCode } from '@/src/lib/admin/discounts';

/**
 * Create a Stripe customer for a user
 */
export async function createStripeCustomer(
  userId: string,
  email: string,
  name?: string
): Promise<string> {
  const customer = await stripe.customers.create({
    email,
    metadata: {
      supabase_user_id: userId,
    },
    name,
  });

  return customer.id;
}

/**
 * Create a checkout session for Pro plan
 */
export async function createCheckoutSession(
  userId: string,
  email: string,
  successUrl: string,
  cancelUrl: string,
  discountCode?: string | null
): Promise<{ sessionId: string; url: string | null }> {
  const supabase = await createServerSupabaseClient();

  // Get or create Stripe customer
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', userId)
    .single();

  let customerId = subscription?.stripe_customer_id;

  if (!customerId) {
    customerId = await createStripeCustomer(userId, email);

    // Update subscription with customer ID
    await supabase
      .from('subscriptions')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', userId);
  }

  // Validar código de descuento si se proporciona
  let stripeCouponId: string | undefined;
  let discountCodeId: string | undefined;

  if (discountCode) {
    // Precio Pro (hardcodeado, debería venir de config)
    const PRICE = 9.99;

    const validation = await validateDiscountCode(discountCode, userId, PRICE);

    if (validation.valid && validation.discount) {
      // Crear cupón temporal en Stripe
      const couponName = `${discountCode}-${userId}-${Date.now()}`;

      if (validation.discount.type === 'percentage') {
        const coupon = await stripe.coupons.create({
          percent_off: validation.discount.value,
          duration: 'once',
          name: couponName,
        });
        stripeCouponId = coupon.id;
      } else {
        // Descuento fijo - convertir a centavos
        const coupon = await stripe.coupons.create({
          amount_off: Math.round(validation.discount.value * 100),
          currency: STRIPE_CONFIG.currency,
          duration: 'once',
          name: couponName,
        });
        stripeCouponId = coupon.id;
      }

      discountCodeId = validation.discount.id;
    }
  }

  // Create checkout session
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: STRIPE_CONFIG.plans.pro.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      discount_code_id: discountCodeId || '',
    },
    subscription_data: {
      metadata: {
        user_id: userId,
      },
    },
  };

  // Aplicar cupón si existe
  if (stripeCouponId) {
    sessionConfig.discounts = [{ coupon: stripeCouponId }];
  }

  const session = await stripe.checkout.sessions.create(sessionConfig);

  return {
    sessionId: session.id,
    url: session.url,
  };
}

/**
 * Create a billing portal session
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
): Promise<string> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session.url;
}

/**
 * Handle successful checkout
 */
export async function handleCheckoutSuccess(
  session: Stripe.Checkout.Session
): Promise<void> {
  const userId = session.metadata?.user_id;
  console.log('[Webhook] handleCheckoutSuccess - userId:', userId);

  if (!userId) {
    throw new Error('No user_id in session metadata');
  }

  const subscription = session.subscription as string;
  const customerId = session.customer as string;

  // Get subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription);

  // Get period dates from first subscription item
  const firstItem = stripeSubscription.items.data[0];
  const currentPeriodStart = firstItem?.current_period_start;
  const currentPeriodEnd = firstItem?.current_period_end;

  const subscriptionData = {
    user_id: userId,
    plan_id: 'pro',
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription,
    status: 'active',
    current_period_start: currentPeriodStart
      ? new Date(currentPeriodStart * 1000).toISOString()
      : null,
    current_period_end: currentPeriodEnd
      ? new Date(currentPeriodEnd * 1000).toISOString()
      : null,
  };

  // Try update first
  const { data: updated, error: updateError } = await supabaseAdmin
    .from('subscriptions')
    .update(subscriptionData)
    .eq('user_id', userId)
    .select();

  if (updateError) {
    console.error('[Webhook] Error updating subscription:', updateError);
    throw new Error(`Failed to update subscription: ${updateError.message}`);
  }

  // If update matched 0 rows, the subscription row doesn't exist yet - insert it
  if (!updated || updated.length === 0) {
    console.log('[Webhook] No existing subscription row found, inserting new one for user:', userId);
    const { error: insertError } = await supabaseAdmin
      .from('subscriptions')
      .insert(subscriptionData);

    if (insertError) {
      console.error('[Webhook] Error inserting subscription:', insertError);
      throw new Error(`Failed to insert subscription: ${insertError.message}`);
    }
  }

  console.log('[Webhook] Subscription updated/created successfully for user:', userId);

  // Record payment
  const paymentIntent = session.payment_intent as string;
  const amount = session.amount_total || 0;

  const { data: subData } = await supabaseAdmin
    .from('subscriptions')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (subData?.id) {
    const { error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        subscription_id: subData.id,
        stripe_payment_intent_id: paymentIntent,
        amount: amount / 100,
        currency: STRIPE_CONFIG.currency,
        status: 'succeeded',
      });

    if (paymentError) {
      console.error('[Webhook] Error recording payment:', paymentError);
    }
  } else {
    console.error('[Webhook] Could not find subscription id to record payment');
  }

  // Registrar uso de código de descuento si aplica
  const discountCodeId = session.metadata?.discount_code_id;
  if (discountCodeId) {
    const originalAmount = 9.99; // Precio original
    const discountAmount = originalAmount - (amount / 100);

    if (discountAmount > 0) {
      const { error: discountError } = await supabaseAdmin
        .from('discount_code_usage')
        .insert({
          code_id: discountCodeId,
          user_id: userId,
          discount_amount: discountAmount,
          stripe_customer_id: customerId,
        });

      if (discountError) {
        console.error('[Webhook] Error recording discount usage:', discountError);
      } else {
        console.log('[Webhook] Discount code usage recorded:', discountCodeId);
      }
    }
  }

  // Revalidar el dashboard, pricing y homepage para reflejar los cambios
  revalidatePath('/dashboard');
  revalidatePath('/pricing');
  revalidatePath('/');
}

/**
 * Handle subscription updates from webhooks
 */
export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  const status = subscription.status;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  // Get period dates from first subscription item
  const firstItem = subscription.items.data[0];
  const currentPeriodStart = firstItem?.current_period_start;
  const currentPeriodEnd = firstItem?.current_period_end;

  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      status: status as any,
      current_period_start: currentPeriodStart
        ? new Date(currentPeriodStart * 1000).toISOString()
        : null,
      current_period_end: currentPeriodEnd
        ? new Date(currentPeriodEnd * 1000).toISOString()
        : null,
      cancel_at_period_end: cancelAtPeriodEnd,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating subscription:', error);
  }

  // Revalidar el dashboard, pricing y homepage para reflejar los cambios
  revalidatePath('/dashboard');
  revalidatePath('/pricing');
  revalidatePath('/');
}

/**
 * Handle subscription deletion/cancellation
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  // Downgrade to free plan
  const { error } = await supabaseAdmin
    .from('subscriptions')
    .update({
      plan_id: 'free',
      status: 'active',
      stripe_subscription_id: null,
      current_period_start: null,
      current_period_end: null,
      cancel_at_period_end: false,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error downgrading subscription:', error);
  }

  // Revalidar el dashboard, pricing y homepage para reflejar los cambios
  revalidatePath('/dashboard');
  revalidatePath('/pricing');
  revalidatePath('/');
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(
  stripeSubscriptionId: string,
  cancelAtPeriodEnd = true
): Promise<void> {
  if (cancelAtPeriodEnd) {
    await stripe.subscriptions.update(stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  } else {
    await stripe.subscriptions.cancel(stripeSubscriptionId);
  }
}

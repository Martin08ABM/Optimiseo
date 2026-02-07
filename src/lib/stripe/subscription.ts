import { stripe, STRIPE_CONFIG } from './config';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type Stripe from 'stripe';

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
  cancelUrl: string
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

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
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
    },
    subscription_data: {
      metadata: {
        user_id: userId,
      },
    },
  });

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
  const supabase = await createServerSupabaseClient();
  const userId = session.metadata?.user_id;

  if (!userId) {
    throw new Error('No user_id in session metadata');
  }

  const subscription = session.subscription as string;
  const customerId = session.customer as string;

  // Get subscription details from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(subscription);

  // Update subscription in database
  await supabase
    .from('subscriptions')
    .update({
      plan_id: 'pro',
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription,
      status: 'active',
      current_period_start: new Date(
        stripeSubscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        stripeSubscription.current_period_end * 1000
      ).toISOString(),
    })
    .eq('user_id', userId);

  // Record payment
  const paymentIntent = session.payment_intent as string;
  const amount = session.amount_total || 0;

  await supabase.from('payments').insert({
    subscription_id: (
      await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single()
    ).data?.id,
    stripe_payment_intent_id: paymentIntent,
    amount: amount / 100,
    currency: STRIPE_CONFIG.currency,
    status: 'succeeded',
  });

  // Revalidar el dashboard y la página de pricing para reflejar los cambios
  revalidatePath('/dashboard');
  revalidatePath('/pricing');
}

/**
 * Handle subscription updates from webhooks
 */
export async function handleSubscriptionUpdate(
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  const status = subscription.status;
  const cancelAtPeriodEnd = subscription.cancel_at_period_end;

  await supabase
    .from('subscriptions')
    .update({
      status: status as any,
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: cancelAtPeriodEnd,
    })
    .eq('user_id', userId);

  // Revalidar el dashboard para reflejar los cambios
  revalidatePath('/dashboard');
  revalidatePath('/pricing');
}

/**
 * Handle subscription deletion/cancellation
 */
export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  const userId = subscription.metadata.user_id;

  if (!userId) {
    console.error('No user_id in subscription metadata');
    return;
  }

  // Downgrade to free plan
  await supabase
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

  // Revalidar el dashboard para reflejar los cambios
  revalidatePath('/dashboard');
  revalidatePath('/pricing');
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

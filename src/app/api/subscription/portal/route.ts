import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { createBillingPortalSession } from '@/src/lib/stripe/subscription';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Create portal session
    const origin = req.headers.get('origin') || baseUrl;
    const url = await createBillingPortalSession(
      subscription.stripe_customer_id,
      `${origin}/dashboard`
    );

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

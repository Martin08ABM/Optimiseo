import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { createCheckoutSession } from '@/src/lib/stripe/subscription';

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

    // Get user email
    const email = user.email!;

    // Get optional discount code from body
    const body = await req.json().catch(() => ({}));
    const discountCode = body.discountCode || null;

    // Create checkout session
    const origin = req.headers.get('origin') || baseUrl;
    const { url } = await createCheckoutSession(
      user.id,
      email,
      `${origin}/dashboard?checkout=success`,
      `${origin}/dashboard?checkout=canceled`,
      discountCode
    );

    if (!url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

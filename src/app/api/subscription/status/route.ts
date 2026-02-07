import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import { getUserSubscription } from '@/src/lib/subscription/utils';

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription data
    const subscriptionData = await getUserSubscription(user.id);

    if (!subscriptionData) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    return NextResponse.json(subscriptionData);
  } catch (error) {
    console.error('Status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

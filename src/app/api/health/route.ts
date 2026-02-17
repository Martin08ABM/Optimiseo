import { NextResponse } from 'next/server';
import { createAdminClient } from '@/src/lib/supabase/admin';
import { stripe } from '@/src/lib/stripe/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, { status: string; latency?: number; error?: string }> = {};
  let allHealthy = true;

  // Check Supabase
  const supabaseAdmin = createAdminClient();
  const supabaseStart = Date.now();
  try {
    const { error } = await supabaseAdmin.from('plans').select('id').limit(1);
    if (error) throw error;
    checks.supabase = { status: 'healthy', latency: Date.now() - supabaseStart };
  } catch (err) {
    allHealthy = false;
    checks.supabase = {
      status: 'unhealthy',
      latency: Date.now() - supabaseStart,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  // Check Stripe
  const stripeStart = Date.now();
  try {
    await stripe.products.list({ limit: 1 });
    checks.stripe = { status: 'healthy', latency: Date.now() - stripeStart };
  } catch (err) {
    allHealthy = false;
    checks.stripe = {
      status: 'unhealthy',
      latency: Date.now() - stripeStart,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }

  const status = allHealthy ? 'healthy' : 'degraded';

  return NextResponse.json(
    { status, checks, timestamp: new Date().toISOString() },
    { status: allHealthy ? 200 : 503 }
  );
}

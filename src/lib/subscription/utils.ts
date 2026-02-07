import { createServerSupabaseClient } from '@/src/lib/supabase/server';
import type {
  UserSubscriptionData,
  UsageStats,
  Plan,
  Subscription,
} from '@/src/types/subscription';

/**
 * Get user's current subscription with plan details and usage stats
 */
export async function getUserSubscription(
  userId: string
): Promise<UserSubscriptionData | null> {
  const supabase = await createServerSupabaseClient();

  // Get subscription with plan details
  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*, plans(*)')
    .eq('user_id', userId)
    .single();

  if (subError || !subscription) {
    console.error('Error fetching subscription:', subError);
    return null;
  }

  // Calculate usage for today
  const usage = await getDailyUsage(userId);

  return {
    subscription: subscription as unknown as Subscription,
    plan: subscription.plans as unknown as Plan,
    usage,
  };
}

/**
 * Get daily usage stats for a user
 */
export async function getDailyUsage(userId: string): Promise<UsageStats> {
  const supabase = await createServerSupabaseClient();

  // Get user's plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id, plans(daily_analysis_limit)')
    .eq('user_id', userId)
    .single();

  const limit =
    (subscription?.plans as unknown as Plan)?.daily_analysis_limit || 5;

  // Get today's usage count
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from('analyses')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', today.toISOString());

  const used = count || 0;
  const remaining = Math.max(0, limit - used);

  // Calculate reset time (midnight tomorrow)
  const resetAt = new Date(today);
  resetAt.setDate(resetAt.getDate() + 1);

  return {
    used,
    limit,
    remaining,
    resetAt,
  };
}

/**
 * Check if user can perform an analysis
 */
export async function canPerformAnalysis(
  userId: string
): Promise<{ allowed: boolean; reason?: string; usage?: UsageStats }> {
  const subscriptionData = await getUserSubscription(userId);

  if (!subscriptionData) {
    return {
      allowed: false,
      reason: 'No subscription found',
    };
  }

  const { subscription, usage } = subscriptionData;

  // Check if subscription is active
  if (subscription.status !== 'active') {
    return {
      allowed: false,
      reason: 'Subscription is not active',
      usage,
    };
  }

  // Check if user has remaining analyses
  if (usage.remaining <= 0) {
    return {
      allowed: false,
      reason: 'Daily analysis limit reached',
      usage,
    };
  }

  return {
    allowed: true,
    usage,
  };
}

/**
 * Track an analysis in the database
 */
export async function trackAnalysis(
  userId: string,
  url: string,
  analysisType: string,
  result: Record<string, unknown>,
  scrapedData?: Record<string, unknown>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerSupabaseClient();

  // Get user's current plan
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .single();

  if (!subscription) {
    return { success: false, error: 'No subscription found' };
  }

  // Insert analysis record
  const { error } = await supabase.from('analyses').insert({
    user_id: userId,
    url,
    analysis_type: analysisType,
    result,
    scraped_data: scrapedData || null,
    plan_used: subscription.plan_id,
  });

  if (error) {
    console.error('Error tracking analysis:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Get user's analysis history
 */
export async function getAnalysisHistory(
  userId: string,
  limit = 30
): Promise<any[]> {
  const supabase = await createServerSupabaseClient();

  // Check if user has pro plan (only pro can access history)
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan_id')
    .eq('user_id', userId)
    .single();

  if (subscription?.plan_id !== 'pro') {
    return [];
  }

  // Get analyses from last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: analyses } = await supabase
    .from('analyses')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(limit);

  return analyses || [];
}

/**
 * Check if plan upgrade is needed for a feature
 */
export function requiresPro(planId: string): boolean {
  return planId !== 'pro';
}

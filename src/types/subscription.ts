export type PlanId = 'free' | 'pro';

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete';

export type AnalysisType =
  | 'readability-analyzer'
  | 'words-repetition'
  | 'coherency-evaluator'
  | 'keyword-suggestions'
  | 'rewrite'
  | 'monitoring-check';

export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded';

export interface Plan {
  id: PlanId;
  name: string;
  description: string | null;
  price_monthly: number;
  stripe_price_id: string | null;
  daily_analysis_limit: number;
  features: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: PlanId;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  url: string;
  analysis_type: AnalysisType;
  result: Record<string, unknown> | null;
  scraped_data: Record<string, unknown> | null;
  plan_used: PlanId;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  subscription_id: string;
  stripe_payment_intent_id: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  created_at: string;
}

export interface UsageStats {
  used: number;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export interface UserSubscriptionData {
  subscription: Subscription;
  plan: Plan;
  usage: UsageStats;
}

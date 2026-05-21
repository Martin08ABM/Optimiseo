-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create plans table
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    stripe_price_id TEXT,
    daily_analysis_limit INTEGER NOT NULL DEFAULT 5,
    features JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id TEXT REFERENCES public.plans(id) NOT NULL,
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_subscription UNIQUE (user_id)
);

-- Create analyses tracking table
CREATE TABLE IF NOT EXISTS public.analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    url TEXT,
    analysis_type TEXT NOT NULL,
    result JSONB,
    scraped_data JSONB,
    plan_used TEXT REFERENCES public.plans(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '[]'::jsonb
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT UNIQUE,
    amount DECIMAL(10,2),
    currency TEXT DEFAULT 'eur',
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '[]'::jsonb
);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for plans (public read)
CREATE POLICY "Plans are viewable by everyone" ON public.plans
    FOR SELECT USING (true);

-- Policies for subscriptions (users can only see their own)
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Policies for analyses (users can only see their own)
CREATE POLICY "Users can view own analyses" ON public.analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON public.analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for payments (users can only see their own)
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (
        subscription_id IN (
            SELECT id FROM public.subscriptions WHERE user_id = auth.uid()
        )
    );

-- Insert default plans
INSERT INTO public.plans (id, name, description, price_monthly, daily_analysis_limit, features, stripe_price_id) 
VALUES 
    (
        'free', 
        'Free', 
        'Plan gratuito con funcionalidades básicas', 
        0.00,
        5,
        '["Análisis de legibilidad", "Detección de palabras repetidas", "Evaluación de coherencia"]'::jsonb,
        NULL
    ),
    (
        'pro', 
        'Pro', 
        'Plan premium con funcionalidades avanzadas', 
        12.00,
        100,
        '["Análisis de legibilidad", "Detección de palabras repetidas", "Evaluación de coherencia", "Historial de análisis (30 días)", "Exportación PDF/JSON", "Soporte prioritario"]'::jsonb,
        'price_placeholder'
    )
ON CONFLICT (id) DO NOTHING;

-- Create function to assign free plan to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, 'free', 'active')
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON public.plans
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_analyses_user_id_created_at ON public.analyses(user_id, created_at DESC);
CREATE INDEX idx_analyses_created_at ON public.analyses(created_at);
CREATE INDEX idx_payments_subscription_id ON public.payments(subscription_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);

-- Create function to get daily usage for a user
CREATE OR REPLACE FUNCTION public.get_daily_usage(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    usage_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO usage_count
    FROM public.analyses
    WHERE user_id = user_uuid
    AND created_at >= CURRENT_DATE;
    
    RETURN COALESCE(usage_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can perform analysis
CREATE OR REPLACE FUNCTION public.can_perform_analysis(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    current_plan public.plans;
    daily_usage INTEGER;
BEGIN
    -- Get user's current plan
    SELECT p.* INTO current_plan
    FROM public.subscriptions s
    JOIN public.plans p ON s.plan_id = p.id
    WHERE s.user_id = user_uuid
    AND s.status = 'active';
    
    -- Get daily usage
    daily_usage := public.get_daily_usage(user_uuid);
    
    -- Check if user can perform analysis
    RETURN daily_usage < current_plan.daily_analysis_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.plans TO anon, authenticated;
GRANT ALL ON public.subscriptions TO anon, authenticated;
GRANT ALL ON public.analyses TO anon, authenticated;
GRANT ALL ON public.payments TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_usage TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.can_perform_analysis TO anon, authenticated;
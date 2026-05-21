-- Create cache table for analysis results
CREATE TABLE IF NOT EXISTS public.cache (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    type TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cache ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read/write cache
CREATE POLICY "Cache is accessible by authenticated users" ON public.cache
    FOR ALL USING (auth.role() = 'authenticated');

-- Create index for cleanup queries
CREATE INDEX idx_cache_expires_at ON public.cache(expires_at);
CREATE INDEX idx_cache_type ON public.cache(type);

-- Create function to cleanup expired cache
CREATE OR REPLACE FUNCTION public.cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.cache
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT ALL ON public.cache TO authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_cache TO authenticated;

-- Auto-cleanup expired entries once per day
CREATE OR REPLACE FUNCTION public.trigger_cache_cleanup()
RETURNS TRIGGER AS $$
BEGIN
    -- Clean up expired entries after insert/update
    PERFORM public.cleanup_expired_cache();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER auto_cleanup_cache
    AFTER INSERT OR UPDATE ON public.cache
    FOR EACH STATEMENT EXECUTE FUNCTION public.trigger_cache_cleanup();
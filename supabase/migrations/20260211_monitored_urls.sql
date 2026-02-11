-- Tabla para URLs monitorizadas periódicamente
CREATE TABLE IF NOT EXISTS monitored_urls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  frequency TEXT NOT NULL DEFAULT 'weekly',
  last_checked TIMESTAMPTZ,
  last_score INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, url)
);

-- Row Level Security
ALTER TABLE monitored_urls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own monitored URLs"
ON monitored_urls FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index para queries del cron
CREATE INDEX IF NOT EXISTS idx_monitored_urls_active
ON monitored_urls (is_active, frequency, last_checked);

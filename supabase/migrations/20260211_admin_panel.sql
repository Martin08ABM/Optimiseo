-- Tabla para metadata de usuarios (bloqueos, etc)
CREATE TABLE IF NOT EXISTS user_metadata (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  blocked_at TIMESTAMPTZ,
  blocked_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla para códigos de descuento
CREATE TABLE IF NOT EXISTS discount_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL CHECK (value > 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses_per_user INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla para registrar uso de códigos de descuento
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code_id UUID NOT NULL REFERENCES discount_codes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  used_at TIMESTAMPTZ DEFAULT now(),
  discount_amount NUMERIC NOT NULL,
  stripe_customer_id TEXT,
  UNIQUE(code_id, user_id)
);

-- Row Level Security
ALTER TABLE user_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_code_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para user_metadata (solo admins pueden modificar, usuarios pueden ver su propio estado)
CREATE POLICY "Users can view own metadata"
ON user_metadata FOR SELECT
USING (auth.uid() = user_id);

-- Políticas para discount_codes (solo lectura pública para validación)
CREATE POLICY "Anyone can view active codes"
ON discount_codes FOR SELECT
USING (is_active = true);

-- Políticas para discount_code_usage (usuarios ven su propio uso)
CREATE POLICY "Users can view own usage"
ON discount_code_usage FOR SELECT
USING (auth.uid() = user_id);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_user_metadata_blocked
ON user_metadata (is_blocked);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code
ON discount_codes (code) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_discount_code_usage_user
ON discount_code_usage (user_id);

CREATE INDEX IF NOT EXISTS idx_discount_code_usage_code
ON discount_code_usage (code_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_user_metadata_updated_at BEFORE UPDATE ON user_metadata
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON discount_codes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
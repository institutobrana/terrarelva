CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_methods_name ON payment_methods (name);
CREATE INDEX IF NOT EXISTS idx_payment_methods_active ON payment_methods (is_active);
CREATE INDEX IF NOT EXISTS idx_payment_methods_code ON payment_methods (code);

DROP TRIGGER IF EXISTS trigger_set_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER trigger_set_payment_methods_updated_at
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

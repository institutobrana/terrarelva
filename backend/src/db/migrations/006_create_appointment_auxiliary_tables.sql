CREATE TABLE IF NOT EXISTS appointment_reasons (
  id UUID PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  type VARCHAR(40) NOT NULL,
  color VARCHAR(20),
  productive_commitment BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_reasons_name ON appointment_reasons (name);
CREATE INDEX IF NOT EXISTS idx_appointment_reasons_active ON appointment_reasons (is_active);
CREATE INDEX IF NOT EXISTS idx_appointment_reasons_code ON appointment_reasons (code);
CREATE INDEX IF NOT EXISTS idx_appointment_reasons_type ON appointment_reasons (type);

DROP TRIGGER IF EXISTS trigger_set_appointment_reasons_updated_at ON appointment_reasons;
CREATE TRIGGER trigger_set_appointment_reasons_updated_at
BEFORE UPDATE ON appointment_reasons
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS appointment_statuses (
  id UUID PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  history TEXT,
  color VARCHAR(20),
  hide_appointment BOOLEAN NOT NULL DEFAULT FALSE,
  consider_client_no_show BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_statuses_name ON appointment_statuses (name);
CREATE INDEX IF NOT EXISTS idx_appointment_statuses_active ON appointment_statuses (is_active);
CREATE INDEX IF NOT EXISTS idx_appointment_statuses_code ON appointment_statuses (code);

DROP TRIGGER IF EXISTS trigger_set_appointment_statuses_updated_at ON appointment_statuses;
CREATE TRIGGER trigger_set_appointment_statuses_updated_at
BEFORE UPDATE ON appointment_statuses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

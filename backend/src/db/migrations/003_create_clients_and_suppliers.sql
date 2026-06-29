CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY,
  full_name VARCHAR(180) NOT NULL,
  gender VARCHAR(40),
  birth_date DATE,
  internal_code VARCHAR(60),
  cpf VARCHAR(20),
  document_type_text VARCHAR(60),
  document_number VARCHAR(60),
  responsible_name VARCHAR(180),
  responsible_cpf VARCHAR(20),
  status_text VARCHAR(60),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_full_name ON clients (full_name);
CREATE INDEX IF NOT EXISTS idx_clients_internal_code ON clients (internal_code);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients (is_active);

CREATE TABLE IF NOT EXISTS client_phones (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  phone_type_text VARCHAR(60),
  ddd VARCHAR(4),
  phone_number VARCHAR(30) NOT NULL,
  extension VARCHAR(10),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_phones_client_id ON client_phones (client_id);
CREATE INDEX IF NOT EXISTS idx_client_phones_primary ON client_phones (client_id, is_primary);

CREATE TABLE IF NOT EXISTS client_emails (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  email_type_text VARCHAR(60),
  email CITEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_emails_client_id ON client_emails (client_id);
CREATE INDEX IF NOT EXISTS idx_client_emails_primary ON client_emails (client_id, is_primary);

CREATE TABLE IF NOT EXISTS client_addresses (
  id UUID PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  address_type_text VARCHAR(60),
  street VARCHAR(180),
  number VARCHAR(20),
  complement VARCHAR(120),
  district VARCHAR(120),
  city VARCHAR(120),
  state VARCHAR(80),
  zip_code VARCHAR(20),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_addresses_client_id ON client_addresses (client_id);
CREATE INDEX IF NOT EXISTS idx_client_addresses_primary ON client_addresses (client_id, is_primary);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY,
  trade_name VARCHAR(180) NOT NULL,
  company_name VARCHAR(180),
  cpf_cnpj VARCHAR(20),
  state_registration VARCHAR(60),
  website VARCHAR(180),
  segment_text VARCHAR(120),
  payment_details TEXT,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_trade_name ON suppliers (trade_name);
CREATE INDEX IF NOT EXISTS idx_suppliers_segment_text ON suppliers (segment_text);
CREATE INDEX IF NOT EXISTS idx_suppliers_is_active ON suppliers (is_active);

CREATE TABLE IF NOT EXISTS supplier_phones (
  id UUID PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES suppliers (id) ON DELETE CASCADE,
  phone_type_text VARCHAR(60),
  ddd VARCHAR(4),
  phone_number VARCHAR(30) NOT NULL,
  extension VARCHAR(10),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_phones_supplier_id ON supplier_phones (supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_phones_primary ON supplier_phones (supplier_id, is_primary);

CREATE TABLE IF NOT EXISTS supplier_emails (
  id UUID PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES suppliers (id) ON DELETE CASCADE,
  email_type_text VARCHAR(60),
  email CITEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_emails_supplier_id ON supplier_emails (supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_emails_primary ON supplier_emails (supplier_id, is_primary);

CREATE TABLE IF NOT EXISTS supplier_addresses (
  id UUID PRIMARY KEY,
  supplier_id UUID NOT NULL REFERENCES suppliers (id) ON DELETE CASCADE,
  address_type_text VARCHAR(60),
  street VARCHAR(180),
  number VARCHAR(20),
  complement VARCHAR(120),
  district VARCHAR(120),
  city VARCHAR(120),
  state VARCHAR(80),
  zip_code VARCHAR(20),
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_addresses_supplier_id ON supplier_addresses (supplier_id);
CREATE INDEX IF NOT EXISTS idx_supplier_addresses_primary ON supplier_addresses (supplier_id, is_primary);

DROP TRIGGER IF EXISTS trigger_set_clients_updated_at ON clients;
CREATE TRIGGER trigger_set_clients_updated_at
BEFORE UPDATE ON clients
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_client_phones_updated_at ON client_phones;
CREATE TRIGGER trigger_set_client_phones_updated_at
BEFORE UPDATE ON client_phones
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_client_emails_updated_at ON client_emails;
CREATE TRIGGER trigger_set_client_emails_updated_at
BEFORE UPDATE ON client_emails
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_client_addresses_updated_at ON client_addresses;
CREATE TRIGGER trigger_set_client_addresses_updated_at
BEFORE UPDATE ON client_addresses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_suppliers_updated_at ON suppliers;
CREATE TRIGGER trigger_set_suppliers_updated_at
BEFORE UPDATE ON suppliers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_supplier_phones_updated_at ON supplier_phones;
CREATE TRIGGER trigger_set_supplier_phones_updated_at
BEFORE UPDATE ON supplier_phones
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_supplier_emails_updated_at ON supplier_emails;
CREATE TRIGGER trigger_set_supplier_emails_updated_at
BEFORE UPDATE ON supplier_emails
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trigger_set_supplier_addresses_updated_at ON supplier_addresses;
CREATE TRIGGER trigger_set_supplier_addresses_updated_at
BEFORE UPDATE ON supplier_addresses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

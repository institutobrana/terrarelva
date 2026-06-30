CREATE TABLE IF NOT EXISTS indication_types (
  id UUID PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indication_types_name ON indication_types (name);
CREATE INDEX IF NOT EXISTS idx_indication_types_active ON indication_types (is_active);
CREATE INDEX IF NOT EXISTS idx_indication_types_code ON indication_types (code);

DROP TRIGGER IF EXISTS trigger_set_indication_types_updated_at ON indication_types;
CREATE TRIGGER trigger_set_indication_types_updated_at
BEFORE UPDATE ON indication_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS supplier_segments (
  id UUID PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supplier_segments_name ON supplier_segments (name);
CREATE INDEX IF NOT EXISTS idx_supplier_segments_active ON supplier_segments (is_active);
CREATE INDEX IF NOT EXISTS idx_supplier_segments_code ON supplier_segments (code);

DROP TRIGGER IF EXISTS trigger_set_supplier_segments_updated_at ON supplier_segments;
CREATE TRIGGER trigger_set_supplier_segments_updated_at
BEFORE UPDATE ON supplier_segments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS material_groups (
  id UUID PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_material_groups_name ON material_groups (name);
CREATE INDEX IF NOT EXISTS idx_material_groups_active ON material_groups (is_active);
CREATE INDEX IF NOT EXISTS idx_material_groups_code ON material_groups (code);

DROP TRIGGER IF EXISTS trigger_set_material_groups_updated_at ON material_groups;
CREATE TRIGGER trigger_set_material_groups_updated_at
BEFORE UPDATE ON material_groups
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS client_occupations (
  id UUID PRIMARY KEY,
  code VARCHAR(60) NOT NULL UNIQUE,
  name VARCHAR(180) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_occupations_name ON client_occupations (name);
CREATE INDEX IF NOT EXISTS idx_client_occupations_active ON client_occupations (is_active);
CREATE INDEX IF NOT EXISTS idx_client_occupations_code ON client_occupations (code);

DROP TRIGGER IF EXISTS trigger_set_client_occupations_updated_at ON client_occupations;
CREATE TRIGGER trigger_set_client_occupations_updated_at
BEFORE UPDATE ON client_occupations
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

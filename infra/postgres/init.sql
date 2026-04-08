-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- TENANTS TABLE
CREATE TABLE IF NOT EXISTS tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) UNIQUE NOT NULL,
  plan          VARCHAR(50) DEFAULT 'starter' 
                CHECK (plan IN ('starter','pro','enterprise')),
  settings      JSONB DEFAULT '{}',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email           VARCHAR(255) UNIQUE NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  first_name      VARCHAR(100),
  last_name       VARCHAR(100),
  role            VARCHAR(50) DEFAULT 'viewer' 
                  CHECK (role IN ('admin','purchaser','viewer','supplier')),
  permissions     TEXT[] DEFAULT '{}',
  mfa_enabled     BOOLEAN DEFAULT false,
  last_login      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id         UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name              VARCHAR(255) NOT NULL,
  api_endpoint      TEXT,
  feed_type         VARCHAR(50) 
                    CHECK (feed_type IN ('api','csv','excel','webhook')),
  credentials       JSONB DEFAULT '{}',
  sync_schedule     VARCHAR(100) DEFAULT '0 */6 * * *',
  reliability_score FLOAT DEFAULT 1.0,
  is_active         BOOLEAN DEFAULT true,
  last_synced_at    TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  vendor_id       UUID REFERENCES vendors(id) ON DELETE SET NULL,
  sku             VARCHAR(255) NOT NULL,
  name            VARCHAR(500) NOT NULL,
  category        VARCHAR(255),
  base_price      DECIMAL(12,2),
  unit            VARCHAR(50),
  stock_qty       INTEGER DEFAULT 0,
  attributes      JSONB DEFAULT '{}',
  normalized_data JSONB DEFAULT '{}',
  is_active       BOOLEAN DEFAULT true,
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenant_id, sku)
);

-- ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id              UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  buyer_id               UUID REFERENCES users(id),
  status                 VARCHAR(50) DEFAULT 'draft'
                         CHECK (status IN 
                         ('draft','confirmed','processing',
                          'fulfilled','cancelled')),
  line_items             JSONB DEFAULT '[]',
  total_amount           DECIMAL(14,2),
  ai_suggested_price     DECIMAL(14,2),
  consolidation_group_id UUID,
  notes                  TEXT,
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW(),
  fulfilled_at           TIMESTAMPTZ
);

-- AGGREGATION RULES TABLE
CREATE TABLE IF NOT EXISTS aggregation_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name        VARCHAR(255) NOT NULL,
  conditions  JSONB DEFAULT '{}',
  actions     JSONB DEFAULT '{}',
  priority    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id   UUID REFERENCES tenants(id),
  user_id     UUID REFERENCES users(id),
  action      VARCHAR(255) NOT NULL,
  entity      VARCHAR(100),
  entity_id   UUID,
  old_data    JSONB,
  new_data    JSONB,
  ip_address  INET,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_products_tenant   ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_products_sku      ON products(tenant_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_tenant     ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_buyer      ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_audit_tenant      ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);

-- SEED DATA (Demo tenant + Admin user)
-- Admin password: Admin@1234
INSERT INTO tenants (id, name, slug, plan)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Tenant', 'demo', 'enterprise'
) ON CONFLICT DO NOTHING;

INSERT INTO users (
  tenant_id, email, password_hash,
  first_name, last_name, role
)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'admin@demo.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4tbQOM5G4W',
  'Admin', 'User', 'admin'
) ON CONFLICT DO NOTHING;

SELECT 'Database initialized successfully' AS status;
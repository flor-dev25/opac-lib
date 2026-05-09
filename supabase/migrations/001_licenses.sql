-- M015 S01-T01/T02: License Activation Schema
-- Run against Supabase project: gjtgotwduereuzpjiinw
-- Via: psql $SUPABASE_DB_POOLER_URL -f supabase/migrations/001_licenses.sql

-- ============================================================
-- Table: licenses
-- Stores SHA-256 hash of each key. Raw key is NEVER persisted.
-- ============================================================
CREATE TABLE IF NOT EXISTS licenses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key_hash TEXT NOT NULL UNIQUE,       -- SHA-256(raw_key), hex-encoded
  customer_email   TEXT,                       -- purchaser contact
  product_version  TEXT DEFAULT 'v1.0',        -- InfoLib version tied to key
  is_active        BOOLEAN DEFAULT true,       -- false = revoked
  max_activations  INTEGER DEFAULT 1,          -- seats per key
  expires_at       TIMESTAMPTZ,                -- NULL = perpetual license
  notes            TEXT,                       -- admin-only remarks
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Fast lookup by hash
CREATE INDEX IF NOT EXISTS idx_licenses_hash ON licenses(license_key_hash);

-- ============================================================
-- Table: activations
-- Tracks which machines have consumed a license slot.
-- ============================================================
CREATE TABLE IF NOT EXISTS activations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id        UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  machine_id        TEXT NOT NULL,             -- SHA-256(hostname + vol_serial)
  machine_label     TEXT,                      -- human-readable, e.g. "GJC-PC-01"
  activated_at      TIMESTAMPTZ DEFAULT now(),
  last_validated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(license_id, machine_id)               -- one activation per machine per license
);

-- ============================================================
-- Row Level Security
-- Only the service_role key can read/write these tables.
-- The Edge Function uses service_role internally.
-- ============================================================
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activations ENABLE ROW LEVEL SECURITY;

-- No public policies = anon/authenticated keys cannot access directly.
-- Edge Function uses SUPABASE_SERVICE_ROLE_KEY → bypasses RLS.

-- ============================================================
-- Auto-update updated_at on licenses
-- ============================================================
CREATE OR REPLACE FUNCTION update_licenses_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_licenses_updated_at
  BEFORE UPDATE ON licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_licenses_timestamp();

-- M015 S01-T05: Seed test license keys
-- Run after 001_licenses.sql
-- These are TEST keys only. Production keys are generated via scripts/generate-license-key.ts

-- Pre-computed SHA-256 hashes:
-- "INFL-TESTVAL1-TESTVAL2-TESTVAL3" → hash below
-- "INFL-REVOKED1-REVOKED2-REVOKED3" → hash below
-- "INFL-EXPIRED1-EXPIRED2-EXPIRED3" → hash below

-- Key 1: Valid, active, perpetual (no expiry)
INSERT INTO licenses (license_key_hash, customer_email, product_version, is_active, max_activations, expires_at, notes)
VALUES (
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', -- placeholder hash
  'test@gjc.edu.ph',
  'v1.0',
  true,
  1,
  NULL,
  'Test key: valid, perpetual, single-seat'
);

-- Key 2: Revoked
INSERT INTO licenses (license_key_hash, customer_email, product_version, is_active, max_activations, expires_at, notes)
VALUES (
  'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2', -- placeholder hash
  'revoked@gjc.edu.ph',
  'v1.0',
  false,
  1,
  NULL,
  'Test key: revoked'
);

-- Key 3: Expired
INSERT INTO licenses (license_key_hash, customer_email, product_version, is_active, max_activations, expires_at, notes)
VALUES (
  'b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3', -- placeholder hash
  'expired@gjc.edu.ph',
  'v1.0',
  true,
  1,
  '2025-01-01T00:00:00Z',  -- already expired
  'Test key: expired'
);

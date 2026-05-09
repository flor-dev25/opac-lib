# M015 — Software License Activation

## Objective
Implement a cryptographically secure license key system that gates installation of InfoLib via NSIS. Each key is provisioned in Supabase, verified online at install time, and machine-bound on first activation. Installer blocks if key is invalid, already used, or revoked.

## Business Context
- **Target**: GJC Library administrators purchasing InfoLib.
- **Format**: 32-character alphanumeric key split into 4×8 groups (e.g., `INFL-ABCD1234-EFGH5678-IJKL9012`).
- **Validation**: NSIS calls a Supabase Edge Function via `InetLoad` / `nsJSON` plugin to verify the key + collect machine fingerprint.
- **Activation**: One key → one machine (max 1 activation; expandable via `max_activations`).
- **Revocation**: Admin toggles `is_active = false` in Supabase; next install/heartbeat fails.
- **Storage**: Activated key written to `db_config.json` under `license_key` field for runtime heartbeat.

## License Key Format

```
INFL-XXXXXXXX-XXXXXXXX-XXXXXXXX
│    │        │         │
│    Block A  Block B   Block C
└─ Product Prefix (fixed)

Alphabet: ABCDEFGHJKLMNPQRSTUVWXYZ23456789
(Removes: 0,O,I,1 → avoids typo confusion)
Length: 29 chars total (4 prefix + 3 dashes + 24 payload)
Payload entropy: 24 chars × ~5 bits = ~120 bits
```

Key generation (server-side only): `HMAC-SHA256(product_id + customer_id + issued_at, SERVER_SECRET)` → Base32-encode first 15 bytes → chunk into 3×8.

## Supabase Schema

```sql
-- licenses table
CREATE TABLE licenses (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key_hash TEXT NOT NULL UNIQUE,   -- SHA-256(raw_key)
  customer_email   TEXT,
  product_version  TEXT DEFAULT 'v1.0',
  is_active        BOOLEAN DEFAULT true,
  max_activations  INTEGER DEFAULT 1,
  expires_at       TIMESTAMPTZ,            -- NULL = perpetual
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- activations table
CREATE TABLE activations (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_id        UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  machine_id        TEXT NOT NULL,          -- SHA-256(hostname + volume_serial)
  machine_label     TEXT,                   -- human-readable "GJC-PC-01"
  activated_at      TIMESTAMPTZ DEFAULT now(),
  last_validated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(license_id, machine_id)
);

-- index for fast key lookup
CREATE INDEX idx_licenses_hash ON licenses(license_key_hash);

-- RLS: only service-role key can mutate
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE activations ENABLE ROW LEVEL SECURITY;
```

## Supabase Edge Function: `verify-license`

**Endpoint**: `POST /functions/v1/verify-license`
**Auth**: Supabase anon key (public; rate-limited by Edge runtime).

**Request body**:
```json
{
  "license_key": "INFL-ABCD1234-EFGH5678-IJKL9012",
  "machine_id":  "sha256-of-hostname-volserial",
  "machine_label": "GJC-PC-01"
}
```

**Response codes**:
| Code | Meaning |
|------|---------|
| 200 `{ "status": "activated" }` | Valid, newly activated |
| 200 `{ "status": "already_yours" }` | Same machine re-running installer |
| 400 `{ "error": "invalid_key" }` | Key not found in DB |
| 403 `{ "error": "revoked" }` | `is_active = false` |
| 403 `{ "error": "expired" }` | `expires_at` in the past |
| 409 `{ "error": "max_activations_reached" }` | Too many machines |

## Slices

### S01 — Supabase Schema & Edge Function
- [ ] T01: Create `licenses` table with RLS in Supabase dashboard
- [ ] T02: Create `activations` table with RLS + unique constraint
- [ ] T03: Deploy `verify-license` Edge Function (Deno/TypeScript)
- [ ] T04: Test all response codes via `curl` / Postman
- [ ] T05: Seed at least 3 test license keys (1 valid, 1 revoked, 1 expired)

### S02 — NSIS License Page
- [ ] T01: Add `nsDialogs` license key input page to `installer_hooks.nsh` (PREINSTALL hook)
- [ ] T02: Collect machine fingerprint (hostname + volume serial via `GetVolumeInformation`)
- [ ] T03: Call Edge Function via `InetLoad` plugin → parse JSON response via `nsJSON`
- [ ] T04: Block install if response is not `activated` / `already_yours`
- [ ] T05: Show GJC-branded error dialogs for each error code (invalid, revoked, expired, maxed)

### S03 — Config Persistence & Runtime Heartbeat
- [ ] T01: Write `license_key` + `machine_id` + `activated_at` to `db_config.json`
- [ ] T02: Implement `validate_license` Tauri command in Rust (reads `db_config.json`, pings Edge Function)
- [ ] T03: Call `validate_license` on app startup; block UI if response is not valid
- [ ] T04: Graceful offline fallback: allow 30-day grace period without heartbeat (store `last_validated_at` locally)

### S04 — Admin Key Management (Optional v1.1)
- [ ] T01: Simple web dashboard (Supabase Studio or Retool) to provision/revoke keys
- [ ] T02: Email delivery of key on purchase

## Architecture Diagram

```
[Admin Provisions Key]
      │
      ▼
Supabase: licenses table (key_hash stored, never raw key)
      │
      │  (Install Time)
      ▼
NSIS Custom Page: "Enter License Key"
      │
      ├─ Compute machine_id = SHA256(hostname + vol_serial)
      │
      ├─► POST /functions/v1/verify-license
      │         { license_key, machine_id, machine_label }
      │
      ├─ 200 activated     → Continue install
      ├─ 200 already_yours → Continue install (re-install safe)
      ├─ 400/403/409       → Block install, show error dialog
      │
      ▼
db_config.json ← writes license_key + machine_id + activated_at
      │
      │  (Runtime)
      ▼
Tauri startup → validate_license command
      ├─► POST /functions/v1/verify-license (heartbeat)
      ├─ Valid   → App loads normally
      ├─ Invalid → Lock UI, show "License Invalid" overlay
      └─ Offline → Check last_validated_at; 30-day grace
```

## Files to Create/Modify

| File | Action |
|------|--------|
| `src-tauri/installer_hooks.nsh` | Add S02 license key page (PREINSTALL) |
| `src-tauri/src/commands/license.rs` | New — `validate_license` Tauri command |
| `src-tauri/src/settings.rs` | Add `license_key`, `machine_id` to `AppConfig` |
| `supabase/functions/verify-license/index.ts` | New — Edge Function |
| `supabase/migrations/001_licenses.sql` | New — Schema migration |
| `docs/LICENSE-FLOW.md` | New — Full license flow documentation |
| `.gsd/milestones/M015/M015-PLAN.md` | This file |
| `.gsd/STATE.md` | Update active milestone |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Edge Function unreachable at install time | Medium | High | Show clear "network required" message; do not silently skip |
| Machine ID changes (hardware swap) | Low | Medium | Allow admin to reset activation in Supabase |
| Key brute-forced (short payload) | Low | Low | 120-bit entropy + rate limiting on Edge Function |
| NSIS plugin `InetLoad` / `nsJSON` not bundled | Medium | High | Include plugins in `src-tauri/nsis-plugins/` |
| Supabase anon key exposed in NSIS binary | Medium | Medium | Edge Function validates server-side; anon key alone can't read raw keys |

## Success Criteria
- [ ] Fresh install blocks with no or invalid key.
- [ ] Valid key activates machine and continues installation.
- [ ] Same machine re-installs without consuming another activation slot.
- [ ] Revoked key blocks install with a clear error message.
- [ ] `db_config.json` contains `license_key` and `machine_id` after install.
- [ ] App heartbeat on startup validates the license online (with 30-day offline grace).

## Decisions Logged
- D098: License key format `INFL-XXXXXXXX-XXXXXXXX-XXXXXXXX` (29 chars, Base32 custom alphabet, strips 0/O/I/1).
- D099: Store SHA-256 hash of key in Supabase, never raw key.
- D100: Machine binding via `SHA256(hostname + volume_serial_number)`.
- D101: Supabase Edge Function (Deno) for verification — never trust client-side validation alone.
- D102: 30-day offline grace period stored in `db_config.json` via `last_validated_at`.
- D103: NSIS `InetLoad` + `nsJSON` plugins handle HTTP + JSON parsing in installer.

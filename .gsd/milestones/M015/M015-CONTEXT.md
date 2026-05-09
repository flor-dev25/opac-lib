# M015: License Activation — Context

**Gathered:** 2026-05-09
**Status:** Ready for planning

## Why This Milestone
InfoLib is deployed to institutional buyers (schools, libraries). A license gate controls distribution, enables revocation, and provides an audit trail.

## Key Constraints
- Installer: NSIS (Tauri v2, `["nsis"]` target — D097).
- Target: Windows 11 at GJC Library.
- Network available at install time; heartbeat must handle offline gracefully.

## NSIS Plugin Dependencies
Place in `src-tauri/nsis-plugins/`:
- **InetLoad** — HTTP POST from NSIS.
- **nsJSON** — JSON parsing in NSIS.
- Fallback: `nsExec::ExecToStack` + embedded PowerShell for HTTP + JSON.

## Machine Fingerprint Strategy
`SHA256(hostname + volume_serial_of_C:\)` computed via PowerShell one-liner in NSIS.

## Supabase Integration
- Project: `gjtgotwduereuzpjiinw` (existing).
- New tables: `licenses`, `activations`.
- Edge Function URL: `https://gjtgotwduereuzpjiinw.supabase.co/functions/v1/verify-license`
- Use `SUPABASE_SERVICE_ROLE_KEY` inside Edge Function; anon key in NSIS is safe.

## Config Fields Added to `db_config.json`
```json
{
  "license_key": "INFL-ABCD1234-EFGH5678-IJKL9012",
  "machine_id": "<sha256-hex>",
  "last_validated_at": "2026-05-09T11:52:00Z"
}
```

## Rust Heartbeat
`validate_license` Tauri command in `src-tauri/src/commands/license.rs`.
Reads config → POSTs Edge Function → 30-day offline grace via `last_validated_at`.

## Key Generation
Server-side script only. `HMAC-SHA256(customerId+productId+issuedAt, SERVER_SECRET)` → Base32 first 15 bytes → 24-char payload → `INFL-XXXXXXXX-XXXXXXXX-XXXXXXXX`. Store SHA-256 hash in Supabase, never raw key.

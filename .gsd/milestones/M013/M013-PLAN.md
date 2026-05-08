# M013 — LMS-01 Offline Installer

## Objective
Deliver a professional, GJC-branded NSIS offline installer that provisions PostgreSQL 16+, bundles Ollama (Phi-3), auto-detects existing installations, creates the `lib_mgmt` database with a service user, and writes `db_config.json` to `%APPDATA%` for first-boot consumption.

## Business Context
- Target: **Windows 11** machines in the GJC Library with no guaranteed internet.
- All dependencies (PostgreSQL, Ollama) must be bundled inside the installer EXE.
- Installer must be "Install Safe" — detect existing PG/Ollama and skip redundant installs.
- Institutional branding: GJC Green (#00401A) / Gold (#C5A059) color scheme on header/sidebar images.
- Credential page allows librarian to set DB host/port/user/pass/name at install time.

## Success Criteria
1. `tauri build` produces a single `.exe` installer with GJC branding.
2. Installer detects existing PostgreSQL (via PATH, service, file path) and skips bundled install.
3. Installer detects existing Ollama (via PATH, API, file path) and skips bundled install.
4. Bundled PostgreSQL is extracted to `$INSTDIR\pgsql`, initialized with `initdb`, started, and database+user created.
5. Bundled Ollama is extracted to `$INSTDIR\ollama`.
6. Custom NSIS page collects DB credentials (host, port, user, pass, db name).
7. `db_config.json` written to `%APPDATA%\ph.edu.gendejesus.infolib\` with `database_url` from credentials.
8. `INFOLIB_HOME` env var set in registry for app to locate bundled deps.
9. Uninstaller stops bundled PG and cleans registry.
10. 100% offline parity — zero network calls during install.

## Slices

### S01 — NSIS Configuration & Branding
- [x] T01: Configure `tauri.conf.json` NSIS bundler with custom template
- [x] T02: Set `headerImage`, `sidebarImage`, `installerIcon` with GJC branding
- [x] T03: Reference `installer_hooks.nsh` via `installerHooks`
- [x] T04: LZMA compression enabled
- [x] T05: `installMode: "both"` (per-user or all-users)

### S02 — PostgreSQL Auto-Provisioning
- [x] T01: Detection logic — `where pg_ctl` / `sc query postgresql-x64-*` / file path scan (16-18)
- [x] T02: Bundled PG extraction to `$INSTDIR\pgsql` from `deps\pgsql\`
- [x] T03: `initdb -D data -U $DbUser -E UTF8 --no-locale`
- [x] T04: `pg_ctl start` + 3s sleep for readiness
- [x] T05: `ALTER USER ... PASSWORD` + `createdb`
- [x] T06: Skip-if-exists for re-install safety
- [x] T07: Extended detection to cover PG 16 and 17 paths

### S03 — Ollama Bundling
- [x] T01: Detection logic — `where ollama` / API ping / file path scan
- [x] T02: Bundled Ollama extraction to `$INSTDIR\ollama` from `deps\ollama\`
- [x] T03: Skip-if-exists logic

### S04 — Credential Setup & Config
- [x] T01: Custom NSIS page with Host/Port/User/Pass/DB fields
- [x] T02: Pre-fill defaults (localhost / 5432 / postgres / [blank] / infolib)
- [x] T03: Detection status shown on credential page
- [x] T04: `db_config.json` written to `%APPDATA%\ph.edu.gendejesus.infolib\`
- [x] T05: Extend db_config.json with `pg_home` and `ollama_home` paths for runtime dep location
- [x] T06: `INFOLIB_HOME` registry key in `HKCU\Environment`

### S05 — Uninstaller Hooks
- [x] T01: Stop bundled PG via `pg_ctl stop -m fast`
- [x] T02: Clean `INFOLIB_HOME` registry key
- [x] T03: Leave `db_config.json` (user data) — do NOT delete on uninstall

## Architecture
```
NSIS Installer (.exe)
  ├─ PREINSTALL Hook
  │   ├─ Detect System PostgreSQL (3 methods)
  │   ├─ Detect System Ollama (3 methods)
  │   └─ Show Custom DB Credentials Page
  │
  ├─ POSTCOPY Hook
  │   ├─ Extract & Init PostgreSQL (if not found)
  │   │   ├─ initdb → data cluster
  │   │   ├─ pg_ctl start
  │   │   ├─ ALTER USER password
  │   │   └─ createdb
  │   ├─ Extract Ollama (if not found)
  │   ├─ Write db_config.json → %APPDATA%
  │   └─ Set INFOLIB_HOME → Registry
  │
  └─ PREUNINSTALL Hook
      ├─ pg_ctl stop (bundled only)
      └─ Clean INFOLIB_HOME registry
```

## Files Modified/Created
| File | Action |
|------|--------|
| `src-tauri/tauri.conf.json` | Updated — NSIS config with branding |
| `src-tauri/installer_hooks.nsh` | Updated — Full installer logic |
| `src-tauri/icons/header.bmp` | Existing — GJC branded header |
| `src-tauri/icons/sidebar.bmp` | Existing — GJC branded sidebar |
| `.gsd/milestones/M013/M013-PLAN.md` | Created — This plan |

## Risk Assessment
| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Bundled PG binaries too large | Medium | Medium | LZMA compression, portable build |
| initdb fails on locked dirs | Low | High | Check `$INSTDIR\pgsql\data` existence first |
| Password with special chars | Medium | Medium | NSIS string escaping in psql command |
| Ollama model not pre-pulled | High | Medium | Document post-install `ollama pull phi3` step |
| Re-install overwrites config | Medium | High | Skip-if-exists checks + preserve db_config.json |

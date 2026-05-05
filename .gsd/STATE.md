# GSD State

**Active Milestone:** M007 — Distribution & Premium Deployment (DONE)
**Active Milestone:** M008 — Legacy Data Migration
**Active Slice:** S03 — High-Performance Batch Import
**Active Task:** Execute sanitized SQL import
**Phase:** Execution

## Recent Decisions
- D001: Use React + Tailwind for UI implementation (Parity-first).
- D002: Use Lucide-React for iconography (Modern equivalent).
- D003: Strictly follow beveled border styling for legacy parity.
- D004: Removed Sidebar navigation in favor of a top-heavy Toolbar to match wireframe 003-dashboard-main.
- D005: Implemented high-density DataGrid with sticky headers for catalog browsing.
- D026: Added Basic/Advanced mode toggle in the top Toolbar. Basic mode shows New, Delete, Export, Authority, About, and Exit.
- D027: Resolved missing database state initialization in Tauri run loop and fixed PostgreSQL case-sensitivity in migrations.
- D028: Analyzed legacy "Edit" wireframes (010, 011) to ensure full parity of the catalog update and holdings management workflow.
- D029: Planned S04 to implement the full Edit Catalog Record workflow.
- D030: Holdings management will be implemented as a sub-panel within the Edit Dialog.
- D031: Enforced 20 items per page limit for "No-Scroll" UI parity.
- D032: Implemented classic "Record Navigator" (Page X of Y) for dashboard data navigation.
- D033: Used psql for bulk import of 16,000+ legacy records.
- D034: Reset database to full legacy schema for 100% data parity.
- D035: Selected Phi-3 Mini via Ollama for offline-first AI privacy (Transitioned from Gemma 4 per user request).
- D036: Chose pgvector for integrated semantic search in PostgreSQL.
- D037: Designed AI Badge with dynamic opacity (30% idle, 100% hover) to prevent UI clutter.
- D006: Adopted Caveman plugin for communication to reduce token usage (~75% reduction).
- D007: Implemented auto-generating timestamp ID (Control No) and full bibliographic form validation.
- D008: Centralized global dialog management in MainLayout for multi-context access.
- D009: Implemented global catalogStore (Zustand) to sync selection between Dashboard and Toolbar actions.
- D010: Context-aware Toolbar 'New' button based on current route.
- D011: Unified Patron state in patronStore using idno as primary identifier.
- D012: Added Edit button and double-click to edit support in DataGrid.
- D013: Implemented transactional Borrowing workflow in Rust with automatic DueDate calculation.
- D014: Integrated CheckoutDialog with real-time active loan monitoring.
- D015: Implemented Return logic with automatic fine calculation and account accumulation.
- D017: Implemented Circulation Dashboard with real-time statistics and overdue reporting.
- D018: Initiated M004 for financial reconciliation and inventory management.
- D019: Implemented atomic fine payment logic with GREATEST safety floor.
- D020: Integrated PaymentDialog with high-density balance visualization.
- D021: Implemented Inventory Audit (Shelf-Read) with automatic last_audit timestamping and Missing status auto-recovery.
- D022: Implemented Financial Reporting with transactional payment recording in tblFineCode.
- D023: Implemented Acquisitions Reporting with date_acquired tracking and multi-criteria filtering.
- D024: Implemented Authority Control backend and frontend for centralized Author and Subject management.
- D025: Implemented Item Reservations queue using tblReserve with serve/cancel workflow and 7-day expiry.
- D038: Built pgvector v0.8.2 from source via VS2022 and installed into PostgreSQL 18. Extension verified operational.
- D039: Connected Tauri backend to local Ollama (nomic-embed-text) for real-time query vectorization and semantic catalog search.
- D040: Upgraded AI system prompt to behave like a natural conversational partner (similar to famous chatbots) instead of a mechanical search robot.
- D041: Adopted General de Jesus College (GJC) color scheme for the installer and premium UI elements (Primary: #00401A, Secondary: #C5A059).
- D042: Selected Tauri v2 NSIS bundling for "colorized" MSI/EXE with custom branding templates.
- D043: Bundle PostgreSQL + Ollama inside NSIS installer EXE (not sidecars).
- D044: Implemented secure settings export/import for backup on external drives.
- D045: Enabled user-configurable database credentials via the application setup flow.
- D046: Custom NSIS credentials page writes db_config.json to %APPDATA% during install.
- D047: Dependencies extracted to $INSTDIR subdirectories for full portability.
- D048: NSIS auto-detects existing PostgreSQL/Ollama installations — skips bundled install if found.
- D049: Removed SetupPage first-boot intercept. Login is first screen. Settings accessible from Toolbar.
- D050: Registered tauri-plugin-dialog and tauri-plugin-shell in Rust builder to fix settings crash.
- D051: Applied glassmorphism and GJC branding to all premium dialogs.
- D052: Refactored SettingsPage into a tabbed interface with system status monitoring.
- D053: Sanitized legacy SQL dump to fix Mojibake using byte-level replacement script.
- D054: Source data identified as PostgreSQL SQL dump in docs/legacy-database/.

## Blockers
- ~~B001: `pgvector` extension binary not found on PostgreSQL host.~~ **RESOLVED** — pgvector v0.8.2 installed and verified.
- **B002**: Awaiting final raw data export from GJC Library legacy terminal.

## Next Action
Analyze `migration_log.txt` and raw export files to map legacy fields to PostgreSQL schema.

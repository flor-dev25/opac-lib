# GSD State

**Active Milestone:** M005 — Authority Control & Advanced Services
**Active Slice:** S04 — Catalog Record Refinement
**Active Task:** T06 — Grid Integration
**Active Task:** T07 — Pagination UI
**Phase:** Planning

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

## Blockers
- None

## Next Action
Plan and implement Loan Renewals (S03).

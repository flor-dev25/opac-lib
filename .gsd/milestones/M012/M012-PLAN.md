# M012-PLAN: Attendance System & Installer Split

## Vision
Implement a dual-purpose installer and a dedicated Attendance System. The installer allows selecting between the **Admin System** (Cataloging/Server) and the **Attendance Client** (Door PC). The Admin system handles student data import and API broadcasting, while the Client provides a touch-friendly UI for student check-ins with reason selection and motivational quotes.

## Proposed Slice: S01 — Multi-Component Installer
**Milestone:** M012 — Attendance System
**Status:** PROPOSED
**Risk:** Medium (NSIS UI customization)

### Tasks
#### 1. Installer (NSIS)
- [x] **T01: Component Selection Page**
  - Add a custom page to `installer_hooks.nsh` with two choices: "Admin System" and "Attendance Client".
  - Save selection to `app_config.json`.
- [x] **T02: Conditional Installation**
  - Only install PostgreSQL/Ollama if "Admin System" is selected.
  - Create specific desktop shortcuts based on selection.

#### 2. Admin System (React + Rust)
- [ ] **T03: Student Data Import**
  - Add "Import School Accounts" button to Admin Toolbar.
  - Implement CSV parser for `100K-fake_school_accounts.csv`.
- [ ] **T04: API Broadcasting**
  - Implement mDNS/UDP broadcasting in Rust to advertise the Admin Server IP.
- [ ] **T05: Reason Management**
  - CRUD for library entry reasons (name, icon).
  - Persist to `tblAttendanceReasons`.

#### 3. Attendance Client (React)
- [ ] **T06: Server Discovery & Selection**
  - UI to detect and select broadcasted Admin IP.
  - Manual IP entry fallback.
- [ ] **T07: Check-in Flow**
  - Student ID input (9 digits).
  - 9-reason selection grid with icons.
  - Post-check-in random quote display.
- [ ] **T08: Anti-Spam Logic**
  - Basic validation to prevent immediate re-entry.
- [ ] **T09: UI/UX Polish (Retro Theme)**
  - Execute geometry and spacing fixes defined in `docs/UI-UX-AUDIT.md`.
  - Fix GroupBox labels, CheckInView overflow, and ReasonView bevels.

## Logical Decisions
- **D040**: Use `mdns` crate for service discovery.
- **D041**: Reasons stored in database, synced to client on connection.
- **D042**: Installer will write `mode: "admin" | "client"` to `app_config.json`.

# S01-PLAN: Attendance Client UI

**Milestone:** M012 — Attendance System
**Status:** IN-PROGRESS
**Objective:** Implement a dedicated, high-contrast, touch-friendly "Door PC" interface for student and faculty check-ins.

## Tasks

- [x] **T01: Multi-Mode App Entry**
  - Fetch `system_mode` from Tauri backend during initialization.
  - Route to either `AdminSystem` (existing) or `AttendanceClient` based on mode.
- [x] **T02: Attendance Client Layout**
  - Create `AttendanceLayout` component.
  - Support full-screen, no-menu experience.
  - Implement dynamic background loading from settings.
- [x] **T03: Student ID Input View**
  - Large numeric display for ID entry.
  - Basic validation (numeric only).
- [x] **T04: Reason Selection Grid**
  - 9-reason grid (e.g., Study, Research, Internet, etc.).
  - Large, beveled buttons for touch-screen compatibility.
- [x] **T05: Success View & Motivational Quotes**
  - Display "Check-in Successful" message.
  - Random motivational quote display.
  - Auto-reset timer (e.g., 5 seconds).

## Design Specification
- **Aesthetic:** Windows 95/98 High-Contrast Blue (Default) or Custom Institution Colors.
- **Typography:** Large Sans-Serif for readability.
- **Interactions:** Sound feedback (optional), large click areas.

## Risk Assessment
- **Mode Switching:** Ensuring the app doesn't flash the Admin UI if in Client mode.
- **Offline Sync:** Client must handle "Server Not Found" states gracefully if Admin IP isn't detected.

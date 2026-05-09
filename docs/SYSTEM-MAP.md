# infoLib System Map & UI Inventory

This document tracks all implemented screens, views, and dialogs across the two separate application binaries.

---

## 🖥️ 1. Admin Management System (`lib_mgmt.exe`)

The central administrative hub for librarians and system administrators.

### 🏠 Core Pages (Main Windows)
| ID | View Name | Path | Status | Notes |
|---|---|---|---|---|
| **P01** | **Login Screen** | `/` | 🟢 DONE | Social Login (Google) + Legacy Auth. Offline detection. |
| **P02** | **Book Catalog** | `/dashboard` | 🟢 DONE | High-density DataGrid. Semantic & SQL Search. |
| **P03** | **Patron Management** | `/patrons` | 🟢 DONE | Account listings with borrowing history & fine status. |
| **P04** | **Edit Patron** | `/patrons/edit/:id` | 🟢 DONE | Full account update form. |

### 🛠️ Global Navigation (Command Bar)
Grouped dropdown system in "Advanced Mode" for deep utility access.

| Group | Actions | Status |
|---|---|---|
| **Catalog** | New Record, Edit, Delete, Export, Authority Control | 🟢 DONE |
| **Accounts** | Manage Accounts, Import CSV, Reset Passwords | 🟢 DONE |
| **Circulation** | Checkout, Return, Reservation, Circulation Dashboard | 🟢 DONE |
| **Reports** | Financial Reports, Acquisitions, Attendance Logs | 🟡 PARTIAL |
| **System** | Cloud Sync Logs, Legacy MDB Import, App Settings | 🟢 DONE |

### 🪟 Global Dialogs (Modals)
Accessible via Toolbar or context actions. Standardized to `z-1000`.

| ID | Dialog Name | Status | Function |
|---|---|---|---|
| **D01** | **Edit Catalog Record** | 🟢 DONE | Metadata editor + Holdings sub-panel (Wireframes 010/011). |
| **D02** | **Authority Control** | 🟢 DONE | Centralized management of Authors & Subjects. |
| **D03** | **Checkout (Issue)** | 🟢 DONE | Real-time item issuance to patrons. |
| **D04** | **Return (Receive)** | 🟢 DONE | Automatic fine calculation on return. |
| **D05** | **Circulation Dashboard** | 🟢 DONE | Real-time borrowing statistics. |
| **D06** | **Payment Dialog** | 🟢 DONE | Fine reconciliation with balance tracking. |
| **D07** | **Legacy MDB Import** | 🟢 DONE | Microsoft Access database migration tool. |
| **D08** | **Cloud Sync Logs** | 🟢 DONE | Real-time monitoring of Firebase/Supabase syncing. |
| **D09** | **Attendance Admin** | 🟢 DONE | Admin view of live terminal check-ins. |
| **D10** | **Settings (⚙️)** | 🟢 DONE | DB Config, Branding, AI, and Sync Scheduler. |
| **D11** | **About InfoLib** | 🟢 DONE | Version info and licensing. |
| **D12** | **Export/Print** | 🟢 DONE | Data export to CSV/JSON. |

---

## 🚪 2. Attendance Client (`attendance.exe`)

Standalone terminal application for institutional check-ins.

### 📱 Terminal Workflow
| ID | Screen Name | Status | Notes |
|---|---|---|---|
| **T01** | **Check-In Input** | 🟢 DONE | Touch-friendly numeric keypad for Student ID. |
| **T02** | **Reason Selection** | 🟢 DONE | Configurable reasons (Research, Borrowing, etc.). |
| **T03** | **Success / Quote** | 🟢 DONE | Confirmation screen with inspirational quotes. |

---

## 🎨 Design Tokens & UI Specs
- **Aesthetic**: Classic Windows 95/98 (Beveled edges, Tahoma/Inter typography).
- **Themes**: Classic (Light), Dark, GJC Premium (Green/Gold).
- **Interactive**: Hover states, micro-animations, and Skeleton Loading shimmer.
- **Accessibility**: Standardized z-indexing:
  - `2000`: Toasts (Top)
  - `1000`: Modals
  - `100`: Navigation/Toolbar

---

## 📈 Legend
- 🟢 **DONE**: Fully functional and parity-verified.
- 🟡 **IN PROGRESS**: Functionality active, final polish pending.
- ⬜ **PENDING**: Planned but not yet implemented.

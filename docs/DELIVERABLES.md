# Project Deliverables

This document defines the formal requirements and deliverables for the **infoLib Library Management System**. Every feature must be validated against this list before production release.

---

## 🏛️ 1. Core LMS Deliverables

| ID | Feature | Status | Notes |
|:---|:---|:---|:---|
| **LMS-01** | **Offline Installer** | ⬜ Pending | Must support PostgreSQL auto-detection and secure credential creation/setup. |
| **LMS-02** | **Offline AI Chat** | ✅ Integrated | Powered by Ollama (Phi-3) for local reasoning without internet. |
| **LMS-03** | **Gmail Login** | ✅ Integrated | Includes smart internet detection to toggle between offline and online auth. |
| **LMS-04** | **Legacy OPAC Parity** | ✅ Integrated | Full database architecture parity with legacy systems. |
| **LMS-05** | **Legacy MDB Import** | ✅ Integrated | High-speed import tool for legacy `.mdb` (Microsoft Access) data files. |
| **LMS-06** | **Cloud Sync System** | ✅ Integrated | Real-time dual-sync with Supabase (PostgreSQL) and Firebase. |
| **LMS-07** | **Circulation Engine** | 🟡 In Progress | Borrowing and returning books. Needs admin settings for payments and due dates. |
| **LMS-08** | **Branding Engine** | ✅ Integrated | Editable organization name and custom logo upload support. |
| **LMS-09** | **Theme Engine** | ✅ Integrated | Global theme settings (Light, Dark, High-Contrast Win95 schemes). |
| **LMS-10** | **Admin Management** | 🟡 In Progress | Basic auth active. Needs "Admin add Admins" UI for multi-user management. |
| **LMS-11** | **Reporting & PDF** | ⬜ Pending | Generation of statistics and printable PDF reports. |

---

## 🚪 2. Attendance System (Module)

Dedicated module for tracking student and faculty library visits.

### 💻 A. Client (Door PC)
- **Time-In Only**: Single-purpose interface for entry tracking.
- **Admin Override**: Time-out activation and session management handled by administrators.
- **Background Customization**: Configurable background imagery per institution.

### 🛡️ B. Admin Dashboard
- **Real-time Statistics**: Live visualization of current library visitors.
- **Printable Reports**: Daily, weekly, and monthly attendance statistics.
- **Bulk Data Management**: CSV import system for new students and faculty; existing record updates.
- **User Management**: Dedicated control over attendance-specific staff roles.

---

## 💎 3. Premium Features (Subscription Based)

Features requiring external API integrations and recurring service credits.

| Feature | Provider | Objective |
|:---|:---|:---|
| **SMS Notifications** | **Twilio** | Automatic SMS alerts for overdue books, reservations, and announcements. |
| **Online AI (Deepseek)** | **Deepseek API** | Pay-per-use access to high-performance online LLMs for advanced research. |

---

## 🛠️ Implementation Todo List

- [ ] **Email Auto-Send**: Implement automatic email dispatch for sync activity logs (Success/Failure/Skipped).
- [ ] **PostgreSQL Auto-Installer**: Script the silent installation and initialization of PostgreSQL for Windows.
- [ ] **Attendance CSV Pipeline**: Build the Rust parser for student/faculty CSV bulk uploads.
- [ ] **Twilio Integration**: Develop the message queue for SMS notifications.

---

> [!IMPORTANT]
> All deliverables must adhere to the **Windows 11** environment constraints and utilize **Bun** for frontend scripts and **Rust** for core systems.

# System State: InfoLib (2026-05-10)

## 1. Architectural Overview
InfoLib is a hybrid offline-first library management system built with **Tauri v2**, **React**, and **PostgreSQL**. It utilizes a dual-sync architecture (Local Postgres + Supabase Cloud Mirror) and features a distinctive Windows 95/98 aesthetic.

## 2. Current Module Status

### 🆔 License System (M015) - 🟢 HARDENED
- **Mechanism**: Machine fingerprinting + Supabase Edge Function validation.
- **State**: Activation flow is stable. Installer includes license key verification.
- **Bypass**: Developer bypass available via `VITE_DEV_LICENSE_BYPASS=true`.

### 📊 Attendance System (M012) - 🟢 COMPLETE
- **Terminal**: Dedicated client mode for student check-ins.
- **Admin Dashboard**: Real-time stats and activity stream.
- **Reporting**: High-fidelity PDF generation (Daily/Weekly/Monthly). 
  - **Architecture**: Frontend-driven (jspdf) for easy customization, Backend handles data filtering.
- **Infrastructure**: Table `public.tblAttendance` joined with `public.tblUser`. 
  - **Enhancement**: Added `Course` field to `tblUser` and integrated it into all reports and dashboards.
- **Report Preview (M012-S05)**: 🟡 IN PROGRESS — Live WYSIWYG preview workspace with orientation setup, sidebar settings panel, and zoom controls.

### 📚 Catalog & Circulation (M005, M014) - 🟢 FUNCTIONAL
- **Catalog**: full CRUD with authority control (Authors/Subjects).
- **Circulation**: Check-out/Return logic with automated fine calculation based on admin settings.
- **Migration**: Successfully imported 6,000+ legacy records from MDB.

### 🤖 AI Intelligence (M008) - 🟡 IN PROGRESS
- **Local LLM**: Integrated via Ollama (Phi-3).
- **Semantic Search**: Vector indexing active for catalog.
- **Context Awareness**: Basic RAG is functional; needs refinement for patron-specific queries.

## 3. Database State
- **Primary**: PostgreSQL 15+ (Local).
- **Sync**: Bi-directional sync with Supabase active (Zustand SyncStore).
- **Schema**: Parity with legacy `glDB` structure plus modern extensions (`tblAttendance`, `pgvector`).

## 4. Environment Context
- **OS**: Windows 11.
- **Runtimes**: Bun (Frontend/Scripts), Rust (Backend), Deno (Edge Functions).
- **Branding**: Global namespace `solutions.jansoft.infolib`.

## 5. Critical Pending Tasks
- [ ] Twilio SMS Integration (M013-S01).
- [ ] Online AI API Fallback (Deepseek) (M013-S02).
- [ ] Global Email Notification System (M013-S04).
- [ ] Final UI/UX Polish for production release.

---
*Last Updated: 2026-05-10 by SD Agent*

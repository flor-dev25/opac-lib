# Attendance System Documentation

## Overview
The infoLib Attendance System provides a streamlined way to track library usage. It consists of two components:
1. **Admin Server**: The central cataloging system that broadcasts its location and manages student data.
2. **Attendance Client**: A lightweight kiosk application installed on PCs at library entrances.

## Workflow
1. **Discovery**: Client searches for Admin Server on local network (mDNS).
2. **Identification**: Student enters 9-digit Student ID.
3. **Reason Selection**: Student chooses one of 9 predefined reasons for entry.
4. **Confirmation**: System logs entry and displays a motivational quote.

## Entry Reasons
The system comes with 9 initial reasons, manageable via the Admin dashboard:
- Clearance
- Computer Use
- Meeting
- Print
- Reading/Study/Review
- Research
- Silverstar
- Transaction
- Xerox

## Technical Implementation
- **Broadcasting**: Admin server uses `mdns` to announce its IP.
- **Connectivity**: Client connects to the broadcasted IPv4 address.
- **Anti-Spam**: Random quotes delay immediate re-entry to prevent spamming.
- **Sync**: Admin manages a `tblAttendance` table in PostgreSQL.

## Student Data Integration
The system integrates with the master student list (`tblUser`). 
- **Student ID**: Used as the primary key for lookup.
- **Course Tracking**: The system now supports a dedicated `Course` field (e.g., BSIT, BSCS) which is synchronized from CSV imports and displayed in real-time dashboards and PDF reports.
- **Dept Mapping**: Secondary academic information (Year Level) is stored in the `Dept` column.

## Reporting
Attendance reports (Daily, Weekly, Monthly) are generated on the **Client-side (Admin Dashboard)**.
- **Data Flow**: The backend provides filtered JSON data via Tauri commands.
- **Layout**: The frontend uses `jspdf` to construct the document layout, branding, and tables.
- **Customization**: This approach allows for easy CSS-like styling of the report without recompiling the Rust backend.

## Report Preview Workspace (M012-S05)
A live WYSIWYG document preview system that replaces the blind-export flow.
- **Setup Dialog**: Orientation (portrait/landscape), paper size (A4/Letter/Legal), date range, terminal filter.
- **Three-Panel Layout**: Left sidebar (page thumbnails + settings), central document canvas, top toolbar.
- **Live Controls**: Zoom (25%-200%), font size, table density, report title — all re-render in real time.
- **WYSIWYG Guarantee**: HTML preview and jsPDF export share the same config/pagination logic via `reportConfig.ts`.
- **Export**: Final PDF generated via jsPDF only on user confirmation, saved via Tauri FS.
- **Full Spec**: See `docs/M012-S05-REPORT-PREVIEW.md`.

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

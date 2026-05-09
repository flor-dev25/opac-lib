# M012: Attendance System & Installer Split — Context

**Gathered:** 2026-05-08
**Status:** Ready for planning

## Implementation Decisions
- **Installer**: Use `nsDialogs` in NSIS to create a "Component Selection" card.
- **Broadcasting**: Use Rust `mdns` or `zeroconf` to advertise `_infolib._tcp` on the local network.
- **Client UI**: Full-screen kiosk mode for the Door PC. Large number pad for Student ID.
- **Reasons**: initial 9 items:
  1. clearance
  2. computer_use
  3. meeting
  4. print
  5. reading/study/review
  6. research
  7. silverstar
  8. transaction
  9. xerox
- **Icons**: Use `Lucide-React` icons or custom SVG mapped to reasons.
- **Quotes**: Display random motivational quote after check-in. Prevents rapid spam.

## Student Data
- Source: `100K-fake_school_accounts.csv`.
- Format: `student_id` (9 digits), `name`, `course`, `department`, etc.
- Admin must import this to enable validation on the Client.

## Logic
- Client checks `db_config.json` for mode.
- If `mode == "client"`, bypass login and show Discovery screen.
- If `mode == "admin"`, standard cataloging behavior + Broadcasting service.

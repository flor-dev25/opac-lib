# Requirements: infoLib LMS

## Functional Requirements
- [ ] User authentication with "User Not Allowed" error handling.
- [ ] Dashboard with search filtering by Keyword, Title, Author, etc.
- [ ] Multi-column data grid with record selection.
- [ ] Full Cataloging form with auto-generated Control Numbers.
- [ ] Holdings management (Accession/Location) within catalog flow.
- [ ] Authority control for Authors and Subjects with workstation lock warnings.
- [ ] Export functionality to Text, Printer, and Delimited formats.

## Non-Functional Requirements
- **Visual Parity**: Must match `wireframe-1` layout and aesthetics (Classic Grey, Bevels).
- **Performance**: High-density data grid must remain responsive with large datasets.
- **Reliability**: Use Zustand for stable client-side state.
- **Maintainability**: Follow DRY principles for UI components (Buttons, Inputs, Dialogs).

## Out of Scope (Current Milestone)
- Advanced reporting and analytics.
- Real-time notification system.
- Offline-sync (focus on connected mode first).

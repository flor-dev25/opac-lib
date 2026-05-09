# Attendance Terminal UI/UX Audit & Fixes

**Role:** Senior UI/UX Agent
**Objective:** Polish the Windows 95/98 theme implementation for the Attendance Client pages to ensure perfect geometry, spacing, and retro fidelity based on recent layout checks.

## Identified Issues & Required Fixes

### 1. Global Component Polish (`GroupBox`)
- **Issue:** The `GroupBox` component label is allowing the top border line to run straight through the text.
- **Fix:** Add a background color to the label span (e.g., `bg-classic-grey` or `bg-dark-surface`) with slight padding to break the border line and mimic the authentic Win32 GroupBox appearance.

### 2. Check-In View (`CheckInView.tsx`)
- **Issue 1 (Overflow):** The newly added Backspace (⌫) button is bursting out of the right side of the GroupBox. The flex layout containing the ID display and the Backspace key exceeds the 450px container width.
  - **Fix:** Adjust widths. Reduce the ID display flex sizing or set a fixed width for the Backspace button that fits within the grid layout.
- **Issue 2 (Vertical Crushing):** The keypad buttons are slightly too tall (`h-24`), pushing the content down and causing the bottom "infoLib Client v2.0" text to collide with the absolute-positioned dark blue footer bar.
  - **Fix:** Reduce keypad button height to `h-20` and adjust the main container's vertical spacing (`space-y-12` -> `space-y-8`) to prevent overflow.
- **Issue 3 (Title Area):** The "LIBRARY ATTENDANCE" title is very tightly kerned and skewed.
  - **Fix:** Relax the letter spacing slightly and adjust margins for breathing room.
- **Issue 4 (Error Banner):** The red error banner feels too modern/flat.
  - **Fix:** Apply the `BeveledBox` styling to the error banner to make it look like a classic Windows dialog warning.

### 3. Reason View (`ReasonView.tsx`)
- **Issue:** The 9 activity buttons (Study, Research, Internet, etc.) look like flat modern cards.
- **Fix:** Apply the `shadow-bevel-raised` utility to these buttons. They should look physically clickable in accordance with the retro aesthetic. Ensure icon size and text padding are balanced.

### 4. Success View (`SuccessView.tsx`)
- **Issue:** The large background quotation mark icon is clipping out of the container bounds.
- **Fix:** Adjust absolute positioning (from `-top-4 -left-4` to a safer offset, or set `overflow-hidden` on the GroupBox inner div).

## Action Plan
1. Team to implement the `GroupBox` label fix globally first.
2. Adjust the flex geometry in `CheckInView.tsx`.
3. Apply classic beveling to flat elements in `ReasonView.tsx`.
4. Perform final spacing check on a 1080p display to ensure no footer collisions.

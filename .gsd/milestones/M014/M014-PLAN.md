# Phase 14: Circulation Engine (M014)

## Objective
Finalize the core library circulation system by implementing admin-configurable rules for borrowing and returning, automated fine calculation, and real-time dashboard statistics.

## Implementation Details

### 1. Configuration Hardening
- Add `loan_period_days: i32` (default: 7) to `AppConfig` in `settings.rs`.
- Add `fine_per_day: f64` (default: 5.0) to `AppConfig` in `settings.rs`.
- These settings will be persisted in `db_config.json`.

### 2. Backend Logic (Rust)
- **Borrowing**: `check_out_item` will calculate `dteDue` using the `loan_period_days` setting.
- **Returning**: `return_item` will:
    - Compare `dteReturn` vs `dteDue`.
    - Calculate `days_overdue`.
    - Calculate fine based on `fine_per_day`.
    - Update `tblUser.UnpaidFine`.
- **Reporting**:
    - Implement `get_active_loans` to fetch unreturned entries from `tblRent`.
    - Implement `get_circulation_stats` for real-time counts.
    - Implement `get_overdue_items` with day-accurate calculations.

### 3. Frontend Integration (React)
- **Settings**: Add a "Circulation" tab in `SettingsPage.tsx` with inputs for:
    - Default Loan Period (Days)
    - Fine Rate (Per Day)
- **Dashboard**: Ensure the `CirculationDashboard` correctly displays live data from the backend.

## Success Criteria
- [ ] Librarians can set a custom loan period in Settings.
- [ ] Fines are automatically calculated and added to patron accounts on return.
- [ ] Overdue items are listed accurately in the Circulation Dashboard.
- [ ] Financial summary reflects real fine collections and outstanding balances.

## Risk Assessment
- **Date Arithmetic**: PostgreSQL date subtraction vs Rust `chrono`. Use `sqlx` to handle date logic in-query where possible for accuracy.
- **Legacy Compatibility**: Ensure column names match `tblRent` precisely from the legacy `.mdb` schema (`Accession`, `dteBorrow`, `dteDue`, `dteReturn`, `Idno`).

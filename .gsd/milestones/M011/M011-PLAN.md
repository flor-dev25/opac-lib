# M011 — Dual Sync Architecture (Firebase + Supabase)

## Objective
Implement a "Dual Sync" system where the local infoLib PostgreSQL database syncs its data to two remote providers:
1. **Firebase (NoSQL)**: Continues to serve as a fast, lightweight mirror for mobile/web offline viewing.
2. **Supabase (PostgreSQL)**: Serves as the primary 1:1 remote SQL backup and provides native `pgvector` cloud search capabilities.

## Business Context
While Firebase is great for client-side syncing, it does not support native `.sql` exports. Since our local data is highly relational (PostgreSQL), syncing to a cloud PostgreSQL instance (Supabase) ensures that we have a perfect structural mirror of our data in the cloud.

## Implementation Plan

### S01: Backend Supabase Connection Pool
1. Add `SUPABASE_DB_POOLER_URL` to `.env`.
2. Update `src-tauri/src/db.rs` to establish a second `PgPool` targeting the Supabase connection string.
3. Handle offline gracefully: If Supabase pool fails to connect, the local app must continue running without crashing.

### S02: Dual Sync Execution Logic
1. Create `src-tauri/src/sync.rs`.
2. Implement a Tauri command `run_dual_sync()`.
3. When called, the command will:
   - Export local data (or read diffs).
   - Push JSON updates to Firebase REST API (existing logic).
   - Push SQL upserts (`INSERT ... ON CONFLICT DO UPDATE`) to the Supabase remote pool.

### S03: Frontend Integration
1. Update `src/stores/syncStore.ts` to call the new `run_dual_sync` Tauri command instead of the simulated timeout.
2. Ensure the `SyncComboButton.tsx` and `SyncLogsDialog.tsx` accurately report the status of *both* Firebase and Supabase sync operations.

## Environmental Requirements
- Root `.env` must contain `SUPABASE_DB_POOLER_URL`.
- The Supabase password must be properly URL-encoded if it contains special characters (e.g., `#` becomes `%23`).

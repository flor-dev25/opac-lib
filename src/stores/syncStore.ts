import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { listen, UnlistenFn } from '@tauri-apps/api/event';
import { invoke } from '@tauri-apps/api/core';

export interface SyncLogDetail {
  timestamp: string;
  type: 'info' | 'error' | 'success';
  message: string;
}

export interface SyncSession {
  id: string;
  startTime: string;
  status: 'syncing' | 'completed' | 'failed';
  summary: string;
  details: SyncLogDetail[];
  expanded: boolean;
}

interface SyncState {
  isSyncing: boolean;
  lastSync: string | null;
  sessions: SyncSession[];
  autoSyncEnabled: boolean;
  syncTargets: {
    firebase: boolean;
    supabase: boolean;
  };
  syncNow: () => Promise<void>;
  addSession: (id: string) => void;
  updateSession: (id: string, updates: Partial<SyncSession>) => void;
  addLogDetail: (sessionId: string, detail: Omit<SyncLogDetail, 'timestamp'>) => void;
  toggleAutoSync: () => void;
  toggleSyncTarget: (target: 'firebase' | 'supabase') => void;
  clearLogs: () => void;
  toggleSessionExpanded: (id: string) => void;
}

interface SyncEventPayload {
  session_id: string;
  log_type: 'info' | 'error' | 'success';
  message: string;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      isSyncing: false,
      lastSync: null,
      sessions: [],
      autoSyncEnabled: true,
      syncTargets: {
        firebase: true,
        supabase: true,
      },

      addSession: (id) => set((state) => ({
        sessions: [{
          id,
          startTime: new Date().toISOString(),
          status: 'syncing' as const,
          summary: 'Synchronization in progress...',
          details: [],
          expanded: true,
        }, ...state.sessions].slice(0, 20),
      })),

      updateSession: (id, updates) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === id ? { ...s, ...updates } : s)
      })),

      addLogDetail: (sessionId, detail) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === sessionId ? {
          ...s,
          details: [...s.details, { ...detail, timestamp: new Date().toISOString() }]
        } : s)
      })),

      syncNow: async () => {
        if (get().isSyncing) return;
        
        // Clean up any zombie sessions from previous crashes
        const cleanedSessions = get().sessions.map(s => ({
          ...s,
          status: s.status === 'syncing' ? 'failed' as const : s.status,
          summary: s.status === 'syncing' ? 'Interrupted before completion.' : s.summary
        }));

        set({ isSyncing: true, sessions: cleanedSessions });

        // Generate a temporary session ID in case the Rust backend hasn't emitted yet
        // The real session ID will come from the events.
        let currentSessionId: string | null = null;
        let unlisten: UnlistenFn | null = null;

        try {
          unlisten = await listen<SyncEventPayload>('sync_progress', (event) => {
            const { session_id, log_type, message } = event.payload;
            if (!currentSessionId) {
              currentSessionId = session_id;
              get().addSession(session_id);
            }
            get().addLogDetail(session_id, { type: log_type, message });
          });

          const result = await invoke<{
            firebase_status: string,
            supabase_status: string,
            records_synced: number
          }>('run_dual_sync', { targets: get().syncTargets });

          const now = new Date().toISOString();
          set({ lastSync: now });
          
          if (currentSessionId) {
            get().updateSession(currentSessionId, {
              status: 'completed',
              summary: `Completed successfully. ${result.records_synced} records synced.`,
              expanded: false // auto collapse on success
            });
          }
        } catch (error) {
          if (currentSessionId) {
            get().updateSession(currentSessionId, {
              status: 'failed',
              summary: `Failed: ${error instanceof Error ? error.message : String(error)}`,
              expanded: true // keep open to see error
            });
            get().addLogDetail(currentSessionId, { type: 'error', message: String(error) });
          }
        } finally {
          if (unlisten) unlisten();
          set({ isSyncing: false });
        }
      },

      toggleAutoSync: () => {
        set({ autoSyncEnabled: !get().autoSyncEnabled });
      },

      toggleSyncTarget: (target) => set((state) => ({
        syncTargets: { ...state.syncTargets, [target]: !state.syncTargets[target] }
      })),

      clearLogs: () => set({ sessions: [] }),

      toggleSessionExpanded: (id) => set((state) => ({
        sessions: state.sessions.map((s) => s.id === id ? { ...s, expanded: !s.expanded } : s)
      })),
    }),
    {
      name: 'infolib-sync-store',
      partialize: (state) => ({ 
        autoSyncEnabled: state.autoSyncEnabled,
        syncTargets: state.syncTargets,
        lastSync: state.lastSync,
        sessions: state.sessions.map(s => ({ 
          ...s, 
          expanded: false,
          status: s.status === 'syncing' ? 'failed' as const : s.status,
          summary: s.status === 'syncing' ? 'Interrupted or timed out.' : s.summary
        }))
      }),
    }
  )
);

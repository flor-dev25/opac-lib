import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SyncLog {
  id: string;
  timestamp: string;
  type: 'info' | 'error' | 'success';
  message: string;
}

interface SyncState {
  isSyncing: boolean;
  lastSync: string | null;
  logs: SyncLog[];
  autoSyncEnabled: boolean;
  syncNow: () => Promise<void>;
  addLog: (type: 'info' | 'error' | 'success', message: string) => void;
  toggleAutoSync: () => void;
  clearLogs: () => void;
}

export const useSyncStore = create<SyncState>()(
  persist(
    (set, get) => ({
      isSyncing: false,
      lastSync: null,
      logs: [],
      autoSyncEnabled: true,

      syncNow: async () => {
        if (get().isSyncing) return;

        set({ isSyncing: true });
        get().addLog('info', 'Starting Firebase synchronization...');

        try {
          // Simulate Firebase Sync logic
          // In a real implementation, this would call a Tauri command
          await new Promise((resolve) => setTimeout(resolve, 2000));

          const now = new Date().toISOString();
          set({ lastSync: now });
          get().addLog('success', `Synchronization completed successfully at ${new Date(now).toLocaleTimeString()}`);
        } catch (error) {
          get().addLog('error', `Sync failed: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
          set({ isSyncing: false });
        }
      },

      addLog: (type, message) => {
        const newLog: SyncLog = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toISOString(),
          type,
          message,
        };
        set((state) => ({
          logs: [newLog, ...state.logs].slice(0, 50), // Keep last 50 logs
        }));
      },

      toggleAutoSync: () => {
        const newValue = !get().autoSyncEnabled;
        set({ autoSyncEnabled: newValue });
        get().addLog('info', `Auto-sync ${newValue ? 'enabled' : 'disabled'}`);
      },

      clearLogs: () => set({ logs: [] }),
    }),
    {
      name: 'infolib-sync-store',
      partialize: (state) => ({ 
        autoSyncEnabled: state.autoSyncEnabled,
        lastSync: state.lastSync,
        logs: state.logs 
      }),
    }
  )
);

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export type SystemMode = 'admin' | 'client';

interface SystemState {
  mode: SystemMode | null;
  isLoading: boolean;
  initSystem: () => Promise<void>;
}

export const useSystemStore = create<SystemState>((set) => ({
  mode: null,
  isLoading: true,
  initSystem: async () => {
    try {
      const config: any = await invoke('get_db_config');
      
      // Allow frontend override via Vite environment variable
      const envMode = import.meta.env.VITE_SYSTEM_MODE;
      const finalMode = (envMode as SystemMode) || (config.system_mode as SystemMode) || 'admin';
      
      set({ mode: finalMode, isLoading: false });
    } catch (error) {
      console.error('Failed to load system config:', error);
      set({ mode: 'admin', isLoading: false }); // Fallback
    }
  }
}));

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

export type SystemMode = 'admin' | 'client';

interface SystemState {
  mode: SystemMode | null;
  isLoading: boolean;
  licenseError: string | null;
  isOllamaMissing: boolean;
  initSystem: () => Promise<void>;
  setOllamaMissing: (missing: boolean) => void;
  activateLicense: (key: string) => Promise<boolean>;
}

export const useSystemStore = create<SystemState>((set) => ({
  mode: null,
  isLoading: true,
  licenseError: null,
  isOllamaMissing: false,
  setOllamaMissing: (missing: boolean) => set({ isOllamaMissing: missing }),
  activateLicense: async (key: string) => {
    try {
      const config: any = await invoke('get_db_config');
      config.license_key = key;
      if (!config.machine_id) {
        config.machine_id = "MANUAL-" + Math.random().toString(36).substring(2, 10).toUpperCase();
      }
      await invoke('save_db_config', { config });
      
      const isValid = await invoke('validate_license');
      if (isValid) {
        set({ licenseError: null });
        return true;
      }
      return false;
    } catch (e: any) {
      set({ licenseError: e.toString() });
      throw e;
    }
  },
  initSystem: async () => {
    const envMode = import.meta.env.VITE_SYSTEM_MODE;
    const isBypass = import.meta.env.VITE_BYPASS_LICENSE === 'true';
    
    try {
      // 1. Verify License (skip in dev mode if BYPASS or DEV_DATABASE_URL exists)
      try {
        if (isBypass) {
          console.log('[System] License check bypassed via VITE_BYPASS_LICENSE');
        } else {
          const isValid = await invoke('validate_license');
          if (!isValid) {
            set({ licenseError: 'Software activation is required to use infoLib.' });
          }
        }
      } catch (e: any) {
        console.error('License validation failed:', e);
        set({ licenseError: e.toString() });
      }

      // 2. Check Ollama Presence
      try {
        const isOllamaPresent = await invoke<boolean>('check_ollama_presence');
        set({ isOllamaMissing: !isOllamaPresent });
      } catch (e) {
        console.warn('Failed to check Ollama presence:', e);
      }

      const config: any = await invoke('get_db_config');
      const finalMode = (envMode as SystemMode) || (config.system_mode as SystemMode) || 'admin';
      set({ mode: finalMode, isLoading: false });
    } catch (error) {
      console.warn('Tauri invoke failed (running in browser?), falling back to envMode:', envMode);
      set({ mode: (envMode as SystemMode) || 'admin', isLoading: false });
    }
  }
}));

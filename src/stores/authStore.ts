import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

interface User {
  username: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    // Mock validation delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (username && password) {
      set({ isAuthenticated: true, user: { username }, isLoading: false });
      try {
        await invoke('maximize_window');
      } catch (e) {
        console.error('Tauri invoke failed:', e);
      }
      return true;
    }
    set({ error: 'Invalid username or password', isLoading: false });
    return false;
  },
  logout: () => {
    set({ isAuthenticated: false, user: null, error: null });
    try {
      invoke('reset_window_size');
    } catch (e) {
      console.error('Tauri invoke failed:', e);
    }
  },
  clearError: () => set({ error: null }),
}));

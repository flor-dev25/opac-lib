import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

interface User {
  username: string;
  email?: string;
  avatarUrl?: string;
  role?: 'Administrator' | 'Librarian' | 'Staff' | 'Patron';
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // timestamp
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => {
  let refreshTimer: ReturnType<typeof setTimeout> | null = null;

  const scheduleTokenRefresh = (expiresAt: number) => {
    if (refreshTimer) clearTimeout(refreshTimer);
    const now = Date.now();
    const timeUntilExpiry = expiresAt - now;
    // Refresh 5 minutes before expiration, or immediately if already expired
    const timeUntilRefresh = Math.max(0, timeUntilExpiry - 5 * 60 * 1000);
    
    refreshTimer = setTimeout(() => {
      get().refreshToken();
    }, timeUntilRefresh);
  };

  return {
    isAuthenticated: false,
    user: null,
    tokens: null,
    isLoading: false,
    error: null,
    
    login: async (username, password) => {
      set({ isLoading: true, error: null });
      // Mock validation delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (username && password) {
        const mockExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour lifespan
        const tokens = { accessToken: 'mock_jwt_token', refreshToken: 'mock_refresh', expiresAt: mockExpiresAt };
        
        set({ isAuthenticated: true, user: { username, role: 'Administrator' }, tokens, isLoading: false });
        scheduleTokenRefresh(mockExpiresAt);

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

    loginWithGoogle: async () => {
      set({ isLoading: true, error: null });
      // Simulate OAuth popup and token retrieval
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      // In production, this would use Firebase's signInWithPopup(auth, googleProvider)
      const mockExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour token lifespan
      const tokens = { accessToken: 'google_jwt_token', refreshToken: 'google_refresh', expiresAt: mockExpiresAt };
      
      set({ 
        isAuthenticated: true, 
        user: { 
          username: 'Google User', 
          email: 'user@gmail.com', 
          role: 'Librarian',
          avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Felix'
        }, 
        tokens,
        isLoading: false 
      });
      scheduleTokenRefresh(mockExpiresAt);

      try {
        await invoke('maximize_window');
      } catch (e) {
        console.error('Tauri invoke failed:', e);
      }
      return true;
    },

    refreshToken: async () => {
      // Simulate refreshing token via refresh token
      const currentTokens = get().tokens;
      if (!currentTokens) return;

      // Call identity provider to exchange refresh token for new access token
      const mockExpiresAt = Date.now() + 60 * 60 * 1000;
      set({
        tokens: { ...currentTokens, accessToken: 'new_jwt_token', expiresAt: mockExpiresAt }
      });
      scheduleTokenRefresh(mockExpiresAt);
      console.log('[Auth] Token automatically refreshed.');
    },

    logout: () => {
      if (refreshTimer) clearTimeout(refreshTimer);
      set({ isAuthenticated: false, user: null, tokens: null, error: null });
      try {
        invoke('reset_window_size');
      } catch (e) {
        console.error('Tauri invoke failed:', e);
      }
    },
    
    clearError: () => set({ error: null }),
  };
});

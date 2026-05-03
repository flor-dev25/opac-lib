import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  username: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username: string, _password: string) => {
        set({ isLoading: true, error: null });
        
        // Mock validation delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Mock validation logic
        if (username.toLowerCase() === 'admin') {
          set({ 
            user: { username: 'admin', role: 'Administrator' }, 
            isAuthenticated: true, 
            isLoading: false 
          });
          return true;
        } else {
          set({ 
            error: 'User Not Allowed', 
            isLoading: false 
          });
          return false;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'infolib-auth-storage',
    }
  )
);

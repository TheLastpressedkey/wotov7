import { create } from 'zustand';
import { AuthState, User } from '../types/auth';
import { authService } from '../services/authService';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email: string, password: string) => {
    try {
      const user = await authService.login(email, password);
      set({ user, isAuthenticated: true });
    } catch (error) {
      console.error('Login failed:', error);
      set({ user: null, isAuthenticated: false });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  checkSession: async () => {
    try {
      const user = await authService.checkAuthState();
      if (user) {
        set({
          user: {
            id: user.id,
            email: user.email!,
            role: 'admin',
          },
          isAuthenticated: true,
        });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Session check failed:', error);
      set({ user: null, isAuthenticated: false });
    }
  },
}));
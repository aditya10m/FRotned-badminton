import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null, token?: string | null) => Promise<void>;
  loadToken: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setUser: async (user, token) => {
    try {
      if (token) {
        if (Platform.OS === 'web') {
          localStorage.setItem('token', token);
          if (user) localStorage.setItem('user', JSON.stringify(user));
        } else {
          await SecureStore.setItemAsync('token', token);
        }
        set({ user, token, isAuthenticated: true, isLoading: false });
      } else {
        set({ user, isAuthenticated: !!user, isLoading: false });
      }
    } catch (e) {
      console.error('Error saving user/token:', e);
      set({ user, token: token || null, isAuthenticated: !!user, isLoading: false });
    }
  },

  loadToken: async () => {
    try {
      let token: string | null = null;
      let user: User | null = null;

      if (Platform.OS === 'web') {
        token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            user = JSON.parse(userStr);
          } catch {
            user = null;
          }
        }
      } else {
        token = await SecureStore.getItemAsync('token');
      }

      if (token) {
        set({ token, user, isAuthenticated: true });
      } else {
        set({ token: null, user: null, isAuthenticated: false });
      }
    } catch (e) {
      console.error('Failed to load token:', e);
      set({ token: null, user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else {
        await SecureStore.deleteItemAsync('token');
      }
    } catch (e) {
      console.error('Error deleting token:', e);
    } finally {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

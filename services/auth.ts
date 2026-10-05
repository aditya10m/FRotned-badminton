import { api } from './api';
import { TokenResponse } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<TokenResponse> => {
    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    return {
      accessToken: data.access_token || data.accessToken,
      refreshToken: data.refresh_token || '',
      user: {
        id: data.user?.id || '',
        email: data.user?.email || email,
        fullName: data.user?.full_name || data.user?.fullName || '',
      },
    };
  },

  register: async (email: string, password: string, fullName: string): Promise<TokenResponse> => {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    });
    const data = response.data;
    return {
      accessToken: data.access_token || data.accessToken,
      refreshToken: data.refresh_token || '',
      user: {
        id: data.user?.id || '',
        email: data.user?.email || email,
        fullName: data.user?.full_name || data.user?.fullName || fullName,
      },
    };
  },

  logout: async (): Promise<void> => {
    // Client-side logout clears token
  },
};

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  (typeof window !== 'undefined' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
    ? 'https://backendtenis.onrender.com/api'
    : 'http://localhost:8000/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getStoredToken = async (): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return typeof window !== 'undefined' ? window.localStorage.getItem('token') : null;
    }
    return await SecureStore.getItemAsync('token');
  } catch {
    return null;
  }
};

export const setStoredToken = async (token: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem('token', token);
    } else {
      await SecureStore.setItemAsync('token', token);
    }
  } catch {}
};

export const removeStoredToken = async (): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.removeItem('token');
    } else {
      await SecureStore.deleteItemAsync('token');
    }
  } catch {}
};

api.interceptors.request.use(async (config) => {
  const token = await getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await removeStoredToken();
      const originalRequest = error.config;
      if (originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;
        delete originalRequest.headers['Authorization'];
        return api(originalRequest);
      }
    }
    return Promise.reject(error);
  }
);

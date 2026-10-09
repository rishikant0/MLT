/// <reference types="vite/client" />
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Helper to get active token based on current route context
export const getActiveAuthToken = (): string | null => {
  const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
  if (isAdminPath) {
    return (
      localStorage.getItem('mlt_admin_token') ||
      localStorage.getItem('mlt_token')
    );
  }
  return (
    localStorage.getItem('mlt_student_token') ||
    localStorage.getItem('mlt_token')
  );
};

// Attach dynamic JWT token based on route context
api.interceptors.request.use(
  (config) => {
    const isExplicitAdminApi = config.url && (config.url.startsWith('/admin') || config.url.startsWith('/api/admin'));
    const isAdminPath = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');

    let token: string | null = null;
    if (isExplicitAdminApi || isAdminPath) {
      token = localStorage.getItem('mlt_admin_token') || localStorage.getItem('mlt_token');
    } else {
      token = localStorage.getItem('mlt_student_token') || localStorage.getItem('mlt_token');
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for standard API payload extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected network error occurred.';
    return Promise.reject(new Error(message));
  }
);

export default api;

import axios from 'axios';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const API_BASE_URL = configuredApiUrl
  ? `${configuredApiUrl.replace(/\/+$/, '').replace(/(?:\/api)+$/i, '')}/api`
  : '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mlt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle global errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred.';
    return Promise.reject({ ...error, message });
  }
);

const fallbackApiBaseUrl = 'http://localhost:8787/api/v1';

if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is required for production builds');
}

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? fallbackApiBaseUrl).replace(/\/+$/, '');

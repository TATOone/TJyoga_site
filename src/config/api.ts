const fallbackApiBaseUrl = 'http://localhost:8787/api/v1';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? fallbackApiBaseUrl).replace(/\/+$/, '');

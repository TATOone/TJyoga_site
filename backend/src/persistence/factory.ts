import { env } from '../config/env.js';
import { buildInMemoryStore, type BackendStore } from './store.js';

export const buildStore = async (): Promise<BackendStore> => {
  if (env.DATABASE_URL) {
    console.warn(
      '[store] DATABASE_URL задан. Примените migrations 001/002/003 и подключите PostgresBackendStore на deploy. Используется in-memory fallback.',
    );
  }

  return buildInMemoryStore();
};

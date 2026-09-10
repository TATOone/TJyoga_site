import { env } from '../config/env.js';
import { buildPostgresStore } from './postgres.js';
import { buildInMemoryStore, type BackendStore } from './store.js';

export const buildStore = async (): Promise<BackendStore> => {
  if (env.DATABASE_URL) {
    return buildPostgresStore(env.DATABASE_URL, {
      seedDemo: env.NODE_ENV !== 'production',
    });
  }

  if (env.NODE_ENV === 'production') {
    throw new Error(
      'DATABASE_URL обязателен в production. In-memory store остаётся только для local/dev/tests.',
    );
  }

  return buildInMemoryStore();
};

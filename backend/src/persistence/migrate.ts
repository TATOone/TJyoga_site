import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type pg from 'pg';
import type { SqlExecutor } from './sql.js';

/** Stable advisory lock so two deploys cannot interleave DDL on this tiny VPS. */
export const MIGRATION_LOCK_KEY = 872_011_006;

export const resolveMigrationsDir = (): string => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '../../db/migrations');
};

const isPool = (db: SqlExecutor): db is pg.Pool =>
  'idleCount' in db && 'totalCount' in db && typeof (db as pg.Pool).connect === 'function';

/**
 * Apply numbered SQL files on a single connection.
 * Never use Pool.query() for BEGIN/COMMIT: each Pool.query may hop connections.
 */
export const applyMigrations = async (db: SqlExecutor): Promise<string[]> => {
  const pool = isPool(db) ? db : null;
  const client = pool ? await pool.connect() : (db as pg.PoolClient);

  try {
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_KEY]);
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id TEXT PRIMARY KEY,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      const dir = resolveMigrationsDir();
      const files = (await readdir(dir))
        .filter((name) => /^\d+.*\.sql$/u.test(name))
        .sort((left, right) => left.localeCompare(right));

      const applied: string[] = [];

      for (const file of files) {
        const existing = await client.query('SELECT 1 FROM schema_migrations WHERE id = $1', [file]);
        if ((existing.rowCount ?? 0) > 0) {
          continue;
        }

        const sql = await readFile(path.join(dir, file), 'utf8');
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
          await client.query('COMMIT');
          applied.push(file);
        } catch (error) {
          await client.query('ROLLBACK');
          throw error;
        }
      }

      return applied;
    } finally {
      await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_KEY]);
    }
  } finally {
    if (pool) {
      client.release();
    }
  }
};

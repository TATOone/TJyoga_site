import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { SqlExecutor } from './sql.js';

export const resolveMigrationsDir = (): string => {
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '../../db/migrations');
};

export const applyMigrations = async (db: SqlExecutor): Promise<string[]> => {
  await db.query(`
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
    const existing = await db.query('SELECT 1 FROM schema_migrations WHERE id = $1', [file]);
    if ((existing.rowCount ?? 0) > 0) {
      continue;
    }

    const sql = await readFile(path.join(dir, file), 'utf8');
    await db.query('BEGIN');
    try {
      await db.query(sql);
      await db.query('INSERT INTO schema_migrations (id) VALUES ($1)', [file]);
      await db.query('COMMIT');
      applied.push(file);
    } catch (error) {
      await db.query('ROLLBACK');
      throw error;
    }
  }

  return applied;
};

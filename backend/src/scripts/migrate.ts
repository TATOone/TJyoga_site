import 'dotenv/config';
import pg from 'pg';
import { applyMigrations } from '../persistence/migrate.js';

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error('DATABASE_URL is required to apply migrations');
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  const applied = await applyMigrations(pool);
  if (applied.length === 0) {
    console.log('No pending migrations');
  } else {
    console.log(`Applied migrations: ${applied.join(', ')}`);
  }
} finally {
  await pool.end();
}

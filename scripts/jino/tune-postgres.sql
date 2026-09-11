-- Optional Postgres 16 tuning for the 1.5GiB Jino VPS.
-- Do NOT apply blindly. effective_cache_size can be reloaded;
-- max_connections needs a restart and will drop existing sessions.
--
-- As postgres:
--   psql -d tjyoga -f scripts/jino/tune-postgres.sql
--   SELECT pg_reload_conf();
-- Restart (operator-approved): systemctl restart postgresql
--
-- Current live: shared_buffers=128MB, work_mem=4MB, max_connections=100,
-- effective_cache_size=4GB (too high for 1.5GiB).

ALTER SYSTEM SET effective_cache_size = '512MB';
ALTER SYSTEM SET random_page_cost = '1.1';
-- Uncomment only with an approved restart window:
-- ALTER SYSTEM SET max_connections = '30';

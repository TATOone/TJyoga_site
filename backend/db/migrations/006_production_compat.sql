-- Production compatibility with the live Jino database (applied historically
-- without schema_migrations). Do not drop legacy tables: rollback to the
-- previous PostgresBackendStore still reads local_credentials.

create table if not exists local_credentials (
  user_id uuid primary key references users(id) on delete cascade,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  doc_type text not null check (
    doc_type in ('offer', 'privacy', 'refund', 'medical_disclaimer', 'cookies')
  ),
  version text not null,
  source text not null check (source in ('checkout', 'register', 'profile_update')),
  accepted_at timestamptz not null default now()
);

create index if not exists idx_consents_user_accepted
  on consents (user_id, accepted_at desc);

-- Live admin/editor hashes live in local_credentials; this store prefers users.password_hash.
update users as u
set
  password_hash = lc.password_hash,
  updated_at = now()
from local_credentials as lc
where lc.user_id = u.id
  and u.password_hash is null;

-- Keep the legacy table populated so an old binary can still verify passwords.
insert into local_credentials (user_id, password_hash)
select id, password_hash
from users
where password_hash is not null
on conflict (user_id) do nothing;

-- Stage 3 foundation schema scaffold
-- Target: PostgreSQL 15+
-- NOTE: This migration is intentionally minimal and production-safe as a starting point.

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  role text not null check (role in ('student', 'admin', 'editor', 'support', 'user')),
  status text not null check (status in ('active', 'blocked', 'pending_verification')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  plan_code text not null,
  status text not null check (status in ('created', 'pending_payment', 'paid', 'failed', 'canceled', 'manual_review')),
  amount_rub integer not null,
  payment_provider text not null default 'prodamus',
  provider_order_id text unique,
  idempotency_key text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  source_order_id uuid references orders(id),
  plan_code text not null,
  status text not null check (status in ('active', 'grace', 'expired', 'suspended', 'canceled')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  -- Grace period policy fixed in docs: 72h from ends_at
  grace_ends_at timestamptz,
  -- Manual extension policy support
  manual_extended_until timestamptz,
  renewal_mode text not null default 'manual' check (renewal_mode in ('manual')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists consent_documents (
  id uuid primary key default gen_random_uuid(),
  doc_type text not null check (doc_type in ('offer', 'privacy', 'refund', 'medical_disclaimer', 'cookies')),
  version text not null,
  content_hash text not null,
  is_active boolean not null default true,
  published_at timestamptz not null default now()
);

create table if not exists user_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id),
  consent_document_id uuid not null references consent_documents(id),
  accepted_at timestamptz not null default now(),
  source text not null check (source in ('checkout', 'register', 'profile_update')),
  ip inet,
  user_agent text
);

create table if not exists payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('prodamus')),
  provider_event_id text,
  provider_payment_id text not null,
  provider_order_id text,
  event_status text not null,
  amount_rub integer not null,
  signature_valid boolean not null,
  dedup_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists zoom_links (
  id uuid primary key default gen_random_uuid(),
  room text not null unique,
  target_url text not null,
  status text not null check (status in ('active', 'inactive', 'rotating')),
  last_rotated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists zoom_redirect_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id),
  zoom_link_id uuid references zoom_links(id),
  room text not null,
  result text not null check (result in ('allowed', 'denied')),
  reason text not null,
  ip inet,
  user_agent text,
  request_id text not null,
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references users(id),
  actor_role text not null,
  action text not null,
  entity_type text not null,
  entity_id text not null,
  before_state jsonb,
  after_state jsonb,
  ip inet,
  user_agent text,
  request_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_email on users(email);
create index if not exists idx_orders_provider_order_id on orders(provider_order_id);
create index if not exists idx_subscriptions_user_status on subscriptions(user_id, status, ends_at);
create index if not exists idx_payment_events_dedup on payment_events(dedup_key);
create index if not exists idx_zoom_redirect_logs_user_created on zoom_redirect_logs(user_id, created_at desc);
create index if not exists idx_audit_log_entity_created on audit_log(entity_type, entity_id, created_at desc);

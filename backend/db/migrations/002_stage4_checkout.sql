-- Stage 4 checkout/auth persistence additions

create table if not exists idempotency_keys (
  key text primary key,
  request_hash text not null,
  response_body jsonb not null,
  status_code integer not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id),
  provider text not null check (provider in ('prodamus')),
  provider_payment_id text not null unique,
  status text not null check (status in ('processing', 'succeeded', 'failed', 'refunded', 'chargeback')),
  amount_rub integer not null,
  paid_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists subscription_events (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references subscriptions(id),
  event_type text not null check (event_type in ('activated', 'renewed', 'suspended', 'restored', 'expired', 'canceled')),
  actor_type text not null check (actor_type in ('system', 'admin', 'support')),
  actor_user_id uuid references users(id),
  reason text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists refresh_tokens (
  token text primary key,
  user_id uuid not null references users(id),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

alter table orders
  add column if not exists payment_url text,
  add column if not exists payment_expires_at timestamptz;

create index if not exists idx_idempotency_keys_expires on idempotency_keys(expires_at);
create index if not exists idx_payments_order_id on payments(order_id);
create index if not exists idx_subscription_events_subscription on subscription_events(subscription_id, created_at desc);
create index if not exists idx_refresh_tokens_user on refresh_tokens(user_id, expires_at desc);

-- Stage 6: align schema with BackendStore contract (local credentials, uniqueness)

alter table users
  add column if not exists password_hash text;

create unique index if not exists idx_consent_documents_type_version
  on consent_documents (doc_type, version);

-- Store contract is 1:1 user -> subscription row; history lives in subscription_events.
create unique index if not exists idx_subscriptions_user_id
  on subscriptions (user_id);

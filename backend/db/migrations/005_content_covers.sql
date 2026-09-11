-- Covers already exist on the live Jino DB (legacy 005_content_covers.sql).
-- Keep the column additive so INSERT/SELECT without cover_url still works.

alter table videos
  add column if not exists cover_url text not null default '';

alter table articles
  add column if not exists cover_url text not null default '';

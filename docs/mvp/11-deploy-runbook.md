# 11. Deploy runbook (Yandex Cloud / РФ)

## Цель

Выкатить MVP на российскую инфраструктуру с Postgres и self-host Auth.

## Компоненты

1. Frontend (Vite/React) — nginx / CDN на том же домене или `tjyoga.ru`
2. Backend (Fastify) — `api.tjyoga.ru`
3. Postgres — managed Yandex Managed PostgreSQL
4. Self-host Supabase Auth (опционально) или локальный JWT backend

## Перед deploy

1. Применить миграции:
   - `backend/db/migrations/001_stage3_foundation.sql`
   - `backend/db/migrations/002_stage4_checkout.sql`
   - `backend/db/migrations/003_stage5_content_admin.sql`
2. Заполнить env backend:
   - `NODE_ENV=production`
   - `AUTH_DEV_BYPASS_ENABLED=false`
   - `DATABASE_URL=...`
   - `PRODAMUS_STUB_ENABLED=false`
   - `PRODAMUS_PAYFORM_URL`, `PRODAMUS_PAYFORM_SECRET`, `PRODAMUS_WEBHOOK_SECRET`
   - `KINESCOPE_AUTH_SECRET`
   - `ZOOM_ROOM_MAIN_URL`
   - `SUPABASE_JWT_SECRET` (+ issuer/audience)
3. Frontend:
   - `VITE_API_BASE_URL=https://api.tjyoga.ru/api/v1`
4. Заменить `OPERATOR_INFO.inn` в `src/config/legalDocuments.ts` на фактический ИНН.
5. Добавить реальные Kinescope video IDs через `/admin`.

## Smoke после выкладки

1. `GET /health`
2. Регистрация → login → checkout session
3. Тестовая оплата Prodamus → webhook → `/auth/me` показывает active
4. `/account` → Zoom JSON redirect → видео/статьи
5. `/admin` под admin-ролью

## Бэкапы

- Ежедневный snapshot Postgres
- Хранить webhook secrets и JWT secret вне git

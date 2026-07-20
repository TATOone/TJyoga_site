# TJ Yoga Backend (MVP)

Backend для MVP-платформы TJ Yoga: auth, checkout/Prodamus, кабинетный контент, Zoom, Kinescope auth, админ API.

## Что реализовано

- Fastify + TypeScript, API prefix `/api/v1`
- Auth: register/login/refresh/logout + JWT (Supabase-compatible)
- Checkout session + Prodamus webhook + активация подписки
- Content: статьи/видео с проверкой подписки
- Zoom redirect (`?format=json` для SPA)
- Kinescope authorization backend
- Admin API: overview, users, videos, articles, zoom, extend subscription
- Migrations: `001`, `002`, `003` (Postgres-ready; runtime пока in-memory fallback)
- Tests: foundation + checkout + content/admin

## Локальный запуск

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend стартует на `http://localhost:8787` (если не переопределено в `.env`).

## Проверка endpoint'ов локально

### 1) Health

```bash
curl -i http://localhost:8787/health
```

### 2) Prodamus webhook

Требует корректный `x-prodamus-signature` для `raw body` (HMAC SHA256 + `PRODAMUS_WEBHOOK_SECRET`).

### 3) Kinescope auth

Нужны заголовки:

- `x-kinescope-secret: <KINESCOPE_AUTH_SECRET>`
- auth: либо `Authorization: Bearer <jwt>`, либо dev bypass headers:
  - `x-user-id`
  - `x-user-role`

### 4) Zoom redirect

Нужна авторизация. При активной подписке вернется `302`, без доступа — `403 SUBSCRIPTION_REQUIRED`.

## Dev users в in-memory store

| Role | Email | Password | UUID |
|------|-------|----------|------|
| student | student@example.com | `student-demo-pass` | `00000000-0000-4000-8000-000000000002` |
| admin | admin@example.com | `admin-demo-pass` | `00000000-0000-4000-8000-000000000001` |

Только для локальной отладки. В production `AUTH_DEV_BYPASS_ENABLED=false`.

## Структура backend

```text
backend/
  src/
    app.ts
    server.ts
    config/
    security/
    modules/
    persistence/
  db/migrations/
  tests/
```

## Security baseline (foundation)

- `helmet`, `cors allowlist`, базовый `rate-limit`.
- Runtime env validation.
- Единый формат ошибок без утечки внутренних деталей.
- Запрет кэширования для endpoint'ов авторизации (`Cache-Control: no-store`).
- Логи решений доступа для Kinescope/Zoom.

## Yandex Cloud deploy checklist (production scaffold)

> Этот шаг не делает реальный деплой, только готовит production-ready scaffold и runbook.

### 1. Containerization и runtime

- [ ] Добавить `Dockerfile` и healthcheck на `/health`.
- [ ] Подготовить запуск через YC Serverless Containers или Managed Kubernetes.
- [ ] Включить graceful shutdown и readiness probe.

### 2. Data layer

- [ ] Подключить Managed PostgreSQL.
- [ ] Применить миграции из `db/migrations`.
- [ ] Перевести `InMemoryBackendStore` на реальный repository слой (SQL/ORM).

### 3. Auth и секреты

- [ ] Подключить self-host Supabase Auth (GoTrue + Postgres).
- [ ] Настроить JWT verify через реальные `iss/aud`.
- [ ] Хранить секреты в YC Lockbox/Secret Manager.
- [ ] Включить регулярную ротацию секретов.

### 4. Observability

- [ ] Отправка JSON-логов в централизованное хранилище.
- [ ] Метрики latency/error-rate для webhook/kinescope/zoom.
- [ ] Алерты по SLA (webhook 5xx, zoom 5xx, video auth 5xx).

### 5. Networking и hardening

- [ ] TLS termination + только HTTPS.
- [ ] Ограничить CORS production-доменами.
- [ ] Настроить WAF/rate-limits на ingress.
- [ ] Ограничить доступ к admin endpoint'ам.

### 6. Release process

- [ ] Stage/prod окружения с независимыми секретами.
- [ ] CI: lint + tests + build + migration checks.
- [ ] Rollback план и runbook инцидентов.

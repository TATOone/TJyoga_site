# TODO — TJ Yoga MVP

**Последнее обновление:** 2026-09-10  
**Статус:** платформенный MVP (витрина + backend API) закодирован. Следующий критический контур: Postgres в проде и выкладка на Yandex Cloud.

Канонические решения — в `docs/mvp/` (`07-execution-plan-dod.md`, `03-api-contracts.md`, `02-domain-model-erd.md`, `backend/README.md`). Этот файл не заменяет их.

---

## Сделано

- Публичная IA: club, rates, retreats, personal, legal, blog, payment success/error.
- Кабинет и админка: `account/*`, `admin`.
- Backend Fastify `/api/v1`: auth (self-host JWT), checkout, Prodamus webhook, content, Zoom redirect, Kinescope auth, admin.
- Persistence: контракт `BackendStore`; **Postgres при `DATABASE_URL`**, in-memory fallback без БД.
- Миграции `backend/db/migrations/001`–`004`.
- Продуктовые инварианты: grace 72h, renewal SLA до 2ч (10:00–22:00 МСК), Zoom только backend redirect, Kinescope 200/403, ПДн → Yandex Cloud.

---

## Сейчас важно (не «остались только платежи»)

Prodamus-контур в коде уже есть (session + webhook + идемпотентность + активация подписки). Дальше:

1. **Postgres в окружениях** — задать `DATABASE_URL`, прогнать `npm run migrate`, проверить webhook/idempotency на реальной БД.
2. **Deploy Yandex Cloud** — контейнер backend, Managed PostgreSQL, секреты, TLS, CORS.
3. **Секреты и провайдеры** — боевые Prodamus/Kinescope/Zoom URL, `AUTH_DEV_BYPASS_ENABLED=false`.
4. **Self-host Supabase Auth** (опционально поверх текущего JWT) и admin-пользователь без demo seed.
5. **Наблюдаемость** — логи/метрики/алерты по SLA webhook и доступа.

---

## Не делать в этом контуре

- Менять платёжного провайдера или ломать HMAC/idempotency webhook.
- Хранить секреты в git (только `.env.example`).
- Считать корневой чеклист лендинга 2025 года источником правды.

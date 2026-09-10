# TODO — TJ Yoga MVP

**Последнее обновление:** 2026-09-10  
**Статус:** платформенный MVP закодирован. Боевой хостинг — VPS Jino (`tjyoga.ru`), не Cloudflare и не Yandex Cloud. Следующий пробел: `DATABASE_URL` + миграции на сервере, затем безопасный backend deploy.

Канонические решения — в `docs/mvp/` (`07-execution-plan-dod.md`, `03-api-contracts.md`, `02-domain-model-erd.md`, `backend/README.md`). Этот файл не заменяет их.

---

## Сделано

- Публичная IA: club, rates, retreats, personal, legal, blog, payment success/error.
- Кабинет и админка: `account/*`, `admin`.
- Backend Fastify `/api/v1`: auth (self-host JWT), checkout, Prodamus webhook, content, Zoom redirect, Kinescope auth, admin.
- Persistence: контракт `BackendStore`; **Postgres при `DATABASE_URL`**, in-memory fallback без БД.
- Миграции `backend/db/migrations/001`–`004`.
- Продуктовые инварианты: grace 72h, renewal SLA до 2ч (10:00–22:00 МСК), Zoom только backend redirect, Kinescope 200/403. Живой сайт на VPS Jino (РФ).

---

## Сейчас важно (не «остались только платежи»)

Prodamus-контур в коде уже есть (session + webhook + идемпотентность + активация подписки). Дальше:

1. **Postgres на VPS** — задать `DATABASE_URL` в серверном `.env`, `npm run migrate`, проверить webhook/idempotency.
2. **Deploy Jino** — `scripts/jino/*`, бэкапы в `/var/www/tjyoga/backups`. Не GitHub Pages.
3. **Секреты и провайдеры** — боевые Prodamus/Kinescope/Zoom URL, `AUTH_DEV_BYPASS_ENABLED=false`.
4. **Self-host Supabase Auth** (опционально поверх текущего JWT) и admin-пользователь без demo seed.
5. **Наблюдаемость** — логи/метрики/алерты по SLA webhook и доступа.

---

## Не делать в этом контуре

- Менять платёжного провайдера или ломать HMAC/idempotency webhook.
- Хранить секреты в git (только `.env.example`).
- Считать корневой чеклист лендинга 2025 года источником правды.

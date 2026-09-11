# Архитектура backend + Postgres на VPS Jino

Боевой контур: **один** Node-процесс `tjyoga-api` (pm2 fork) + **локальный** Postgres 16 на том же VPS. Не Cloudflare, не Yandex, не второй контейнер Postgres/Node.

Живой сайт: https://tjyoga.ru  
Корень: `/var/www/tjyoga`. Frontend — nginx `root /var/www/tjyoga/app/dist`. API — `127.0.0.1:8787`, nginx проксирует `/api/` и `/health`.

## Факт на сервере (2026-09-11)

| Ресурс | Наблюдение |
|---|---|
| RAM | 1.5GiB, swap 0. Занято ~260Mi idle, available ~1.2Gi |
| Диск | ~9.8G, занято ~37% (~5.9G свободно). Ранее звучало «70% / shedule-bot ~1GB» — сейчас Docker images/containers **0**. Не удалять чужие приложения «на всякий случай». |
| Node | pm2 `tjyoga-api`, cwd `/var/www/tjyoga/app/backend`, `dist/server.js`, `max_memory_restart: 350M`, uptime процесса был ~20 суток |
| `.env` | `DATABASE_URL` задан (localhost), `NODE_ENV=production`. В **окружении старого процесса** URL не было: dotenv читается только при старте → живой API до cutover — in-memory |
| Postgres | 16, `127.0.0.1:5432`, БД `tjyoga` (~8.6MB), роль `tjyoga`. `shared_buffers=128MB`, `work_mem=4MB`, `max_connections=100` (это **не** свободный запас) |
| Данные | 2 пользователя (admin + editor) в `local_credentials`; 4 видео / 4 статьи / 1 Zoom `main`; подписок 0. Ночные dump: cron `15 3 * * * /usr/local/bin/tjyoga-backup-db.sh` (7 дней) |

Секреты (DATABASE_URL, JWT, Prodamus, Kinescope, Zoom) только в `.env` mode 600. В git и в этом файле значений нет.

## Модель процессов

```
internet → nginx:80
            ├─ static  /var/www/tjyoga/app/dist
            ├─ /api/*  → 127.0.0.1:8787
            └─ /health → 127.0.0.1:8787/health
pm2 fork × 1  tjyoga-api
            └─ dotenv .env → Fastify → PostgresBackendStore
                               └─ pg.Pool max=4 → 127.0.0.1:5432/tjyoga
postgres 16  (local, не Docker)
```

Один инстанс. Не cluster, не второй Node «для blue/green» — на 1.5GiB это риск OOM рядом с `shared_buffers=128MB`. Cutover: короткий `pm2 reload` (fork = restart одного процесса).

`HOST=127.0.0.1` — API не торчит наружу. Production без `DATABASE_URL` **не стартует** (fail closed).

## Домены → таблицы

| Поток | Таблицы | Инварианты |
|---|---|---|
| Auth register/login/refresh | `users`, `local_credentials`, `users.password_hash`, `refresh_tokens` | Dual-write хеша: новый код пишет в обе таблицы. Чтение `COALESCE(users.password_hash, local_credentials.password_hash)` — иначе live admin/editor не залогинятся |
| Checkout | `orders`, `idempotency_keys`, `user_consents` + `consent_documents` | Идемпотентность по ключу; согласия через documents (legacy `consents` не дропаем) |
| Prodamus webhook | `payment_events` (unique `dedup_key`), `payments`, `orders`, `subscriptions`, `subscription_events` | Обработка в `runInTransaction`. Повтор webhook = duplicate, без второй активации |
| Подписка / grace 72h | `subscriptions` 1:1 на user (`idx_subscriptions_user_id`) | Источник правды для Zoom/Kinescope/клубного контента. История — `subscription_events` |
| Контент | `videos`, `articles` (+ `cover_url` с 005) | Seed каталога **только если таблица пустая** — на live уже 4+4 с другими UUID |
| Zoom redirect | `zoom_links`, `zoom_redirect_logs` | URL только с backend; `ON CONFLICT (room) DO NOTHING` не затирает боевой URL |
| Kinescope auth | `users` + `subscriptions` + `videos` | 200 allow / 403 deny; секрет в заголовке, не в git |
| Admin | те же таблицы + `audit_log` | overview / users / videos / articles / zoom / extend |

Миграции `backend/db/migrations/001`–`006`. На live схема уже была (001–003 + legacy `004_local_auth_consents` + `005_content_covers`) **без** `schema_migrations`. Наши файлы идемпотентны (`IF NOT EXISTS` / `ADD COLUMN IF NOT EXISTS`). `006` копирует хеши и оставляет legacy-таблицы.

## Пул соединений

Не считать `max_connections=100` запасом: каждая PG-сессия ест RAM, рядом Node 70MB + dockerd + shared_buffers 128MB.

| Параметр | Значение | Зачем |
|---|---|---|
| `PG_POOL_MAX` | **4** (default) | 1 fork × 4 < запас на `psql`, cron dump, migrate (max 1) |
| idle timeout | 10s | Не держать сессии |
| statement_timeout | 5s (runtime pool) | Миграции идут отдельным пулом max=1 **без** короткого timeout |
| application_name | `tjyoga-api` / `tjyoga-migrate` | Видно в `pg_stat_activity` |

Рекомендуемый потолок PG (нужен restart для `max_connections` — **не применять молча**):

```
max_connections = 30          # restart
effective_cache_size = 512MB  # reload; сейчас ошибочно 4GB
shared_buffers = 128MB        # уже стоит, не поднимать
work_mem = 4MB                # уже стоит
```

Opt-in: `scripts/jino/tune-postgres.sql` + инструкция внизу. Swap 1G — см. PR notes, не создавать без согласия оператора (сейчас 5.9G свободно, но это меняет поведение OOM).

## Миграции и cutover

Порядок `scripts/jino/deploy.sh --backend`:

1. Inspect. Отказ, если production без `DATABASE_URL`.
2. Сборка backend **на агенте**, не `tsc` на VPS.
3. `pg_dump -Fc` → `/var/www/tjyoga/backups/pg-predeploy-<stamp>.dump` (пароль только в env процесса dump, не в stdout).
4. tar cwd pm2 → `backups/backend-tree-<stamp>.tgz`.
5. Релиз в `releases/backend/<stamp>/`, `npm ci --omit=dev` (`NODE_OPTIONS=--max-old-space-size=384`).
6. `node dist/scripts/migrate.js` **пока старый API ещё отвечает** (in-memory не читает PG; DDL аддитивный).
7. Promote в live cwd, `.env` не перетирается.
8. `pm2 reload` существующего `ecosystem.config.cjs` (один процесс).
9. `/health` должен быть 200, `"store":"postgres"`, `"database":"up"`. Иначе откат кода из tar и повторный reload.

Старт процесса всё ещё прогоняет миграции (advisory lock, один connection). Это страховка, не замена шага 6.

## Бэкап и откат

| Что | Где |
|---|---|
| Ночной dump | `/var/www/tjyoga/backups/tjyoga-YYYY-MM-DD.dump`, retention 7 дней |
| Dump перед выкладкой | `pg-predeploy-<stamp>.dump` |
| Код | `backend-tree-<stamp>.tgz` |

Откат **кода** (если `/health` не 200):

```bash
# делает deploy.sh автоматически; вручную:
# распаковать backups/backend-tree-<stamp>.tgz в cwd pm2
# сохранить .env
pm2 reload /var/www/tjyoga/ecosystem.config.cjs
```

Откат **схемы** обычно не нужен: 001–006 аддитивны, старый in-memory код БД не использует, старый Postgres-store читает `local_credentials` (dual-write это сохраняет). Полный restore только если данные повреждены:

```bash
sudo -u postgres pg_restore --clean --if-exists -d tjyoga /var/www/tjyoga/backups/pg-predeploy-<stamp>.dump
```

Это про Downtime. Не делать «на всякий случай».

## Health

`GET /health` (и снаружи https://tjyoga.ru/health):

```json
{
  "data": {
    "status": "ok",
    "store": "postgres",
    "database": "up"
  }
}
```

`store=memory` / `database=n/a` — не production. `database=down` → HTTP 503.

## Диск и соседи

Не трогать `shedule-bot` / Python, если они снова появятся. Давление по диску: `app/.puppeteer-cache`, `app/.lighthouseci`, старые `releases/` — чистить только после подтверждения. Uploads (`/var/www/tjyoga/uploads`) деплой не трогает.

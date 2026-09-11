# 11. Deploy runbook (Jino VPS / tjyoga.ru)

## Цель

Выкатить MVP на **уже живой** VPS Jino. Production target: https://tjyoga.ru  
Не Cloudflare и не Yandex Cloud.

Пошаговые скрипты, бэкапы и откат: [`docs/ops/jino-vps-deploy.md`](../ops/jino-vps-deploy.md).

## Компоненты (факт на сервере)

1. Frontend — nginx root `/var/www/tjyoga/app/dist`
2. Backend Fastify — `127.0.0.1:8787`, pm2, nginx проксирует `/api/` и `/health`
3. Postgres — подключается через `DATABASE_URL` в серверном `.env` (не в git). Пока URL нет, эта ветка не должна стартовать с `NODE_ENV=production`
4. Auth — текущий self-host JWT; Supabase опционален

## Перед deploy

1. Inspect: `./scripts/jino/inspect.sh` (нужен `JINO_SSH_PRIVATE_KEY`).
2. Frontend: `VITE_API_BASE_URL=https://tjyoga.ru/api/v1` (same-origin, не `api.tjyoga.ru`).
3. Backend env на сервере (файл `.env`, chmod 600), не в репозитории:
   - `NODE_ENV=production` только вместе с `DATABASE_URL`
   - `AUTH_DEV_BYPASS_ENABLED=false`
   - `APP_ALLOWED_ORIGINS=https://tjyoga.ru`
   - Prodamus / Kinescope / Zoom / JWT secrets как сейчас на сервере
4. Миграции при наличии `DATABASE_URL`: `npm run migrate` в cwd backend **или** авто-apply на старте Postgres-store (`001`–`004`).
5. Не копировать GitHub Pages workflow: он не деплоит этот VPS.

## Команды

```bash
./scripts/jino/inspect.sh
./scripts/jino/deploy.sh --frontend
# backend только после inspect и DATABASE_URL / безопасного NODE_ENV:
./scripts/jino/deploy.sh --backend
```

Релизы: `/var/www/tjyoga/releases/{frontend,backend}/<stamp>`  
Бэкапы: `/var/www/tjyoga/backups/*-<stamp>.tgz`

## Smoke после выкладки

1. `GET https://tjyoga.ru/health`
2. `GET https://tjyoga.ru/api/v1`
3. Регистрация → login → checkout session (если платежный контур включён)
4. Кабинет / Zoom JSON redirect / статьи
5. При Postgres: повторный webhook не дублирует оплату

## Бэкапы

- Перед каждой выкладкой скрипт пишет tar в `/var/www/tjyoga/backups`
- Не трогать `/var/www/tjyoga/uploads`
- Секреты и JWT/webhook только в `.env` на диске VPS

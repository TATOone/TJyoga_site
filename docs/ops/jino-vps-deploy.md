# Deploy на Jino VPS (боевой контур)

Живой сайт: https://tjyoga.ru  
Это **не** Cloudflare и **не** Yandex Cloud. Production — VPS Jino.

| | |
|---|---|
| SSH | `root@da38d1308862.vps.myjino.ru` порт `49242` (IP `81.177.141.117`) |
| Корень | `/var/www/tjyoga` |
| Frontend (nginx root) | `/var/www/tjyoga/app/dist` |
| Uploads | `/var/www/tjyoga/uploads` |
| Backups / releases / logs / ecosystem | `/var/www/tjyoga/{backups,releases,logs,ecosystem.config.cjs}` |
| API | nginx `tjyoga` проксирует `/api/` и `/health` на `http://127.0.0.1:8787` |
| Runtime | Node 20 + pm2 |

Секреты (SSH-ключ, `DATABASE_URL`, webhook/JWT) **не коммитить**. На сервере они живут в `.env` процесса pm2 (`chmod 600`).

Канонический runbook этапа: также `docs/mvp/11-deploy-runbook.md`. GitHub Pages workflow (`.github/workflows/deploy.yml`) к этому хостингу не относится.

## 1. Секреты агента / локальной машины

Нужны переменные окружения (значения не логировать):

- `JINO_SSH_PRIVATE_KEY` — PEM (многострочный или одна строка)
- `JINO_SSH_HOST=da38d1308862.vps.myjino.ru`
- `JINO_SSH_PORT=49242`
- `JINO_SSH_USER=root`

Ключ пишется во временный файл режима `600`, в stdout попадает только путь:

```bash
python3 scripts/jino/write-key.py
scripts/jino/ssh.sh 'echo SSH_OK'
```

SSH всегда: `BatchMode=yes`, `IdentitiesOnly=yes`, `PreferredAuthentications=publickey`.

Проверка без утечки ключа:

```bash
test -n "$JINO_SSH_PRIVATE_KEY" && echo KEY=SET || echo KEY=MISSING
test -n "$JINO_SSH_HOST" && echo HOST=SET || echo HOST=MISSING
test -n "$JINO_SSH_PORT" && echo PORT=SET || echo PORT=MISSING
test -n "$JINO_SSH_USER" && echo USER=SET || echo USER=MISSING
```

Runtime Secrets подхватываются при **старте** Cloud Agent. Follow-up на уже запущенной VM может видеть `MISSING`, даже если repo-scope секрета уже починен. В этом случае нужен новый агент, а не повтор на том же процессе.

## 2. Сначала inspect

```bash
chmod +x scripts/jino/*.sh
./scripts/jino/inspect.sh
```

Скрипт не печатает значения секретов: для `.env` только `KEY=set|empty`, для `DATABASE_URL` — да/нет.

Сверьте с фактом на сервере:

- cwd/script pm2 (не предполагайте путь, если inspect показал другой);
- есть ли `ecosystem.config.cjs`;
- `NODE_ENV` и задан ли `DATABASE_URL`;
- nginx `root` и `proxy_pass`.

Пример `deploy/ecosystem.config.cjs.example` — запасной шаблон, если на сервере файла ещё нет. Предпочитайте существующий ecosystem.

## 3. Frontend (безопасный путь)

Сборка same-origin API, как режет nginx:

```bash
VITE_API_BASE_URL=https://tjyoga.ru/api/v1 ./scripts/jino/deploy.sh --frontend
```

Что происходит:

1. Inspect.
2. `tar` бэкап текущего `/var/www/tjyoga/app/dist` → `/var/www/tjyoga/backups/frontend-dist-<stamp>.tgz`.
3. Релиз в `/var/www/tjyoga/releases/frontend/<stamp>/`.
4. Копия релиза в nginx root.
5. Smoke `https://tjyoga.ru/health`.

Откат:

```bash
# на сервере
cd /var/www/tjyoga/app
tar -xzf /var/www/tjyoga/backups/frontend-dist-<stamp>.tgz
```

`uploads/` скрипт не трогает.

## 4. Backend (безопасный cutover на Postgres)

Живой `/health` до выкладки может быть in-memory (долгий uptime, `DATABASE_URL` только в `.env`). Эта ветка **не стартует** при `NODE_ENV=production` без `DATABASE_URL`.

Каноническая архитектура: [`postgres-vps-architecture.md`](./postgres-vps-architecture.md).

```bash
export JINO_SSH_PRIVATE_KEY="${JINO_SSH_PRIVATE_KEY:-$SSH_PRIVATE_KEY}"
./scripts/jino/deploy.sh --backend
```

Скрипт **откажется** выкладывать backend, если `NODE_ENV=production` и `DATABASE_URL` пуст.

Иначе:

1. Inspect.
2. Сборка backend **локально** (не `tsc` на 1.5GiB).
3. `pg_dump -Fc` → `/var/www/tjyoga/backups/pg-predeploy-<stamp>.dump`.
4. tar cwd pm2 → `backups/backend-tree-<stamp>.tgz`.
5. Релиз без `.env`; на сервере `npm ci --omit=dev`.
6. `node dist/scripts/migrate.js` (**пока старый процесс ещё жив**).
7. Promote в live cwd **без замены `.env`**.
8. `pm2 reload` существующего `ecosystem.config.cjs` (один fork, без dual-running).
9. Локальный `curl 127.0.0.1:8787/health` — HTTP 200, `"store":"postgres"`, `"database":"up"`. Иначе автоматический откат кода из tar.

Откат кода: распаковать `backups/backend-tree-<stamp>.tgz` в cwd и `pm2 reload`. Схему не откатывать без повреждения данных — 001–006 аддитивны.

Полный прогон: `./scripts/jino/deploy.sh --all`.

## 5. Postgres / DATABASE_URL на сервере (без секретов в git)

1. Поставить Postgres на этот же VPS **или** указать managed URL. Расширения: `pgcrypto`, `citext`.
2. Создать роль/БД. Строку подключения записать только в серверный файл:

```bash
# на VPS, не в репозитории — фактический путь live cwd:
# /var/www/tjyoga/app/backend/.env
install -m 600 /dev/null /var/www/tjyoga/app/backend/.env
# вписать DATABASE_URL=postgres://...  и остальные ключи из backend/.env.example
# NODE_ENV=production
# AUTH_DEV_BYPASS_ENABLED=false
# APP_ALLOWED_ORIGINS=https://tjyoga.ru
# HOST=127.0.0.1
# PORT=8787
# PG_POOL_MAX=4
```

3. Если `DATABASE_URL` задан — `node dist/scripts/migrate.js` (`001`–`006`, идемпотентно).
4. Не коммитить `.env`. В pm2 не хранить пароль в git-tracked `ecosystem.config.cjs` — dotenv читает `.env` из cwd (`backend/src/server.ts`). Пул: `PG_POOL_MAX=4`.
5. После cutover: `curl -i https://tjyoga.ru/health` — `"store":"postgres"`. Регистрация/login (боевые admin/editor живут в `local_credentials`). Checkout не обязателен сразу, но webhook Prodamus должен остаться с тем же секретом, что в `.env`.

Пока `DATABASE_URL` не задан, оставляйте текущий in-memory процесс (если `NODE_ENV` не `production`) либо не выкладывайте backend этой ветки.

## 6. Когда не деплоить

- Нет SSH-ключа в окружении.
- Inspect не совпал с ожидаемым layout и непонятно, куда pm2 смотрит.
- Backend: `NODE_ENV=production` без `DATABASE_URL`.
- `/health` после reload не `200`. Сразу откат из `backups/`.

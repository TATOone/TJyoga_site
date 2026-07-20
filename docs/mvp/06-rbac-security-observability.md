# 06. RBAC, Security, Observability

## 1) RBAC матрица (MVP)

Обозначения: `R` = read, `W` = write/manage, `-` = нет доступа.

| Ресурс/операция | student | support | editor | admin |
|---|---|---|---|---|
| Собственный профиль | R/W | R (чтение чужого ограниченно) | - | R/W |
| Своя подписка/платежи | R | R | - | R/W |
| Чужие подписки | - | R | - | R/W |
| Ручное продление подписки | - | - | - | W |
| Статьи (черновики/публикация) | R (только доступные) | R | W | W |
| Видео (карточки/доступ) | R (только доступные) | R | W | W |
| Zoom ссылки (просмотр) | - | - | - | R |
| Zoom ротация | - | - | - | W |
| Audit log | - | - | - | R |
| Управление ролями пользователей | - | - | - | W |

Правило по умолчанию: deny-by-default. Любой endpoint явно декларирует минимальную роль.

## 2) Security baseline

## 2.0 Фиксированный auth-стек (blocker resolved)

- Решение: `self-host Supabase Auth` (GoTrue + Postgres) как единый auth-провайдер для MVP.
- Backend работает как policy/enforcement слой (RBAC, доступы, аудит), а не как отдельный источник auth-истины.
- Любые auth-флоу Stage 3 реализуются поверх Supabase Auth без fallback на custom auth-модуль.

## 2.1 Аутентификация и сессии

- Access token: 15 минут (issuer: self-host Supabase Auth).
- Refresh token: 30 дней, ротация на refresh.
- Backend верифицирует JWT по `iss/aud/exp/sub` и policy-клеймам.
- Хранение refresh: `httpOnly + secure` cookie.
- Logout инвалидирует refresh токен через Supabase Auth API.

## 2.2 Защита API

- Rate limiting:
  - auth endpoints: жесткий лимит;
  - webhook endpoint: лимит по source + подписи;
  - videos/zoom: лимит по user id + ip.
- CORS: whitelist только доменов проекта.
- CSRF: обязательная защита для cookie-based auth.
- Валидация payload: schema-first (zod/class-validator).
- Стандартизированный error contract без утечки внутренней информации.

## 2.3 Секреты и env

Критичные переменные:

- `DATABASE_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `PRODAMUS_WEBHOOK_SECRET`
- `PRODAMUS_API_KEY_TEST`
- `PRODAMUS_API_KEY_LIVE`
- `KINESCOPE_AUTH_SECRET`
- `ZOOM_REDIRECT_ENCRYPTION_KEY`
- `SENTRY_DSN` (или аналог)
- `YANDEX_CLOUD_*` (если используются managed сервисы)

Политика:

1. Не хранить секреты в git.
2. Разделять test/prod секреты.
3. Ротация минимум раз в 90 дней или немедленно при инциденте.
4. Доступ к секретам по принципу least privilege.

## 2.4 Data protection (персональные данные)

- Production в Yandex Cloud (РФ).
- Шифрование каналов (TLS 1.2+).
- Шифрование чувствительных полей at rest (например Zoom URL).
- Минимизация ПДн: не собирать лишние медицинские данные.
- Политика retention: хранить только срок, необходимый для оказания услуг и юридической отчетности.

## 3) Audit и журналирование

## 3.1 Что пишем в audit_log

- Ручное продление/пауза/отмена подписки.
- Изменение ролей пользователей.
- Изменение тарифов и цен.
- Ротация Zoom ссылок.
- Публикация/депубликация статей и видео.

Поля:

- actor, action, entity, before/after, timestamp, request_id, ip, user_agent.

## 3.2 Прикладные логи

Категории:

- `auth`
- `checkout`
- `webhook`
- `subscription`
- `video_access`
- `zoom_redirect`
- `admin_action`

Лог-формат: JSON, обязательно `timestamp`, `level`, `request_id`, `user_id?`, `event`, `result`.

## 4) Monitoring и алерты

## 4.1 Golden signals

- Latency (p50/p95/p99)
- Error rate
- Throughput
- Saturation (CPU/RAM/DB connections)

## 4.2 Продуктовые/бизнес-метрики

- Количество `checkout_started` / `payment_succeeded`.
- Webhook success/fail ratio.
- Количество `403` на video/zoom при активной подписке (аномалия).
- Количество ручных продлений по дням.

## 4.3 Алертинг (минимум)

- `webhook 5xx > 2% за 5 минут`
- `нет успешных webhook > 30 минут` при наличии checkout
- `zoom redirect 5xx > 1%`
- `video access 5xx > 1%`
- `db connection saturation > 85%`

Каналы: Telegram/Slack on-call + email.

## 5) Backup/Restore

## 5.1 Backup policy

- PostgreSQL:
  - ежедневный full backup;
  - WAL/incremental каждые 15 минут;
  - хранение минимум 30 дней.
- Конфигурация и миграции — в git.
- Секреты — отдельно, под контролем доступа.

## 5.2 Restore objectives

- Целевой `RPO`: <= 15 минут.
- Целевой `RTO`: <= 2 часа.

## 5.3 Drill

- Тестовый restore минимум 1 раз в месяц.
- Проверка консистентности после восстановления:
  - users/subscriptions/orders/payments связаны корректно;
  - последние webhook события присутствуют.

## 6) Минимальный incident runbook

1. Зафиксировать инцидент и назначить incident owner.
2. Оценить impact (платежи, доступ к видео, доступ к Zoom).
3. Ввести ограничение риска (feature flag, временное отключение endpoint, ротация секрета).
4. Восстановить сервис (rollback/fix/restore).
5. Провести postmortem: причина, действия, preventive меры.

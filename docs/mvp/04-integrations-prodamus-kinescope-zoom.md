# 04. Интеграции: Prodamus, Kinescope, Zoom

## 1) Prodamus: платежный поток и webhook

## 1.1 Checkout flow (MVP)

1. Frontend вызывает `POST /api/v1/checkout/session`.
2. Backend:
   - валидирует `plan_code` и обязательные согласия;
   - создает `orders(status=pending_payment)`;
   - получает `payment_url`/форму от Prodamus;
   - возвращает данные клиенту.
3. Клиент отправляет пользователя на оплату.
4. Prodamus отправляет webhook на backend.
5. Backend валидирует подпись, дедуплицирует событие, обновляет `payments/orders/subscriptions`.
6. Страница `/payment/success` запрашивает `GET /checkout/orders/{order_id}` и показывает фактический статус.

## 1.2 Проверка подписи webhook (обязательно)

Конфигурация:

- `PRODAMUS_WEBHOOK_SECRET`
- `PRODAMUS_SIGNATURE_HEADER` (по умолчанию `X-Prodamus-Signature`)
- `PRODAMUS_SIGNATURE_ALGO` (`sha256`)

Алгоритм:

1. Берем `raw_body` без модификации JSON.
2. Вычисляем `HMAC_SHA256(raw_body, secret)`.
3. Сравниваем с подписью из заголовка в constant-time режиме.
4. При несовпадении: `401 SIGNATURE_INVALID`, пишем `payment_events(signature_valid=false)`.

## 1.3 Idempotent webhook processing

`dedup_key`:

- при наличии provider event id: `prodamus:<event_id>`;
- иначе fallback: `prodamus:<provider_payment_id>:<status>:<amount>`.

Правило обработки:

1. Если `dedup_key` уже обработан, вернуть `200` (без повторного изменения подписки).
2. Если новый — обрабатываем транзакционно.

## 1.4 Retry и отказоустойчивость

- Любая ошибка базы/бизнес-логики -> `500`, чтобы провайдер повторил webhook.
- После N (например, 10) неуспешных попыток событие уходит в `manual_review` + алерт support/admin.
- Время ответа webhook endpoint целевое: < 2 сек.

## 1.5 Mapping статусов Prodamus -> доменная модель

- `paid` -> `payments.succeeded`, `orders.paid`, `subscriptions.active`.
- `failed/declined` -> `payments.failed`, `orders.failed`.
- `refunded` -> `payments.refunded`, `subscriptions.suspended|canceled` (по policy).

## 2) Kinescope: authorization backend (200/403)

## 2.1 Принцип доступа

- Frontend **не хранит** публичные прямые URL видео.
- Перед запуском плеера клиент запрашивает `POST /api/v1/videos/{video_id}/access-token`.
- Backend проверяет:
  1. user authenticated;
  2. роль (`student` и выше);
  3. статус подписки (`active` или `grace`, где `grace = 72 часа` после `ends_at`);
  4. доступность видео (`is_published`, `access_level`).

При успехе:

- вернуть short-lived token (TTL 120 сек).

При отказе:

- `403 SUBSCRIPTION_REQUIRED`.

## 2.2 Server-to-server check (Kinescope -> backend)

Backend endpoint авторизации Kinescope должен:

- принимать контекст запроса от Kinescope;
- сопоставлять пользователя и видео;
- возвращать:
  - `200` — доступ разрешен;
  - `403` — доступ запрещен.

Обязательные логи:

- `user_id`
- `video_id`
- `subscription_status`
- `decision=allow|deny`
- `reason`
- `request_id`

## 2.3 Безопасность

- Domain allowlist: только production домены проекта.
- Token TTL <= 120 секунд.
- Запрет кэширования ответов авторизации (`Cache-Control: no-store`).
- Rate limit на endpoint выдачи токена.

## 3) Zoom: backend redirect без прямой ссылки во frontend

## 3.1 Поток входа

1. Пользователь нажимает "Войти в Zoom".
2. Frontend вызывает `GET /api/v1/account/zoom/redirect`.
3. Backend:
   - проверяет auth + активную подписку;
   - выбирает активную ссылку из `zoom_links`;
   - пишет `zoom_redirect_logs`;
   - отвечает `302 Location: <zoom_target_url>`.

Важно: frontend не получает URL в JSON, только редирект.

## 3.2 Логирование переходов

Записывать:

- `user_id`
- `subscription_status`
- `zoom_link_id`
- `result=allowed|denied`
- `reason`
- `ip`, `user_agent`
- `created_at`

Использование:

- аудит утечек/злоупотреблений;
- поддержка пользователей при проблемах входа;
- метрики посещаемости эфиров.

## 3.3 Ротация Zoom-ссылок

MVP-процедура:

1. admin обновляет `target_url` через `POST /admin/zoom-links/{id}/rotate`.
2. Старый URL переводится в `inactive`, новый в `active`.
3. Действие записывается в `audit_log`.
4. Support получает уведомление о времени смены.

Рекомендуемая частота:

- плановая: 1 раз в 2-4 недели;
- внеплановая: сразу при подозрении на утечку.

## 3.4 Владелец Zoom-ротации (blocker resolved)

- Решение: `zoom_owner = admin_owner`.
- Только `admin_owner` утверждает плановую/внеплановую ротацию и окно переключения.
- Support и editor не меняют Zoom URL напрямую, только эскалируют инциденты владельцу.

## 3.5 Операционная policy ручного продления (blocker resolved)

- `grace_period = 72h` после `subscriptions.ends_at`.
- Целевой SLA подтверждения ручного продления: до 2 часов.
- SLA действует ежедневно в окне `10:00-22:00 МСК`.
- Заявки вне окна обрабатываются в ближайшем рабочем слоте с приоритетом по времени поступления.
- При нарушении SLA эскалация идет в канал `admin_owner` + support.

## 4) Набор обязательных интеграционных тестов (Stage 7)

1. **Prodamus success webhook** активирует подписку (happy path).
2. **Повторный webhook** не создает дубль подписки/платежа.
3. **Webhook с плохой подписью** отклоняется (`401`), доступ не выдается.
4. **Kinescope auth с активной подпиской** -> `200`.
5. **Kinescope auth без подписки** -> `403`.
6. **Zoom redirect с активной подпиской** -> `302`.
7. **Zoom redirect без подписки** -> `403`.
8. **Ротация Zoom-ссылки** не ломает новые переходы.

## 5) Интеграционные риски и меры

- Риск: потеря webhook событий из-за временных сбоев.
  - Мера: идемпотентная запись событий + retry + алерты.

- Риск: утечка Zoom URL.
  - Мера: backend redirect + ротация + аудит.

- Риск: нестабильный доступ к видео.
  - Мера: короткоживущие токены + healthcheck authorization endpoint.

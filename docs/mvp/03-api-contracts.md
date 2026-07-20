# 03. API Contracts v1

## 1) Общие правила API

- Base URL: `/api/v1`
- Формат: `application/json; charset=utf-8`
- Время: ISO 8601 UTC (`2026-06-11T21:30:00Z`)
- Деньги: integer в копейках (`amount_rub: 600000` = 6 000.00 RUB)
- Авторизация: `Authorization: Bearer <access_token>`
- Correlation: `X-Request-Id` во всех ответах
- Идемпотентность: `Idempotency-Key` для критичных POST

Стандарт успешного ответа:

```json
{
  "data": {},
  "meta": {
    "request_id": "5d1f2dbe-2d51-4fd2-8d3c-5f8f13bcf98d"
  }
}
```

Стандарт ошибки:

```json
{
  "error": {
    "code": "SUBSCRIPTION_REQUIRED",
    "message": "Требуется активная подписка",
    "details": {
      "required_status": "active"
    }
  },
  "meta": {
    "request_id": "5d1f2dbe-2d51-4fd2-8d3c-5f8f13bcf98d"
  }
}
```

## 2) Коды ошибок (единый словарь)

- `VALIDATION_ERROR` -> `400`
- `UNAUTHORIZED` -> `401`
- `FORBIDDEN` -> `403`
- `NOT_FOUND` -> `404`
- `CONFLICT` -> `409`
- `IDEMPOTENCY_CONFLICT` -> `409`
- `RATE_LIMITED` -> `429`
- `PROVIDER_UNAVAILABLE` -> `502`
- `INTERNAL_ERROR` -> `500`
- `SUBSCRIPTION_REQUIRED` -> `403`
- `SIGNATURE_INVALID` -> `401` (для webhook)

## 3) Idempotency policy

Обязательна для:

- `POST /checkout/session`
- `POST /admin/subscriptions/{id}/extend`
- `POST /admin/zoom-links/{id}/rotate`

Правила:

1. Клиент передает `Idempotency-Key` (uuid v4).
2. Сервер хранит key + hash тела запроса минимум 24 часа.
3. Повтор с тем же ключом и тем же телом возвращает сохраненный результат (`200/201`).
4. Повтор с тем же ключом и другим телом -> `409 IDEMPOTENCY_CONFLICT`.

## 4) Retry policy

### Для frontend/backend клиентов

- Ретраить только `5xx`, `429`, сетевые таймауты.
- Не ретраить `4xx` (кроме `429`).
- Backoff: `0.5s -> 2s -> 5s`, максимум 3 повтора.
- Таймаут запроса: 8 секунд для read, 15 секунд для write.

### Для webhook обработчика

- Endpoint должен отвечать `2xx` только когда событие валидировано и поставлено в обработку.
- На временные ошибки отдавать `5xx`, чтобы провайдер повторил доставку.
- Дедупликация обязательна по `provider_payment_id + event_status` (или provider event id).

## 5) Auth API

Фиксированное решение по стеку:

- `auth_stack = selfhost_supabase_auth`.
- Контур `register/login/refresh/logout` реализуется через backend facade над self-host Supabase Auth.
- Backend обязан проверять JWT (`iss/aud/exp/sub`) и применять локальные RBAC policy.

## `POST /auth/register`

Создание пользователя `student`.

Request:

```json
{
  "email": "user@example.com",
  "password": "StrongPass!23",
  "first_name": "Анна",
  "phone": "+79990000000"
}
```

Response `201`:

```json
{
  "data": {
    "user_id": "8bd4f8e3-b0f1-4b94-9b88-88f4a198d2ef",
    "role": "student",
    "status": "active"
  }
}
```

## `POST /auth/login`

Request:

```json
{
  "email": "user@example.com",
  "password": "StrongPass!23"
}
```

Response `200`:

```json
{
  "data": {
    "access_token": "<jwt>",
    "refresh_token": "<jwt>",
    "expires_in_sec": 900,
    "user": {
      "id": "8bd4f8e3-b0f1-4b94-9b88-88f4a198d2ef",
      "role": "student"
    }
  }
}
```

## `POST /auth/refresh`
- Обновляет access token по refresh token.
- `401` при невалидном/отозванном refresh.

## `POST /auth/logout`
- Инвалидирует refresh token.
- Response: `204`.

## `GET /auth/me`
- Возвращает профиль, роль и текущий статус подписки.

## 6) Checkout API

## `POST /checkout/session`

Назначение: создать заказ и получить ссылку/форму оплаты Prodamus.

Headers:
- `Authorization: Bearer ...`
- `Idempotency-Key: <uuid>`

Request:

```json
{
  "plan_code": "club-month",
  "return_url_success": "https://tjyoga.ru/payment/success",
  "return_url_error": "https://tjyoga.ru/payment/error",
  "accept_consents": [
    {
      "doc_type": "offer",
      "version": "1.0.0"
    },
    {
      "doc_type": "privacy",
      "version": "1.0.0"
    },
    {
      "doc_type": "medical_disclaimer",
      "version": "1.0.0"
    }
  ]
}
```

Response `201`:

```json
{
  "data": {
    "order_id": "4fa4d8e7-9f8c-4468-856d-f5f4d05b2a08",
    "status": "pending_payment",
    "payment_provider": "prodamus",
    "payment_url": "https://payform.ru/....",
    "expires_at": "2026-06-11T22:15:00Z"
  }
}
```

Ошибки:
- `400 VALIDATION_ERROR` (неверный тариф, отсутствуют обязательные согласия)
- `409 IDEMPOTENCY_CONFLICT`
- `502 PROVIDER_UNAVAILABLE`

## `GET /checkout/orders/{order_id}`
- Возвращает статус заказа и связанный платеж.
- Используется экраном success/error для актуального состояния.

## 7) Payments Webhook API

## `POST /payments/prodamus/webhook`

Назначение: прием уведомлений оплаты от Prodamus.

Headers:
- `Content-Type: application/json`
- `X-Prodamus-Signature: <signature>` (имя заголовка конфигурируется)

Response:
- `200` — событие принято и поставлено в обработку (или дубликат безопасно проигнорирован)
- `401 SIGNATURE_INVALID` — подпись невалидна
- `400 VALIDATION_ERROR` — payload не парсится
- `500` — временная ошибка, нужен retry

Payload (нормализованный пример):

```json
{
  "provider_payment_id": "pdm_12345",
  "provider_order_id": "order_abc",
  "status": "paid",
  "amount_rub": 600000,
  "paid_at": "2026-06-11T21:40:00Z",
  "raw": {}
}
```

Пост-условия:

1. Запись в `payment_events`.
2. Обновление `payments` и `orders`.
3. Активация или продление `subscriptions`.
4. Запись в `subscription_events` + `audit_log` (actor=`system`).

## 8) Account API

Требует роль: `student` или выше.

## `GET /account/dashboard`

Response:

```json
{
  "data": {
    "subscription": {
      "status": "active",
      "plan_code": "club-month",
      "ends_at": "2026-07-11T00:00:00Z"
    },
    "next_actions": [
      "enter_zoom",
      "watch_last_video"
    ],
    "latest_content": {
      "videos": [],
      "articles": []
    }
  }
}
```

## `GET /account/subscription`
- Детальный статус подписки + история продлений.
- Если статус `grace`, backend возвращает `grace_ends_at` (`ends_at + 72h`).

## `GET /account/payments`
- Список платежей пользователя (пагинация).

## `POST /account/subscription/renew-intent`
- Фиксирует намерение на ручное продление (для support-воронки).
- Операционный SLA подтверждения: до 2 часов в окне `10:00-22:00 МСК` (`renewal_sla`).

## `GET /account/zoom/redirect`
- Сервер проверяет подписку и делает `302` на текущий Zoom URL.
- При запрете: `403 SUBSCRIPTION_REQUIRED`.
- Прямой Zoom URL в body/front не возвращать.

## 9) Videos API

## `GET /videos`

Параметры: `category`, `page`, `page_size`.  
Возвращает только контент, доступный текущей роли и подписке.

## `POST /videos/{video_id}/access-token`

Назначение: получить short-lived token для Kinescope player.

Response `200`:

```json
{
  "data": {
    "video_id": "2c31f5ac-5f6c-4fb3-a0e7-b4d1d32ae612",
    "kinescope_video_id": "abc123",
    "token": "<short_lived_jwt>",
    "expires_in_sec": 120
  }
}
```

`403 SUBSCRIPTION_REQUIRED` если подписка неактивна.

## 10) Articles API

## `GET /articles`
- Публично: возвращает только `visibility=public` и `status=published`.
- Авторизованно с активной подпиской: включает `club_only`.

## `GET /articles/{slug}`
- `404` если статья отсутствует или недоступна роли/подписке.

## 11) Admin API

Требует роль `admin`, часть эндпоинтов доступна `editor/support` по RBAC.

## `GET /admin/users`
- Роли: `admin`, `support`.

## `GET /admin/subscriptions`
- Фильтры: `status`, `plan_code`, `ends_before`.

## `POST /admin/subscriptions/{id}/extend`

Headers:
- `Idempotency-Key`

Request:

```json
{
  "extend_days": 30,
  "reason": "manual renewal confirmed in chat"
}
```

Response `200`:

```json
{
  "data": {
    "subscription_id": "7f25b4fd-56e8-4b3e-9e7d-2f52cf2d4f5f",
    "status": "active",
    "old_ends_at": "2026-07-11T00:00:00Z",
    "new_ends_at": "2026-08-10T00:00:00Z"
  }
}
```

## `POST /admin/videos`
- Роли: `admin`, `editor`.
- Создает карточку видео и правила доступа.

## `PATCH /admin/articles/{id}`
- Роли: `admin`, `editor`.

## `POST /admin/zoom-links/{id}/rotate`
- Роли: `admin`.
- Обновляет Zoom target URL, пишет в audit.

## `GET /admin/audit-log`
- Роли: `admin`.
- Фильтры: `entity_type`, `actor_role`, `date_from`, `date_to`.

## 12) Минимальный SLA по API (MVP)

- `checkout/session` availability: 99.5%
- `payments/prodamus/webhook` availability: 99.9%
- `videos access-token` availability: 99.5%
- `zoom redirect` availability: 99.5%

Нарушение SLA по критичным endpoint -> алерт в канал on-call.

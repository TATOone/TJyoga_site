# 05. Legal, SEO, Consent (MVP)

## 1) Обязательные legal pages

Публичные страницы (индексируемые, кроме явно указанных):

1. `/offer` — публичная оферта.
2. `/policy` — политика обработки персональных данных (152-ФЗ).
3. `/refund` — условия возврата/отмены доступа.
4. `/medical-disclaimer` — медицинский отказ от ответственности.
5. `/how-to-buy` — регламент покупки, получения доступа, поддержка.

Footer на всех публичных страницах:

- ФИО/статус оператора (самозанятый).
- ИНН/реквизиты.
- Контакт для юридических обращений.
- Ссылки на все legal документы.

## 1.1 Режим `legal_mode: final_texts_now` (blocker resolved)

- Решение: в MVP используются финальные публичные тексты `v1.0.0` для `/offer`, `/policy`, `/refund`, `/medical-disclaimer`, `/how-to-buy`.
- Черновые/placeholder формулировки не допускаются в production checkout-контуре.
- Изменения текстов после релиза делаются только через новую версию документа (`v1.0.1+`) с фиксацией `content_hash` и `effective_from`.
- Текущая активная baseline-версия для запуска: `v1.0.0`.

## 2) Consent versioning

## 2.1 Какие согласия фиксируем

- `offer_accept`
- `privacy_accept`
- `medical_disclaimer_accept`
- `cookies_accept` (если включены маркетинговые/поведенческие cookie)

## 2.2 Модель версионирования

- Таблица `consent_documents`: `doc_type`, `version`, `content_hash`, `effective_from`, `is_active`.
- Таблица `user_consents`: `user_id`, `consent_document_id`, `accepted_at`, `ip`, `user_agent`, `source`.

Правила:

1. На checkout принимается только активная версия каждого обязательного документа.
2. Если версия обновилась — пользователь должен принять новую версию на следующем критичном действии (оплата/вход в кабинет по policy).
3. История согласий неизменяема (append-only).

## 2.3 UI/UX на checkout

- Все обязательные чекбоксы не проставлены по умолчанию.
- Для каждого чекбокса ссылка на конкретную версию документа.
- Без принятия обязательных согласий платеж не стартует.

## 3) SEO policy для MVP-платформы

## 3.1 Индексация (`index/noindex`)

### `index,follow`
- `/`
- `/club`
- `/club/rates`
- `/retreats`
- `/personal`
- `/about`
- `/how-to-buy`
- `/offer`
- `/policy`
- `/refund`
- `/medical-disclaimer`
- `/articles` и публичные статьи

### `noindex,nofollow`
- `/account/*`
- `/admin/*`
- `/checkout/*` (включая промежуточные step-страницы)
- `/payment/success`, `/payment/error`
- технические callback/redirect endpoints

## 3.2 robots.txt (новая целевая версия)

Минимальные директивы:

- `Allow: /`
- `Disallow: /account/`
- `Disallow: /admin/`
- `Disallow: /checkout/`
- `Disallow: /payment/`
- `Disallow: /api/`
- `Sitemap: https://tjyoga.ru/sitemap.xml`

## 3.3 sitemap strategy

- В sitemap включаются только indexable URL.
- Закрытые, динамические и служебные URL не включать.
- `lastmod` обновлять автоматически на деплое.
- Отдельный источник URL для статей (`/articles/*`).

## 4) JSON-LD strategy

Для MVP оставляем только валидные сущности:

1. `Organization` + `Person` (бренд и преподаватели).
2. `Product` + `Offer` (тарифы клуба, цена, валюта, условия).
3. `FAQPage` (страница покупки/клуба).
4. `Article` (публичные статьи).
5. `BreadcrumbList` (внутренние страницы).

Исключить:

- `SearchAction`, пока поиск не реализован.

## 5) Контентные требования для AEO/EEAT

- Для каждой статьи: автор, дата публикации/обновления, категория.
- Для продукта: что включено, ограничения, кому подходит.
- Для legal: понятный язык, единая терминология между offer/refund/policy.
- Для медицинского отказа: видимый перед оплатой и отдельная страница.

## 6) Контроль соответствия (checklist перед Stage 2 DoD)

1. Все legal pages опубликованы и связаны в footer (финальные тексты `v1.0.0`).
2. На checkout включены версионированные consent-чекбоксы.
3. `robots.txt` и sitemap обновлены под новую архитектуру.
4. Все закрытые маршруты имеют `noindex,nofollow`.
5. Structured data валидируется без критических ошибок.

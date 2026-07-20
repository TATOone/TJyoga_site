# Stage 0/1 Pre-Dev Package (MVP Йога-Клуб)

Этот пакет фиксирует проектные решения до начала продуктовой разработки этапов 1–7.  
Фокус: перевести текущий лендинг в MVP-платформу с главным продуктом **Йога-Клуб**.

## Что зафиксировано как неизменяемые вводные

- Главный продукт: Йога-Клуб.
- Юридический оператор: самозанятый, реквизиты готовы.
- Production-инфраструктура: Yandex Cloud (персональные данные в РФ).
- Prodamus: есть тест/боевой доступ и webhook-секреты.
- Модель подписки MVP: ручное продление.
- Kinescope: доступ только через authorization backend (`200/403`).
- Zoom: только backend redirect, без прямой ссылки во frontend.

## Состав pre-dev пакета

- `docs/mvp/01-product-cjm.md` — JTBD, сегменты, роли, CJM, воронка, KPI, state machine подписки.
- `docs/mvp/02-domain-model-erd.md` — доменная модель, статусы и жизненные циклы, ERD.
- `docs/mvp/03-api-contracts.md` — контракты API v1, ошибки, идемпотентность, retry.
- `docs/mvp/04-integrations-prodamus-kinescope-zoom.md` — интеграционные потоки и требования безопасности.
- `docs/mvp/05-legal-seo-consent.md` — legal, consent versioning, noindex, robots/sitemap, JSON-LD.
- `docs/mvp/06-rbac-security-observability.md` — RBAC, секреты, аудит, мониторинг, backup/restore.
- `docs/mvp/07-execution-plan-dod.md` — execution plan этапов 1–7, критический путь, параллелизация, DoD.
- `docs/mvp/08-open-questions.md` — статус блокеров и зафиксированные решения.
- `docs/mvp/09-implementation-kickoff.md` — стартовый реализационный scope и первый coding-блок.

## Как использовать пакет

1. Stage 1–2 (витрина + legal/SEO): опираться на `01`, `05`, `07`.
2. Stage 3–6 (backend, checkout, кабинет, видео): опираться на `02`, `03`, `04`, `06`, `07`.
3. Перед началом каждого этапа проверять критерии `DoD` в `07`.
4. Все неустраненные неопределенности закрывать через `08` до разработки соответствующего блока.

## Текущий статус блокеров

- Исходные 5/5 блокеров зафиксированы как resolved в `08` и синхронизированы по документам пакета.

## Gap list

Ниже расхождения между текущим состоянием репозитория и целевым планом Stage 1–7.

1. **Маршруты и IA**
   - Сейчас в `App.tsx` только `/` и `*`.
   - Нет продуктовых маршрутов (`/club`, `/checkout/:productId`, `/account/*`, `/admin`, legal pages).

2. **Checkout и платежный контур**
   - В `src/components/Services.tsx` используются прямые внешние ссылки `payform.ru`.
   - Нет backend checkout-session, нет внутренних success/error flow по API.

3. **Webhook и активация подписки**
   - Нет backend endpoint для Prodamus webhook.
   - Нет идемпотентной обработки событий оплаты и автоматической активации/продления доступа.

4. **Личный кабинет и роли**
   - Нет auth, ролей `student/admin/editor/support`, защищенных страниц и RBAC-проверок.
   - Нет кабинета, статуса подписки, истории оплат, поддержки.

5. **Kinescope/Zoom access control**
   - Нет Kinescope authorization backend (`200/403`).
   - Нет Zoom backend redirect и логирования переходов.

6. **Domain model и админ-контур**
   - В кодовой базе отсутствуют сущности MVP (orders, subscriptions, consents, audit_log и т.д.).
   - Нет admin API/интерфейса для контента, видео и ручного управления доступами.

7. **SEO для платформенной структуры**
   - Текущий `index.html` ориентирован на одностраничный лендинг.
   - Присутствует `SearchAction`, хотя поиск не реализован.
   - Нет per-page SEO/meta для будущих маршрутов, нет политики `noindex` для закрытых страниц.

8. **robots/sitemap**
   - `public/sitemap.xml` содержит только корневую страницу.
   - `public/robots.txt` не учитывает будущие приватные зоны (`/account`, `/admin`, технические callback path).

9. **Инфраструктурный контур**
   - В репозитории активен workflow деплоя на GitHub Pages (`.github/workflows/deploy.yml`).
   - Это не соответствует целевому production-контру на Yandex Cloud для ПДн.

10. **Статусные документы проекта**
   - `TODO.md` фиксирует старую модель "лендинг почти готов + осталось подключить платежи".
   - Новый целевой scope значительно шире (платформа с backend, кабинетом, ролями, интеграциями).

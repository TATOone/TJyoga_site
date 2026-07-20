# 07. Execution Plan и DoD (этапы 1–7)

## 1) Контур этапов

- **Stage 0/1 (pre-dev gate):** проектирование, контракты, безопасность, юридика, план (выполнено этим пакетом).
- **Stage 1:** новая публичная витрина (Йога-Клуб-first IA).
- **Stage 2:** legal + SEO + consent.
- **Stage 3:** backend + БД + auth + RBAC + admin foundation.
- **Stage 4:** checkout + Prodamus webhook + активация подписки.
- **Stage 5:** личный кабинет (dashboard, subscription, Zoom redirect, payments).
- **Stage 6:** Kinescope authorization backend + видеораздел.
- **Stage 7:** QA, hardening, launch readiness.

## 2) Критический путь

`Stage 1 -> Stage 2 -> Stage 3 -> Stage 4 -> Stage 5 -> Stage 6 -> Stage 7`

Почему:

- Без Stage 3 нет backend для webhook/auth/access control.
- Без Stage 4 нет надежной выдачи доступа.
- Без Stage 5/6 нет ценности MVP-клуба после оплаты.
- Stage 7 валидирует end-to-end сценарий "трафик -> оплата -> доступ".

## 3) Что можно параллелить

## Параллельный трек A (контент/дизайн)
- Подготовка финальных текстов `/club`, `/how-to-buy`, FAQ, статей.
- Поддержка baseline legal-версий `v1.0.0` и регламента version bump.
- Подготовка контента для карточек видео и категорий.

## Параллельный трек B (инфраструктура)
- Развертывание Yandex Cloud окружений (stage/prod).
- Базовая observability (лог-агент, метрики, алерты).
- CI/CD пайплайн под новый backend.

## Параллельный трек C (операционные процедуры)
- Регламент ручного продления (`SLA <= 2h`, ежедневно `10:00-22:00 МСК`).
- Регламент ротации Zoom-ссылок с owner=`admin_owner`.
- Регламент реагирования на webhook инциденты.

## 4) Детализация этапов и DoD

## Stage 1 — Публичная витрина

Объем:

- Роутинг: `/`, `/club`, `/club/rates`, `/retreats`, `/personal`, `/about`, `/how-to-buy`.
- Главная с фокусом на Йога-Клуб.
- Удаление зависимости от отдельной статической `rates/` страницы в пользовательском пути.

DoD:

1. Все публичные маршруты доступны и связаны через навигацию.
2. Нет критичных layout/regression багов на mobile/tablet/desktop.
3. Кнопки CTA ведут в новый checkout путь (не в hardcoded payform).
4. Lighthouse (публичные страницы): Performance >= 80, SEO >= 90, A11y >= 90.

## Stage 2 — Legal/SEO/Consent

Объем:

- Внедрение `/offer`, `/policy`, `/refund`, `/medical-disclaimer`.
- Фиксация baseline legal-версий `v1.0.0` (`final_texts_now`).
- Версионирование согласий и UI-чекбоксы в checkout.
- Пересборка robots/sitemap/noindex policy.
- JSON-LD под новые страницы.

DoD:

1. Все legal pages опубликованы и связаны в footer.
2. Финальные legal-тексты `v1.0.0` зафиксированы в active-версии.
3. Checkout не проходит без обязательных согласий.
4. Закрытые маршруты имеют `noindex`.
5. Sitemap содержит только индексируемые страницы.
6. Structured data проходит валидацию без критических ошибок.

## Stage 3 — Backend и база

Объем:

- Postgres + миграции по модели из `02`.
- Auth (register/login/refresh/logout/me) на `self-host Supabase Auth`.
- RBAC middleware.
- Admin foundation (минимум: users/subscriptions/articles/videos read/write по ролям).

DoD:

1. Миграции применяются на чистой БД без ручных шагов.
2. Auth и RBAC покрыты интеграционными тестами.
3. Основные admin endpoint работают по роли.
4. Аудит пишется для ручных операций.

## Stage 4 — Checkout + Prodamus webhook

Объем:

- `POST /checkout/session` c идемпотентностью.
- `POST /payments/prodamus/webhook` с проверкой подписи.
- Активация подписки по успешному webhook.
- Страницы `payment/success` и `payment/error` с проверкой backend статуса.

DoD:

1. Успешная тестовая оплата активирует подписку автоматически.
2. Повторный webhook не дублирует доступы/платежи.
3. Невалидная подпись отклоняется.
4. Метрики webhook и алерты включены.

## Stage 5 — Личный кабинет

Объем:

- `/account` dashboard.
- `/account/subscription` и `/account/payments`.
- `GET /account/zoom/redirect` (302/403).
- SLA-коммуникация ручного продления + обработка `grace 72h`.
- Поддержка/FAQ блок.

DoD:

1. Неавторизованный пользователь не попадает в кабинет.
2. Активный подписчик видит статус, дату окончания, историю платежей.
3. Zoom вход работает только через backend redirect.
4. Все доступы соответствуют ролям и статусу подписки.

## Stage 6 — Kinescope видео

Объем:

- Каталог видео в кабинете.
- `POST /videos/{id}/access-token`.
- Kinescope authorization backend (`200/403`).
- Admin управление карточками видео.

DoD:

1. Активный подписчик воспроизводит доступные видео.
2. Неактивный подписчик стабильно получает `403`.
3. Токены короткоживущие, прямые URL не раскрываются.
4. События доступа логируются.

## Stage 7 — QA и запуск

Объем:

- E2E сценарии оплаты и доступа.
- Кроссбраузер и mobile sanity.
- Backup/restore drill.
- Production readiness review.

DoD:

1. E2E "регистрация -> оплата -> доступ к Zoom/видео/статьям" проходит.
2. Нет P0/P1 дефектов по платежам и доступам.
3. RPO/RTO подтверждены тестовым restore.
4. Runbook и алерты готовы, on-call канал назначен.

## 5) Риски и mitigation

1. **Срыв срока из-за поздних правок legal-текстов**
   - Mitigation: режим `final_texts_now` + изменения только через version bump.

2. **Проблемы с webhook от Prodamus**
   - Mitigation: ранний sandbox прогон и отдельные интеграционные тесты.

3. **Утечка Zoom-ссылки**
   - Mitigation: backend redirect-only + ротация + audit.

4. **Регресс SEO при переходе с лендинга на multi-page**
   - Mitigation: staged rollout + контроль индексации + обновленный sitemap/canonical.

5. **Недостаточная наблюдаемость на старте**
   - Mitigation: baseline мониторинг обязателен до Stage 4.

## 6) Критерий "можно идти в разработку"

Разработка этапов 1–7 стартует, когда:

1. Команда принимает документы `01–08` без критичных замечаний.
2. По `08-open-questions.md` нет блокирующих неопределенностей (текущий статус: 5/5 блокеров закрыты).
3. Назначены ответственные по backend, frontend, legal, devops трекам.

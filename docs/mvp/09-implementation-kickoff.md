# 09. Implementation Kickoff (Stage 1 + Stage 2 partial)

## 1) Цель первого coding-блока

Запустить первую реализационную итерацию без backend-изменений:

- закрыть основной фронтовый scope **Stage 1** (новая публичная витрина и IA);
- взять из **Stage 2** минимально необходимую часть: legal-страницы, базовый SEO-контур, подготовка consent-каркаса;
- убрать пользовательскую зависимость от внешних `payform.ru` ссылок в CTA (переход в внутренний checkout flow).

## 2) Зафиксированные решения, обязательные в реализации

1. `auth_stack = selfhost_supabase_auth` (подготовка интерфейсов и роутинга без custom-auth задела).
2. `legal_mode = final_texts_now` (legal baseline `v1.0.0` сразу в production-контуре).
3. `grace_period = 72h`.
4. `renewal_sla = до 2 часов, ежедневно 10:00-22:00 МСК`.
5. `zoom_owner = admin_owner`.

## 3) Реализационный scope (Iteration 1)

### Stage 1 (полностью)

- Публичный роутинг: `/`, `/club`, `/club/rates`, `/retreats`, `/personal`, `/about`, `/how-to-buy`.
- Обновленная навигация и связность маршрутов (header/footer).
- Главная страница с clear фокусом на Йога-Клуб и переходами в новые страницы.
- CTA ведут во внутренний путь checkout (не во внешние hardcoded payform ссылки).

### Stage 2 (частично)

- Публикация legal-страниц: `/offer`, `/policy`, `/refund`, `/medical-disclaimer`.
- Привязка legal-ссылок в footer на всех публичных страницах.
- Обновление `robots.txt` и `sitemap.xml` под новую структуру публичных URL.
- Подготовка структуры для consent versioning (`v1.0.0`) на уровне frontend-моделей/констант (без backend persistence).

## 4) Конкретные файлы/модули для первого блока кодинга

### Изменить существующие

- `App.tsx` — расширение `Routes` под новую IA.
- `src/pages/Home.tsx` — фокус на новый сценарий входа в клуб.
- `src/components/Header.tsx` — меню на новые маршруты.
- `src/components/Footer.tsx` — legal-навигация и обязательные ссылки.
- `src/components/Services.tsx` — перевод CTA с внешних `payform.ru` на внутренний flow.
- `public/robots.txt` — актуальные `Disallow` для приватных зон.
- `public/sitemap.xml` — список индексируемых маршрутов MVP-витрины.

### Создать новые

- `src/pages/Club.tsx`
- `src/pages/ClubRates.tsx`
- `src/pages/Retreats.tsx`
- `src/pages/Personal.tsx`
- `src/pages/AboutPage.tsx`
- `src/pages/HowToBuy.tsx`
- `src/pages/CheckoutStub.tsx` (временный внутренний entrypoint до Stage 4)
- `src/pages/legal/Offer.tsx`
- `src/pages/legal/Policy.tsx`
- `src/pages/legal/Refund.tsx`
- `src/pages/legal/MedicalDisclaimer.tsx`
- `src/config/legalDocuments.ts` (baseline версий/ссылок `v1.0.0`)

## 5) Критерии готовности (DoR/DoD для Iteration 1)

1. Все маршруты Stage 1 доступны, не ведут в `404`, и связаны через меню/CTA.
2. Ни один основной CTA не ведет напрямую на внешний `payform.ru`.
3. Все legal-страницы опубликованы, доступны по URL и связаны в footer.
4. В legal-контуре используется baseline `v1.0.0` без placeholder-текстов.
5. `robots.txt` и `sitemap.xml` соответствуют фактическому списку indexable страниц.
6. Нет критичных визуальных регрессий на mobile/tablet/desktop для ключевых страниц.

## 6) Чеклист проверки (build/lint/smoke)

### Build/Lint

- [ ] `npm run lint`
- [ ] `npm run build`

### Smoke (manual)

- [ ] `npm run dev` запускается без runtime ошибок.
- [ ] Проверены URL: `/`, `/club`, `/club/rates`, `/retreats`, `/personal`, `/about`, `/how-to-buy`, `/offer`, `/policy`, `/refund`, `/medical-disclaimer`.
- [ ] Footer содержит корректные legal-ссылки на всех публичных страницах.
- [ ] CTA "вступить/купить" ведут во внутренний путь checkout (`/checkout/*`), а не на внешний URL.
- [ ] `robots.txt` и `sitemap.xml` отражают новую архитектуру маршрутов.

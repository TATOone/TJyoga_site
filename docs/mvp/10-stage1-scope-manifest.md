# 10. Stage 1 Scope Manifest (Practical Isolation)

## Цель

Зафиксировать практическую изоляцию scope для первого coding-блока (Stage 1 + Stage 2 partial) и отдельного P1 hotfix по отзывам, без отката чужих/unrelated изменений в рабочем дереве.

## In Scope (готовим к чистому Stage 1 коммиту)

### Stage 1 маршруты и IA

- `App.tsx`
- `src/pages/Home.tsx`
- `src/pages/Club.tsx`
- `src/pages/ClubRates.tsx`
- `src/pages/Retreats.tsx`
- `src/pages/Personal.tsx`
- `src/pages/AboutPage.tsx`
- `src/pages/HowToBuy.tsx`
- `src/pages/CheckoutStub.tsx`
- `src/pages/NotFound.tsx`
- `src/components/Header.tsx`
- `src/components/Footer.tsx`
- `src/components/Services.tsx`

### Stage 2 partial (legal/SEO baseline)

- `src/pages/legal/Offer.tsx`
- `src/pages/legal/Policy.tsx`
- `src/pages/legal/Refund.tsx`
- `src/pages/legal/MedicalDisclaimer.tsx`
- `public/robots.txt`
- `public/sitemap.xml`
- `src/config/legalDocuments.ts`
- `src/config/pageMeta.ts`
- `src/utils/usePageMeta.ts`

### Поддерживающие модули (IA/layout/state/products)

- `src/components/PublicPageLayout.tsx`
- `src/components/LegalPageLayout.tsx`
- `src/context/mobileMenuContext.ts`
- `src/config/products.ts`

### P1 hotfix (Testimonials assets)

- Восстановлены из `HEAD` удаленные ассеты:
  - `public/images/testimonials/ekaterina.jpg`
  - `public/images/testimonials/natalya.jpg`
  - `public/images/testimonials/yulia.jpg`
- Пути в `src/components/Testimonials.tsx` и `src/config/images.ts` оставлены без изменений, чтобы сохранить текущий дизайн и устранить битые ссылки.

## Out of Scope (не включать в Stage 1 commit)

- `.github/workflows/deploy.yml`
- `index.html`
- `src/components/CTA.tsx`
- `src/components/Hero.tsx`
- `src/utils/analytics.ts`
- `.cursor/plans/tj_yoga_platform_6dca1916.plan.md`
- `rates/README.md`
- `rates/index.html`
- Документы discovery/планирования:
  - `docs/mvp/01-product-cjm.md`
  - `docs/mvp/02-domain-model-erd.md`
  - `docs/mvp/03-api-contracts.md`
  - `docs/mvp/04-integrations-prodamus-kinescope-zoom.md`
  - `docs/mvp/05-legal-seo-consent.md`
  - `docs/mvp/06-rbac-security-observability.md`
  - `docs/mvp/07-execution-plan-dod.md`
  - `docs/mvp/08-open-questions.md`
  - `docs/mvp/09-implementation-kickoff.md`
  - `docs/mvp/README.md`

## Practical Scope Isolation (без destructive действий)

1. Не выполнять `reset/checkout -- <path>` для unrelated файлов.
2. Стадировать только `In Scope` path-list (явно по файлам, без `git add .`).
3. Перед коммитом проверить, что staged diff содержит только `In Scope`.
4. Если обнаружены out-of-scope касания в staged area: снять их через `git restore --staged <path>` (без изменения рабочего файла).

## Контрольный критерий перед коммитом

- В `git diff --cached --name-only` присутствуют только файлы из раздела `In Scope`.
- Файлы из раздела `Out of Scope` остаются unstaged.

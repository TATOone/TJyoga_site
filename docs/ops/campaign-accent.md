# Смена главного акцента воронки клуба

Публичные страницы Home, Club и Club Rates читают **один** активный акцент. Чтобы сменить тон кампании (сезон, аудитория, связка с рекламой), не нужно переписывать страницы.

## Что менять

В `src/config/campaignAccent.ts` поставьте нужный id:

```ts
export const ACTIVE_ACCENT_ID: CampaignAccentId = 'beginners';
```

Доступные id:

| id | Кому говорим |
|---|---|
| `beginners` | Тревожный новичок, страх «сделать не так» |
| `depth` | Практикующий, которому нужна система и первоисточники, а не фитнес |
| `office-restore` | Офис, спина, стресс, выгорание |

Дальше — обычный деплой фронтенда. Админки пока нет: это намеренно маленький конфиг.

## Что не трогать при смене акцента

- Цены и `checkoutPath` в `src/config/products.ts`
- Коды тарифов backend `PLAN_CATALOG` (`club-month` / `club-year`, алиасы `club-monthly` / `club-yearly`)
- Расписание Zoom и SLA поддержки в `src/config/clubContent.ts` — если они не менялись по факту

Акцент меняет **формулировки** (eyebrow, заголовок, подзаголовок, акцент на Home/Club, подсказку CTA). Обещания клуба (эфиры + записи, уровни, чат, хатха ≠ фитнес, цена без мелкого шрифта) остаются в `products.ts` и на витрине клуба.

## Поля акцента

Каждая запись в `CAMPAIGN_ACCENTS`:

- `id`, `label` — бейдж на Club / Rates / блок «для кого» на Home
- `heroEyebrow` / `heroHeadline` / `heroSubhead` — главный экран Home
- `homeEmphasis` — пояснение на Home (вход в клуб + карточка аудитории)
- `clubEmphasis` — акцент на странице клуба
- `ctaHint` — подсказка у финальных CTA и в герое тарифов

Новый акцент добавляйте в union `CampaignAccentId`, в `CAMPAIGN_ACCENT_IDS`, в `CAMPAIGN_ACCENTS` и в `switch` внутри `getAccentById()` — иначе TypeScript не соберётся.

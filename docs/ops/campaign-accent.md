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
| `beginners` | Человек, который начинает. Можно с нуля. |
| `depth` | Тому, кто ищет систему, ритм недели и первоисточники |
| `office-restore` | Тому, чей день за компьютером: спина, внимание, рабочая неделя |

Дальше - обычный деплой фронтенда. Админки пока нет: это намеренно маленький конфиг.

## Что не трогать при смене акцента

- Цены и `checkoutPath` в `src/config/products.ts`
- Коды тарифов backend `PLAN_CATALOG` (`club-month` / `club-year`, алиасы `club-monthly` / `club-yearly`)
- Расписание Zoom и сроки поддержки в `src/config/clubContent.ts` - если они не менялись по факту
- У акцента `beginners`: `heroEyebrow`, `heroHeadline`, `heroSubhead` (утверждено)

Акцент меняет **формулировки** (eyebrow, заголовок, подзаголовок, акцент на Home/Club, подсказку CTA). Обещания клуба (эфиры + записи, уровни, чат, классическая хатха, цена как на сайте) остаются в `products.ts` и на витрине клуба.

## Поля акцента

Каждая запись в `CAMPAIGN_ACCENTS`:

- `id`, `label` - бейдж на Club / Rates / блок «для кого» на Home
- `heroEyebrow` / `heroHeadline` / `heroSubhead` - главный экран Home
- `homeEmphasis` - пояснение на Home (вход в клуб + карточка аудитории)
- `clubEmphasis` - акцент на странице клуба
- `ctaHint` - подсказка у финальных CTA и в герое тарифов

Новый акцент добавляйте в union `CampaignAccentId`, в `CAMPAIGN_ACCENT_IDS`, в `CAMPAIGN_ACCENTS` и в `switch` внутри `getAccentById()` - иначе TypeScript не соберётся.

/**
 * Сезонный / рекламный акцент публичной воронки клуба.
 *
 * Чтобы сменить главный акцент сайта, поменяйте только `ACTIVE_ACCENT_ID`.
 * Страницы Home, Club и Club Rates читают `getActiveAccent()` - вёрстку
 * ради кампании пересобирать не нужно.
 *
 * Полная инструкция: `docs/ops/campaign-accent.md`.
 *
 * Зафиксировано Тимом (не менять у акцента beginners):
 * heroEyebrow, heroHeadline, heroSubhead.
 */

export type CampaignAccentId = 'beginners' | 'depth' | 'office-restore';

export interface CampaignAccentDefinition {
  id: CampaignAccentId;
  label: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroSubhead: string;
  homeEmphasis: string;
  clubEmphasis: string;
  ctaHint: string;
}

export const CAMPAIGN_ACCENT_IDS = ['beginners', 'depth', 'office-restore'] as const satisfies readonly CampaignAccentId[];

export const CAMPAIGN_ACCENTS: Record<CampaignAccentId, CampaignAccentDefinition> = {
  beginners: {
    id: 'beginners',
    label: 'Для новичков',
    heroEyebrow: 'Классическая хатха-йога',
    heroHeadline: 'Практика, в которой вас не оставляют наедине',
    heroSubhead: 'Онлайн занятия в Zoom и записи',
    homeEmphasis:
      'Мы любим, когда человек приходит с нуля. Можно не знать названий и не иметь «базы». Мы рядом: в эфире и в чате.',
    clubEmphasis:
      'Утренние и вечерние практики рассчитаны на все уровни. Есть более простой вариант позы. Пропустили эфир - открываете запись. Вопрос по практике - пишете нам.',
    ctaHint: 'Посмотреть, как устроен клуб, и выбрать месяц или год',
  },
  depth: {
    id: 'depth',
    label: 'Система практики',
    heroEyebrow: 'Традиция нашей школы',
    heroHeadline: 'Регулярная практика с ритмом недели',
    heroSubhead:
      'Живые занятия в Zoom, записи и разборы техники. Классическая хатха-йога из первоисточников.',
    homeEmphasis:
      'В клубе есть уровни, ритм недели и работа с первоисточниками. Так проще практиковать регулярно. Мы держим структуру, вы приходите.',
    clubEmphasis:
      'Четыре живых практики в неделю, семинары, философия и записи для самостоятельной работы. Мы в чате, чтобы техника не расползалась на глаз.',
    ctaHint: 'Смотреть программу клуба и тарифы',
  },
  'office-restore': {
    id: 'office-restore',
    label: 'После рабочего дня',
    heroEyebrow: 'Классическая хатха-йога',
    heroHeadline: 'Практика, которая встраивается в рабочую неделю',
    heroSubhead:
      'Утро до созвонов и вечер после экрана. Если день съел - есть запись.',
    homeEmphasis:
      'Мы сами активные и энергичные, во многом благодаря практике. Если день прошёл за столом, хатха хорошо собирает спину и внимание. Можно зайти даже когда тело засижено.',
    clubEmphasis:
      'Есть утренняя практика до работы и вечерняя после дня. Пропустили эфир - открываете запись. Если что-то отозвалось в теле, пишете нам в чат с 10:00 до 22:00.',
    ctaHint: 'Выбрать ритм: месяц или год',
  },
};

/**
 * Единственная точка переключения кампании.
 * Позже это же поле можно будет отдавать из админки.
 */
export const ACTIVE_ACCENT_ID: CampaignAccentId = 'beginners';

export const getAccentById = (id: CampaignAccentId): CampaignAccentDefinition => {
  switch (id) {
    case 'beginners':
      return CAMPAIGN_ACCENTS.beginners;
    case 'depth':
      return CAMPAIGN_ACCENTS.depth;
    case 'office-restore':
      return CAMPAIGN_ACCENTS['office-restore'];
    default: {
      const unreachable: never = id;
      throw new Error(`Неизвестный акцент кампании: ${String(unreachable)}`);
    }
  }
};

export const getActiveAccent = (): CampaignAccentDefinition => getAccentById(ACTIVE_ACCENT_ID);

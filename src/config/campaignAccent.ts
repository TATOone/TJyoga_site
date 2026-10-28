/**
 * Сезонный / рекламный акцент публичной воронки клуба.
 *
 * Чтобы сменить главный акцент сайта, поменяйте только `ACTIVE_ACCENT_ID`.
 * Страницы Home и Club читают `getActiveAccent()` - вёрстку
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
    label: 'С нуля',
    heroEyebrow: 'Классическая хатха-йога',
    heroHeadline: 'Практика, в которой вас не оставляют наедине',
    heroSubhead: 'Онлайн занятия в Zoom и записи',
    homeEmphasis: 'Можно приходить с нуля. Названия асан знать не нужно. Мы рядом в эфире и в чате.',
    clubEmphasis:
      'Утро и вечер - для всех уровней. Есть простой вариант асаны. Пропустили эфир - открываете запись.',
    ctaHint: 'Поехали с нами',
  },
  depth: {
    id: 'depth',
    label: 'С ритмом',
    heroEyebrow: 'Традиция нашей школы',
    heroHeadline: 'Регулярная практика с ритмом недели',
    heroSubhead: 'Живые занятия в Zoom, записи и разборы техники. Классическая хатха из первоисточников.',
    homeEmphasis: 'Четыре практики в неделю, первоисточники и мы в чате.',
    clubEmphasis: 'Четыре живые практики, семинары, философия и записи. Мы в чате.',
    ctaHint: 'Поехали с нами',
  },
  'office-restore': {
    id: 'office-restore',
    label: 'После работы',
    heroEyebrow: 'Классическая хатха-йога',
    heroHeadline: 'Практика, которая встраивается в рабочую неделю',
    heroSubhead: 'Утро до работы и вечер после дня. Если день съел - есть запись.',
    homeEmphasis: 'Мы сами активные и энергичные, во многом благодаря практике.',
    clubEmphasis:
      'Утро до работы и вечер после дня. Пропустили эфир - запись. Вопрос по телу - в чат с 10:00 до 22:00.',
    ctaHint: 'Поехали с нами',
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

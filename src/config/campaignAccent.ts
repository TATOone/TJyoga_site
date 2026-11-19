/**
 * Сезонный / рекламный акцент публичной воронки клуба.
 *
 * Чтобы сменить главный акцент сайта, поменяйте только `ACTIVE_ACCENT_ID`.
 * Страницы Home и Club читают `getActiveAccent()` - вёрстку
 * ради кампании пересобирать не нужно.
 *
 * Полная инструкция: `docs/ops/campaign-accent.md`.
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
    heroHeadline: 'Онлайн-клуб, где мы практикуем вместе с вами',
    heroSubhead: 'Живые занятия в Zoom и записи всех практик',
    homeEmphasis:
      'В клуб можно прийти без опыта, названия асан знать не нужно. На занятиях и в чате мы рядом и всё подскажем.',
    clubEmphasis:
      'Утренние и вечерние практики подходят для любого уровня: у каждой асаны есть базовая форма или вариант под ваше тело. Если пропустили занятие, его можно посмотреть в записи.',
    ctaHint: 'Поехали с нами',
  },
  depth: {
    id: 'depth',
    label: 'С ритмом',
    heroEyebrow: 'Традиция нашей школы',
    heroHeadline: 'Регулярная практика в постоянном ритме недели',
    heroSubhead:
      'Живые занятия в Zoom, записи и разборы техники. Классическая хатха-йога по традиции нашей школы.',
    homeEmphasis: 'Четыре живые практики в неделю, и мы всегда на связи в чате.',
    clubEmphasis: 'Четыре живые практики в неделю, семинары, философия и записи. Мы на связи в чате.',
    ctaHint: 'Поехали с нами',
  },
  'office-restore': {
    id: 'office-restore',
    label: 'После работы',
    heroEyebrow: 'Классическая хатха-йога',
    heroHeadline: 'Практику легко вписать в рабочую неделю',
    heroSubhead:
      'Утром в воскресенье и понедельник, вечером в среду и пятницу. Если не успели, можно позаниматься по записи.',
    homeEmphasis: 'Мы сами активные и энергичные, во многом благодаря практике.',
    clubEmphasis:
      'Утром в воскресенье и понедельник, вечером в среду и пятницу. Если пропустили занятие, его можно посмотреть в записи, а вопросы писать нам в чат с 10:00 до 22:00.',
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

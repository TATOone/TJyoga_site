/**
 * Сезонный / рекламный акцент публичной воронки клуба.
 *
 * Чтобы сменить главный акцент сайта, поменяйте только `ACTIVE_ACCENT_ID`.
 * Страницы Home, Club и Club Rates читают `getActiveAccent()` — вёрстку
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
    label: 'Спокойный старт',
    heroEyebrow: 'Классическая хатха · можно с нуля',
    heroHeadline: 'Практика, в которой вас не оставляют наедине',
    heroSubhead:
      'Живые занятия в Zoom и записи. Понятные уровни асан, структура практики и помощь преподавателя',
    homeEmphasis:
      'Если давно хотели начать и откладывали из страха сделать «не так» — в клубе вас проводят, а не оценивают. Можно приходить, не зная санскрита и не имея «базы».',
    clubEmphasis:
      'Новичкам не нужно уже уметь. Утренние и вечерние практики рассчитаны на все уровни: преподаватель даёт опору и базовые варианты позиций. Пропустили эфир — открываете запись. Вопрос по практике, телу или теории — пишете в чат.',
    ctaHint: 'Посмотреть, как устроен клуб, и выбрать месяц или год',
  },
  depth: {
    id: 'depth',
    label: 'Система и глубина',
    heroEyebrow: 'Хатха из первоисточников · не фитнес',
    heroHeadline: 'Регулярная практика с линией, а не с набором трендов',
    heroSubhead:
      'Воскресенье, вторник, среда и пятница — расписание открыто. Есть библиотека записей, разборы техники и тексты. Классическая хатха, не растяжка под плейлист.',
    homeEmphasis:
      'Если нужна система, а не бесконечная лента уроков — в клубе есть уровни, ритм недели и работа с первоисточниками. Так проще практиковать регулярно, а не только пока есть вдохновение.',
    clubEmphasis:
      'Программа читается как путь, а не как хаос сторис: три живых практики в неделю, семинары, философия, записи для самостоятельной работы. Куратор в чате — чтобы техника не расползалась «на глаз».',
    ctaHint: 'Смотреть программу клуба и тарифы',
  },
  'office-restore': {
    id: 'office-restore',
    label: 'Спина, стресс, офис',
    heroEyebrow: 'После рабочего дня · без надрыва',
    heroHeadline: 'Вернуть спине опору, а нервной системе — тишину',
    heroSubhead:
      'Утро до созвонов и вечер после экрана. Если день съел — есть запись. Можно зайти даже когда тело засижено, а голова не выключается.',
    homeEmphasis:
      'Если после работы сжаты плечи, челюсть и поясница — хатха в клубе рассчитана на живое тело, не на «идеальную форму». Это не марафон гибкости.',
    clubEmphasis:
      'Есть утренняя практика до работы и вечернее восстановление. Пропустили эфир — открываете запись. Если что-то отозвалось болью или тревогой, пишете преподавателю в чат в рабочие часы.',
    ctaHint: 'Выбрать спокойный ритм: месяц или год',
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

import { IMAGES } from './images';

export type ProductId = 'club-monthly' | 'club-yearly' | 'retreat-pass' | 'personal-session';

export interface ProductConfig {
  id: ProductId;
  title: string;
  shortTitle: string;
  description: string;
  details: string;
  priceLabel: string;
  /** Числовая цена в рублях для JSON-LD Offer. Только фиксированные тарифы. */
  priceAmount?: number;
  priceCurrency?: 'RUB';
  ctaLabel: string;
  primaryPath: string;
  checkoutPath: string;
  image: string;
  includes: readonly string[];
  featured?: boolean;
  showCountdown?: boolean;
}

/**
 * Наполнение клуба. Цены ниже должны совпадать с backend PLAN_CATALOG:
 * club-month = 600_000 копеек (6 000 ₽ / 30 дней),
 * club-year  = 6_000_000 копеек (60 000 ₽ / 365 дней).
 * Коды checkout: /checkout/club-monthly и /checkout/club-yearly
 * (на backend алиасы club-monthly → club-month, club-yearly → club-year).
 */
const clubCoreIncludes = [
  'Живые практики в Zoom: воскресенье, зарядка во вторник, среда и пятница',
  'Записи всех занятий — если пропустили эфир',
  'Уровни на виду: все уровни, начинающие, продолжающие',
  'Чат с преподавателем, ответ ежедневно 10:00–22:00 МСК',
  'Классическая хатха из первоисточников, не фитнес-йога',
] as const;

export const PRODUCTS: Record<ProductId, ProductConfig> = {
  'club-monthly': {
    id: 'club-monthly',
    title: 'Онлайн Йога-Клуб',
    shortTitle: 'Месячная подписка',
    description:
      '30 дней полного доступа: живые практики, записи и чат с преподавателем. 6 000 ₽ — это вся цена, доплат нет.',
    details:
      'Закрытый клуб в кабинете: Zoom-эфиры, библиотека записей, материалы по практике и первоисточникам, чат с преподавателем. Ссылка на занятие открывается из кабинета — её не нужно искать в ленте.',
    priceLabel: '6 000 ₽/месяц',
    priceAmount: 6000,
    priceCurrency: 'RUB',
    ctaLabel: 'Оформить месяц',
    primaryPath: '/club',
    checkoutPath: '/checkout/club-monthly',
    image: IMAGES.services.onlineClub,
    includes: clubCoreIncludes,
  },
  'club-yearly': {
    id: 'club-yearly',
    title: 'Онлайн Йога-Клуб',
    shortTitle: 'Годовая подписка',
    description:
      '12 месяцев того же доступа за 60 000 ₽. Помесячно это было бы 72 000 ₽ — разница 12 000 ₽, без скрытых условий.',
    details:
      'Тот же клуб: эфиры, записи, уровни, чат. Год имеет смысл, если хотите держать ритм без ежемесячного решения «оплатить ещё раз».',
    priceLabel: '60 000 ₽/год (5 000 ₽/мес)',
    priceAmount: 60000,
    priceCurrency: 'RUB',
    ctaLabel: 'Оформить год',
    primaryPath: '/club/rates',
    checkoutPath: '/checkout/club-yearly',
    image: IMAGES.services.onlineClub,
    includes: [...clubCoreIncludes, 'На 12 000 ₽ меньше, чем 12 месяцев по 6 000 ₽'],
    featured: true,
  },
  'retreat-pass': {
    id: 'retreat-pass',
    title: 'Йога-Ретриты',
    shortTitle: 'Ретриты',
    description:
      'Несколько дней практики в природной локации: общий ритм дня, занятия и сопровождение преподавателя.',
    details:
      'Ретрит — отдельный выездной формат, не замена клубу. Клуб держит регулярность дома; ретрит даёт короткое глубокое погружение.',
    priceLabel: 'от 35 000 ₽',
    ctaLabel: 'Смотреть ретриты',
    primaryPath: '/retreats',
    checkoutPath: '/checkout/retreat-pass',
    image: IMAGES.services.retreat,
    includes: [
      'Ежедневная групповая практика',
      'Общий режим дня и время без рабочей ленты',
      'Сопровождение преподавателя на месте',
    ],
    showCountdown: true,
  },
  'personal-session': {
    id: 'personal-session',
    title: 'Персональные занятия',
    shortTitle: 'Индивидуальная практика',
    description:
      'Один-на-один: разбор вашего тела, дыхания и того, что сейчас мешает практиковать спокойно.',
    details:
      'Имеет смысл после травмы, при сильном дискомфорте в спине или если хотите точечно поправить технику. Для регулярности большинство выбирает клуб.',
    priceLabel: '8 000 ₽/занятие',
    ctaLabel: 'Записаться персонально',
    primaryPath: '/personal',
    checkoutPath: '/checkout/personal-session',
    image: IMAGES.services.personal,
    includes: [
      'План встречи под ваше состояние',
      'Разбор техники, а не набор сложных асан',
      'Что делать дома до следующей практики',
    ],
  },
};

export const HOME_SERVICE_PRODUCT_IDS: readonly ProductId[] = [
  'club-monthly',
  'retreat-pass',
  'personal-session',
];

export const CLUB_RATE_PRODUCT_IDS: readonly ProductId[] = ['club-monthly', 'club-yearly'];

export const getProductById = (productId: string): ProductConfig | null => {
  if (productId in PRODUCTS) {
    return PRODUCTS[productId as ProductId];
  }
  return null;
};

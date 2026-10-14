import { IMAGES } from './images';

export type ProductId = 'club-monthly' | 'club-yearly' | 'retreat-pass' | 'personal-session';

export interface HomeServiceCardCopy {
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}

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
  /** Копирайт карточки на главной. Не подменяет IA страницы продукта. */
  homeCard?: HomeServiceCardCopy;
  /** Внешняя запись (Telegram). Если задана, вторичная кнопка ведёт сюда, а не в checkout. */
  bookingHref?: string;
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
  'Записи всех занятий - если пропустили эфир',
  'Уровни на виду: все уровни, начинающие, продолжающие',
  'Чат с преподавателем, ответ ежедневно 10:00–22:00 МСК',
  'Классическая хатха-йога из первоисточников',
] as const;

export const PRODUCTS: Record<ProductId, ProductConfig> = {
  'club-monthly': {
    id: 'club-monthly',
    title: 'Онлайн Йога-Клуб',
    shortTitle: 'Месячная подписка',
    description:
      '30 дней клуба: живые практики, записи и чат с преподавателем. 6 000 ₽ в месяц.',
    details:
      'Клуб в кабинете: занятия в Zoom, библиотека записей, материалы по практике и первоисточникам, чат с преподавателем. Ссылка на занятие открывается из кабинета.',
    priceLabel: '6 000 ₽/месяц',
    priceAmount: 6000,
    priceCurrency: 'RUB',
    ctaLabel: 'Оформить месяц',
    primaryPath: '/club',
    checkoutPath: '/checkout/club-monthly',
    image: IMAGES.services.onlineClub,
    includes: clubCoreIncludes,
    homeCard: {
      title: 'Йога онлайн',
      description:
        'Доступ в личный кабинет TJ club: онлайн занятия в Zoom, библиотека записей, материалы по практике, задания «Йога вне коврика», чат с преподавателем и пространство общения',
      primaryCta: 'Подробнее',
      secondaryCta: 'Оплатить',
    },
  },
  'club-yearly': {
    id: 'club-yearly',
    title: 'Онлайн Йога-Клуб',
    shortTitle: 'Годовая подписка',
    description:
      '12 месяцев того же доступа за 60 000 ₽. Если платить помесячно, выйдет 72 000 ₽.',
    details:
      'Тот же клуб: эфиры, записи, уровни, чат. Год удобен, если хотите держать ритм без ежемесячного решения «оплатить ещё раз».',
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
    title: 'Йогические выходные с Тимом и Женей',
    shortTitle: 'Ретриты',
    description:
      'С 3 по 6 января в эко-отеле в Налибокской пуще, Беларусь. Практика два раза в день, лекции, чай, онсен и сауна. Трансфер из Минска.',
    details:
      'С 3 по 6 января едем в эко-отель в Налибокской пуще, Беларусь. Трансфер из Минска. Практика два раза в день, лекции, чайные церемонии, онсен (горячий источник), сауна и киновечера. Вегетарианское питание от шеф-повара - три раза в день.',
    priceLabel: 'двухместное 45 000 ₽',
    ctaLabel: 'Смотреть ретрит',
    primaryPath: '/retreats',
    checkoutPath: '/checkout/retreat-pass',
    bookingHref: 'https://t.me/starovoitovae',
    image: IMAGES.services.retreat,
    includes: [
      'Практика два раза в день, лекции и чайные церемонии',
      'Онсен (горячий источник), сауна и киновечера',
      'Вегетарианское питание от шеф-повара три раза в день',
      'Трансфер из Минска',
      'Двухместное проживание 45 000 ₽, одноместное 57 000 ₽',
      'Предоплата 20 500 ₽. Не возвращается, если отменить меньше чем за 30 дней',
      '20 мест',
    ],
    showCountdown: true,
    homeCard: {
      title: 'Йогические выходные',
      description:
        'С 3 по 6 января в Налибокской пуще. Практика два раза в день, лекции, чай, онсен и сауна. Трансфер из Минска.',
      primaryCta: 'Подробнее',
      secondaryCta: 'Записаться',
    },
  },
  'personal-session': {
    id: 'personal-session',
    title: 'Персональные занятия',
    shortTitle: 'Индивидуальная практика',
    description:
      'Один-на-один: смотрим ваше тело, дыхание и то, что сейчас мешает практиковать спокойно.',
    details:
      'Подходит после травмы, если спина беспокоит, или если хотите точечно поправить технику. Для регулярной практики есть клуб.',
    priceLabel: '8 000 ₽/занятие',
    ctaLabel: 'Записаться персонально',
    primaryPath: '/personal',
    checkoutPath: '/checkout/personal-session',
    image: IMAGES.services.personal,
    includes: [
      'План встречи под ваше состояние',
      'Разбор техники под ваше состояние',
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

import { RETREAT_CHANNEL_URL } from './retreat';
import { ALL_LEVELS_NOTE, LIVE_CLASSES_SUMMARY } from './clubContent';
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
  LIVE_CLASSES_SUMMARY,
  'Записи всех занятий, если не получилось прийти',
  ALL_LEVELS_NOTE,
  'Чат с преподавателем, ответ ежедневно 10:00–22:00 МСК',
  'Классическая хатха-йога по традиции нашей школы',
] as const;

export const PRODUCTS: Record<ProductId, ProductConfig> = {
  'club-monthly': {
    id: 'club-monthly',
    title: 'Онлайн Йога-Клуб',
    shortTitle: 'Месячная подписка',
    description: '30 дней в клубе: живые практики, записи и чат с нами. 6 000 ₽ в месяц.',
    details:
      'Живые занятия в Zoom, записи, материалы по практике и чат с нами. Ссылку на занятие вы найдёте в личном кабинете.',
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
        'Четыре живые практики в неделю в Zoom, записи всех занятий, материалы по практике и задания «Йога вне коврика». И чат, где мы отвечаем на ваши вопросы.',
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
    details: 'Тот же клуб: живые практики, записи и чат.',
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
      'Время от времени мы уезжаем вместе с вами практиковать на несколько дней. О каждом новом ретрите рассказываем в нашем канале @TJyogatrip.',
    details:
      'Время от времени мы уезжаем вместе с вами практиковать на несколько дней. О каждом новом ретрите мы рассказываем в нашем канале @TJyogatrip.',
    priceLabel: '',
    ctaLabel: 'Смотреть ретрит',
    primaryPath: '/retreats',
    checkoutPath: '/checkout/retreat-pass',
    bookingHref: RETREAT_CHANNEL_URL,
    image: IMAGES.services.retreat,
    includes: [],
    homeCard: {
      title: 'Йогические выходные',
      description:
        'Время от времени мы уезжаем вместе с вами практиковать на несколько дней. О каждом новом ретрите рассказываем в нашем канале @TJyogatrip.',
      primaryCta: 'Подробнее',
      secondaryCta: 'Канал @TJyogatrip',
    },
  },
  'personal-session': {
    id: 'personal-session',
    title: 'Персональные занятия',
    shortTitle: 'Индивидуальная практика',
    description: 'Женя занимается с вами один на один: смотрит, как вы дышите и выполняете асаны, и направляет.',
    details:
      'Персональные занятия подойдут, если вы восстанавливаетесь после травмы, вас беспокоит спина или хочется подробно разобрать свою технику. Для регулярной практики лучше подойдёт клуб.',
    priceLabel: '8 000 ₽/занятие',
    ctaLabel: 'Записаться персонально',
    primaryPath: '/personal',
    checkoutPath: '/checkout/personal-session',
    bookingHref: 'https://t.me/starovoitovae',
    image: IMAGES.services.personal,
    includes: [
      'Смотрим тело и дыхание',
      'Разбираем технику',
      'Задания для практики дома до следующей встречи',
    ],
    homeCard: {
      title: 'Персональные занятия',
      description: 'Женя занимается с вами один на один: смотрит, как вы дышите и выполняете асаны, и направляет.',
      primaryCta: 'Подробнее',
      secondaryCta: 'Написать Жене',
    },
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

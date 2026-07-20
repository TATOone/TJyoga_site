import { IMAGES } from './images';

export type ProductId = 'club-monthly' | 'club-yearly' | 'retreat-pass' | 'personal-session';

export interface ProductConfig {
  id: ProductId;
  title: string;
  shortTitle: string;
  description: string;
  details: string;
  priceLabel: string;
  ctaLabel: string;
  primaryPath: string;
  checkoutPath: string;
  image: string;
  includes: readonly string[];
  featured?: boolean;
  showCountdown?: boolean;
}

const clubCoreIncludes = [
  'Онлайн-занятия в прямом эфире',
  'Библиотека записанных уроков',
  'Практика «Йога вне коврика»',
  'Разбор первоисточников и философии',
  'Поддержка сообщества практикующих',
] as const;

export const PRODUCTS: Record<ProductId, ProductConfig> = {
  'club-monthly': {
    id: 'club-monthly',
    title: 'Онлайн Йога-Клуб',
    shortTitle: 'Месячная подписка',
    description: 'Идеальный вход в клубный формат: доступ на 1 месяц с полным наполнением.',
    details:
      'Закрытый Telegram-канал с занятиями, записями, методическими материалами и живой поддержкой преподавателя.',
    priceLabel: '6 000 ₽/месяц',
    ctaLabel: 'Вступить в клуб',
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
      '12 месяцев стабильной практики и заметная экономия: годовой формат для устойчивого результата.',
    details:
      'Подходит тем, кто готов встроить йогу в повседневную жизнь и пройти полный цикл практики с поддержкой.',
    priceLabel: '60 000 ₽/год (5 000 ₽/мес)',
    ctaLabel: 'Выбрать годовой тариф',
    primaryPath: '/club/rates',
    checkoutPath: '/checkout/club-yearly',
    image: IMAGES.services.onlineClub,
    includes: [...clubCoreIncludes, '2 месяца практики в подарок'],
    featured: true,
  },
  'retreat-pass': {
    id: 'retreat-pass',
    title: 'Йога-Ретриты',
    shortTitle: 'Ретриты',
    description:
      'Погружение в практику в природных локациях с ежедневными занятиями, режимом и сопровождением.',
    details: 'Формат для глубокой перезагрузки, укрепления дисциплины и восстановления ресурса.',
    priceLabel: 'от 35 000 ₽',
    ctaLabel: 'Узнать подробности',
    primaryPath: '/retreats',
    checkoutPath: '/checkout/retreat-pass',
    image: IMAGES.services.retreat,
    includes: [
      'Ежедневная групповая практика',
      'Программа по работе с телом и вниманием',
      'Сопровождение преподавателя',
    ],
    showCountdown: true,
    featured: true,
  },
  'personal-session': {
    id: 'personal-session',
    title: 'Персональные занятия',
    shortTitle: 'Индивидуальная практика',
    description:
      'Один-на-один с преподавателем: точечная работа под ваши цели, состояние и физические особенности.',
    details: 'Подходит для старта после травм, коррекции техники и ускорения личного прогресса.',
    priceLabel: '8 000 ₽/занятие',
    ctaLabel: 'Записаться персонально',
    primaryPath: '/personal',
    checkoutPath: '/checkout/personal-session',
    image: IMAGES.services.personal,
    includes: [
      'Персональный план занятия',
      'Обратная связь по технике',
      'Рекомендации для самостоятельной практики',
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

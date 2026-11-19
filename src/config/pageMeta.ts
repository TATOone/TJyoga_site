import { SEED_ARTICLES } from './seedContent';

export interface PageMetaConfig {
  title: string;
  description: string;
  path: string;
  robots: 'index,follow' | 'noindex,nofollow';
  keywords?: string;
  ogType?: 'website' | 'article';
}

export type PageMetaKey =
  | 'home'
  | 'club'
  | 'clubRates'
  | 'free'
  | 'retreats'
  | 'personal'
  | 'about'
  | 'howToBuy'
  | 'checkout'
  | 'paymentSuccess'
  | 'paymentError'
  | 'offer'
  | 'policy'
  | 'refund'
  | 'medicalDisclaimer'
  | 'account'
  | 'accountLogin'
  | 'accountRegister'
  | 'admin'
  | 'blog'
  | 'notFound';

export const SITE_URL = 'https://tjyoga.ru';
export const SITE_NAME = 'TJ Yoga';
export const SITE_LOCALE = 'ru_RU';
export const OG_IMAGE_PATH = '/images/og-image.png';
export const OG_IMAGE_URL = `${SITE_URL}${OG_IMAGE_PATH}`;
export const OG_IMAGE_WIDTH = '1200';
export const OG_IMAGE_HEIGHT = '630';
export const OG_IMAGE_ALT = 'TJ Yoga - Тим и Женя, классическая хатха-йога';
export const OG_IMAGE_TYPE = 'image/png';
export const TWITTER_CARD = 'summary_large_image';

export const PAGE_META: Record<PageMetaKey, PageMetaConfig> = {
  home: {
    title: 'Онлайн Йога-Клуб TJ Yoga - классическая хатха в Zoom и в записях',
    description:
      'Мы Тим и Женя, преподаём классическую хатха-йогу. В нашем клубе живые практики в Zoom, записи занятий и чат с нами. 6 000 ₽/месяц или 60 000 ₽/год.',
    path: '/',
    robots: 'index,follow',
    keywords:
      'йога клуб онлайн, хатха йога из первоисточников, занятия йогой в zoom, йога для начинающих, TJ Yoga',
  },
  club: {
    title: 'Онлайн Йога-Клуб TJ Yoga: живые практики в Zoom, записи и чат',
    description:
      'Четыре живые практики в неделю в Zoom, записи занятий и чат с нами. Классическая хатха-йога по традиции нашей школы, для любого уровня.',
    path: '/club',
    robots: 'index,follow',
    keywords: 'йога клуб онлайн, расписание хатха йоги, подписка на йогу, йога с преподавателем',
  },
  clubRates: {
    title: 'Тарифы Йога-Клуба: 6 000 ₽/месяц или 60 000 ₽/год - TJ Yoga',
    description:
      'Клуб на месяц за 6 000 ₽ или на год за 60 000 ₽. Доступ одинаковый: живые практики в Zoom, записи и чат.',
    path: '/club/rates',
    robots: 'index,follow',
    keywords: 'тарифы йога клуба, цена подписки на хатха йогу, годовая подписка йога',
  },
  free: {
    title: 'Бесплатные практики хатха-йоги на YouTube - TJ Yoga',
    description:
      'Три бесплатные практики с нашего YouTube: утренняя и вечерняя по 60 минут и короткая утренняя на 20 минут.',
    path: '/free',
    robots: 'index,follow',
    keywords: 'бесплатная йога онлайн, хатха йога youtube, йога утро, йога вечер, TJ Yoga',
  },
  retreats: {
    title: 'Йогические выходные с Тимом и Женей - TJ Yoga',
    description:
      'Время от времени мы уезжаем вместе практиковать на несколько дней. Анонсы новых ретритов - в Telegram-канале @TJyogatrip.',
    path: '/retreats',
    robots: 'index,follow',
    keywords: 'йога ретрит, йогические выходные, ретрит с Тимом и Женей, TJ Yoga',
  },
  personal: {
    title: 'Персональные занятия йогой - TJ Yoga',
    description:
      'Персональные занятия йогой с Женей один на один: разбираем дыхание и технику. Для регулярной практики у нас есть клуб.',
    path: '/personal',
    robots: 'index,follow',
    keywords: 'персональные занятия йогой, индивидуальная йога',
  },
  about: {
    title: 'Тим и Женя - TJ Yoga, классическая хатха-йога',
    description:
      'Мы Тим и Женя, преподаём классическую хатха-йогу школы Патанджали. Учились в ашраме в Ришикеше и продолжаем учиться у своих учителей.',
    path: '/about',
    robots: 'index,follow',
    keywords: 'Женя Старовойтова йога, преподаватели хатха йоги, TJ Yoga о нас',
  },
  howToBuy: {
    title: 'Как оформить подписку на Йога-Клуб TJ Yoga',
    description:
      'Как оформить подписку на клуб на месяц или на год: выбрать тариф, оплатить картой и войти в кабинет.',
    path: '/how-to-buy',
    robots: 'index,follow',
    keywords: 'как купить подписку на йогу, оплата йога клуба, TJ Yoga доступ',
  },
  checkout: {
    title: 'Оплата - TJ Yoga',
    description: 'Выбор тарифа, согласия и переход к оплате.',
    path: '/checkout',
    robots: 'noindex,nofollow',
  },
  paymentSuccess: {
    title: 'Оплата успешна - TJ Yoga',
    description: 'Оплата прошла. Теперь можно войти в кабинет.',
    path: '/payment/success',
    robots: 'noindex,nofollow',
  },
  paymentError: {
    title: 'Оплата не завершена - TJ Yoga',
    description: 'Платёж не завершён. Можно оплатить ещё раз.',
    path: '/payment/error',
    robots: 'noindex,nofollow',
  },
  offer: {
    title: 'Публичная оферта - TJ Yoga',
    description:
      'Публичная оферта TJ Yoga: условия оказания услуг, порядок оплаты, сроки доступа и ответственность сторон.',
    path: '/offer',
    robots: 'index,follow',
  },
  policy: {
    title: 'Политика обработки персональных данных - TJ Yoga',
    description:
      'Политика обработки персональных данных TJ Yoga: цели обработки, права субъекта данных и порядок хранения.',
    path: '/policy',
    robots: 'index,follow',
  },
  refund: {
    title: 'Условия возврата - TJ Yoga',
    description:
      'Правила возврата в TJ Yoga: сроки обращения, порядок рассмотрения заявки и условия отмены доступа.',
    path: '/refund',
    robots: 'index,follow',
  },
  medicalDisclaimer: {
    title: 'Медицинский отказ от ответственности - TJ Yoga',
    description:
      'Медицинский отказ от ответственности TJ Yoga: ограничения практики и рекомендации по безопасности.',
    path: '/medical-disclaimer',
    robots: 'index,follow',
  },
  account: {
    title: 'Кабинет - TJ Yoga',
    description: 'Кабинет Йога-Клуба: Zoom, записи и подписка.',
    path: '/account',
    robots: 'noindex,nofollow',
  },
  accountLogin: {
    title: 'Вход в кабинет - TJ Yoga',
    description: 'Вход в кабинет Йога-Клуба TJ Yoga.',
    path: '/account/login',
    robots: 'noindex,nofollow',
  },
  accountRegister: {
    title: 'Регистрация - TJ Yoga',
    description: 'Регистрация в Йога-Клубе TJ Yoga.',
    path: '/account/register',
    robots: 'noindex,nofollow',
  },
  admin: {
    title: 'Админка - TJ Yoga',
    description: 'Внутренняя админка TJ Yoga.',
    path: '/admin',
    robots: 'noindex,nofollow',
  },
  blog: {
    title: 'Блог TJ Yoga - открытые заметки о практике',
    description:
      'Заметки о хатха-йоге и практике от Тима и Жени, так же как в нашем Telegram-канале TJyoga.',
    path: '/blog',
    robots: 'index,follow',
    keywords: 'блог о йоге, статьи о йоге, хатха йога блог',
    ogType: 'website',
  },
  notFound: {
    title: 'Страница не найдена - TJ Yoga',
    description: 'Этой страницы нет. Можно вернуться на главную TJ Yoga.',
    path: '/404',
    robots: 'noindex,nofollow',
  },
};

export interface PageMetaOverrides {
  title?: string;
  description?: string;
  path?: string;
  robots?: PageMetaConfig['robots'];
  keywords?: string;
  ogType?: PageMetaConfig['ogType'];
}

export interface ResolvedPageMeta extends PageMetaConfig {
  canonicalUrl: string;
  ogType: 'website' | 'article';
}

const normalizePathname = (pathname: string): string =>
  pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

/** Сопоставляет URL с ключом PAGE_META до загрузки lazy-чанка. */
export const getPageMetaKeyForPath = (pathname: string): PageMetaKey => {
  const normalized = normalizePathname(pathname);

  if (normalized === '/') return 'home';
  if (normalized === '/club') return 'club';
  if (normalized === '/club/rates') return 'clubRates';
  if (normalized === '/free') return 'free';
  if (normalized === '/retreats') return 'retreats';
  if (normalized === '/personal') return 'personal';
  if (normalized === '/about') return 'about';
  if (normalized === '/how-to-buy') return 'howToBuy';
  if (normalized === '/checkout' || normalized.startsWith('/checkout/')) return 'checkout';
  if (normalized === '/payment/success') return 'paymentSuccess';
  if (normalized === '/payment/error') return 'paymentError';
  if (normalized === '/offer') return 'offer';
  if (normalized === '/policy') return 'policy';
  if (normalized === '/refund') return 'refund';
  if (normalized === '/medical-disclaimer') return 'medicalDisclaimer';
  if (normalized === '/account/login') return 'accountLogin';
  if (normalized === '/account/register') return 'accountRegister';
  if (normalized === '/admin' || normalized.startsWith('/admin/')) return 'admin';
  if (normalized === '/account' || normalized.startsWith('/account/')) return 'account';
  if (normalized === '/blog' || normalized.startsWith('/blog/')) return 'blog';
  return 'notFound';
};

/**
 * Собирает итоговые meta для URL: уникальный path у checkout/blog,
 * известные публичные статьи получают свой title/description.
 */
export const resolvePageMeta = (
  pathname: string,
  overrides?: PageMetaOverrides,
): ResolvedPageMeta => {
  const normalized = normalizePathname(pathname);
  const key = getPageMetaKeyForPath(normalized);
  const base = PAGE_META[key];

  let title = base.title;
  let description = base.description;
  let path = base.path;
  const robots = base.robots;
  const keywords = base.keywords;
  let ogType: 'website' | 'article' = base.ogType ?? 'website';

  if (key === 'checkout' && normalized.startsWith('/checkout/')) {
    path = normalized;
  }

  if (key === 'blog' && normalized.startsWith('/blog/')) {
    path = normalized;
    ogType = 'article';
    const slug = normalized.slice('/blog/'.length);
    const article = SEED_ARTICLES.find((item) => item.slug === slug && item.access === 'public');
    if (article) {
      title = `${article.title} - ${SITE_NAME}`;
      description = article.excerpt;
    }
  }

  return {
    ...base,
    title: overrides?.title ?? title,
    description: overrides?.description ?? description,
    path: overrides?.path ?? path,
    robots: overrides?.robots ?? robots,
    keywords: overrides?.keywords ?? keywords,
    ogType: overrides?.ogType ?? ogType,
    canonicalUrl: `${SITE_URL}${overrides?.path ?? path}`,
  };
};

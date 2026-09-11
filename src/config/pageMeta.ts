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

export const PAGE_META: Record<PageMetaKey, PageMetaConfig> = {
  home: {
    title: 'Онлайн Йога-Клуб TJ Yoga — классическая хатха в Zoom и в записях',
    description:
      'Подписка на клуб: живые практики хатха-йоги из первоисточников, записи занятий, понятные уровни и чат с преподавателем. 6 000 ₽/месяц или 60 000 ₽/год.',
    path: '/',
    robots: 'index,follow',
    keywords:
      'йога клуб онлайн, хатха йога из первоисточников, занятия йогой в zoom, йога для начинающих, TJ Yoga',
  },
  club: {
    title: 'Что внутри Йога-Клуба TJ Yoga: эфиры, записи, уровни, чат',
    description:
      'Как устроен онлайн-клуб TJ Yoga: расписание Zoom, библиотека записей, уровни практики, поддержка преподавателя и кому подходит классическая хатха.',
    path: '/club',
    robots: 'index,follow',
    keywords: 'йога клуб онлайн, расписание хатха йоги, подписка на йогу, йога с преподавателем',
  },
  clubRates: {
    title: 'Тарифы Йога-Клуба: 6 000 ₽/месяц или 60 000 ₽/год — TJ Yoga',
    description:
      'Месячная подписка 6 000 ₽ и годовая 60 000 ₽. Одно наполнение: Zoom, записи, чат. Цена на экране — та же при оплате, без доплат.',
    path: '/club/rates',
    robots: 'index,follow',
    keywords: 'тарифы йога клуба, цена подписки на хатха йогу, годовая подписка йога',
  },
  retreats: {
    title: 'Йога-ретриты TJ Yoga',
    description:
      'Ретриты TJ Yoga: погружение в практику, программа по телу и вниманию, сопровождение преподавателя.',
    path: '/retreats',
    robots: 'index,follow',
    keywords: 'йога ретрит, ретрит по йоге',
  },
  personal: {
    title: 'Персональные занятия йогой — TJ Yoga',
    description:
      'Индивидуальные занятия с преподавателем TJ Yoga: персональный план, работа с техникой и поддержка практики.',
    path: '/personal',
    robots: 'index,follow',
    keywords: 'персональные занятия йогой, индивидуальная йога',
  },
  about: {
    title: 'Женя и Тим — TJ Yoga, классическая хатха из первоисточников',
    description:
      'Семья йогов Женя Старовойтова и Тим передают хатха-йогу школы Патанджали: практика из Ришикеша, без фитнес-хайпа и без обещания идеального тела.',
    path: '/about',
    robots: 'index,follow',
    keywords: 'Женя Старовойтова йога, преподаватели хатха йоги, TJ Yoga о нас',
  },
  howToBuy: {
    title: 'Как оформить подписку на Йога-Клуб TJ Yoga',
    description:
      'Как оплатить месяц или год клуба: тариф, кабинет, оплата, когда открывается доступ и куда писать, если что-то не пришло.',
    path: '/how-to-buy',
    robots: 'index,follow',
    keywords: 'как купить подписку на йогу, оплата йога клуба, TJ Yoga доступ',
  },
  checkout: {
    title: 'Оформление заказа — TJ Yoga',
    description: 'Checkout TJ Yoga: подтверждение тарифа, согласий и переход к оплате Prodamus.',
    path: '/checkout',
    robots: 'noindex,nofollow',
  },
  paymentSuccess: {
    title: 'Оплата успешна — TJ Yoga',
    description: 'Статус успешной оплаты подписки TJ Yoga.',
    path: '/payment/success',
    robots: 'noindex,nofollow',
  },
  paymentError: {
    title: 'Оплата не завершена — TJ Yoga',
    description: 'Статус незавершённой оплаты подписки TJ Yoga.',
    path: '/payment/error',
    robots: 'noindex,nofollow',
  },
  offer: {
    title: 'Публичная оферта — TJ Yoga',
    description:
      'Публичная оферта TJ Yoga: условия оказания услуг, порядок оплаты, сроки доступа и ответственность сторон.',
    path: '/offer',
    robots: 'index,follow',
  },
  policy: {
    title: 'Политика обработки персональных данных — TJ Yoga',
    description:
      'Политика обработки персональных данных TJ Yoga: цели обработки, права субъекта данных и порядок хранения.',
    path: '/policy',
    robots: 'index,follow',
  },
  refund: {
    title: 'Условия возврата — TJ Yoga',
    description:
      'Правила возврата в TJ Yoga: сроки обращения, порядок рассмотрения заявки и условия отмены доступа.',
    path: '/refund',
    robots: 'index,follow',
  },
  medicalDisclaimer: {
    title: 'Медицинский отказ от ответственности — TJ Yoga',
    description:
      'Медицинский отказ от ответственности TJ Yoga: ограничения практики и рекомендации по безопасности.',
    path: '/medical-disclaimer',
    robots: 'index,follow',
  },
  account: {
    title: 'Личный кабинет — TJ Yoga',
    description: 'Кабинет участника Йога-Клуба TJ Yoga.',
    path: '/account',
    robots: 'noindex,nofollow',
  },
  accountLogin: {
    title: 'Вход в кабинет — TJ Yoga',
    description: 'Вход в личный кабинет Йога-Клуба TJ Yoga.',
    path: '/account/login',
    robots: 'noindex,nofollow',
  },
  accountRegister: {
    title: 'Регистрация — TJ Yoga',
    description: 'Регистрация в Йога-Клубе TJ Yoga.',
    path: '/account/register',
    robots: 'noindex,nofollow',
  },
  admin: {
    title: 'Админка — TJ Yoga',
    description: 'Внутренняя админка TJ Yoga.',
    path: '/admin',
    robots: 'noindex,nofollow',
  },
  blog: {
    title: 'Блог TJ Yoga — открытые заметки о практике',
    description:
      'Публичный блог TJ Yoga: открытые материалы о хатха-йоге, практике и подходе школы.',
    path: '/blog',
    robots: 'index,follow',
    keywords: 'блог о йоге, статьи о йоге, хатха йога блог',
    ogType: 'article',
  },
  notFound: {
    title: 'Страница не найдена — TJ Yoga',
    description: 'Запрашиваемая страница не найдена. Вернитесь на главную TJ Yoga.',
    path: '/404',
    robots: 'noindex,nofollow',
  },
};

/**
 * Сопоставляет URL с ключом PAGE_META, чтобы каждая публичная страница
 * получала свой title/description ещё до загрузки lazy-чанка.
 */
export const getPageMetaKeyForPath = (pathname: string): PageMetaKey => {
  const normalized =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (normalized === '/') return 'home';
  if (normalized === '/club') return 'club';
  if (normalized === '/club/rates') return 'clubRates';
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

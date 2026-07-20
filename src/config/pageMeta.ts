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
    title: 'TJ Yoga — Онлайн Йога-Клуб, ретриты и персональная практика',
    description:
      'Онлайн Йога-Клуб TJ Yoga: занятия в прямом эфире, библиотека уроков, ретриты и персональные занятия с преподавателем.',
    path: '/',
    robots: 'index,follow',
    keywords:
      'йога клуб, хатха йога онлайн, онлайн занятия йогой, йога ретрит, персональная йога, TJ Yoga',
  },
  club: {
    title: 'Йога-Клуб TJ Yoga — формат и преимущества',
    description:
      'Подробно о формате Йога-Клуба TJ Yoga: что входит в подписку, как проходят занятия и кому подходит клубный формат.',
    path: '/club',
    robots: 'index,follow',
    keywords: 'йога клуб онлайн, подписка на йогу, занятия в телеграм',
  },
  clubRates: {
    title: 'Тарифы Йога-Клуба TJ Yoga',
    description:
      'Месячная и годовая подписка TJ Yoga: сравнение тарифов, наполнение и удобный переход к оформлению покупки.',
    path: '/club/rates',
    robots: 'index,follow',
    keywords: 'тарифы йога клуба, цена подписки на йогу',
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
    title: 'О проекте TJ Yoga',
    description:
      'История TJ Yoga, подход к преподаванию и опыт команды: классическая хатха-йога из первоисточников.',
    path: '/about',
    robots: 'index,follow',
    keywords: 'о школе йоги TJ Yoga, преподаватели йоги',
  },
  howToBuy: {
    title: 'Как купить доступ — TJ Yoga',
    description:
      'Пошаговый регламент покупки доступа в TJ Yoga: оформление, подтверждение, выдача доступа и поддержка.',
    path: '/how-to-buy',
    robots: 'index,follow',
    keywords: 'как купить подписку на йогу, оформление доступа',
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

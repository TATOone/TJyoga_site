/**
 * Утверждённый контент клуба для MVP.
 * Цены синхронизированы с PRODUCTS и backend PLAN_CATALOG (копейки).
 */

export const CLUB_STRUCTURE = {
  title: 'Структура Йога-Клуба',
  pillars: [
    {
      id: 'live',
      title: 'Прямые практики',
      description: 'Онлайн-занятия в Zoom: хатха-йога из первоисточников с живой обратной связью.',
    },
    {
      id: 'recordings',
      title: 'Библиотека записей',
      description: 'Записи практик и семинаров в Kinescope — доступны при активной подписке.',
    },
    {
      id: 'knowledge',
      title: 'Знания и статьи',
      description: 'Клубные материалы по философии, технике и практике «йога вне коврика».',
    },
    {
      id: 'community',
      title: 'Сообщество',
      description: 'Закрытый Telegram-канал и поддержка преподавателя в рабочие часы.',
    },
  ],
} as const;

export interface ZoomScheduleItem {
  id: string;
  dayLabel: string;
  timeLabel: string;
  title: string;
  durationMin: number;
  level: 'все уровни' | 'начинающие' | 'продолжающие';
}

/** Расписание Zoom (МСК). Ссылка на комнату хранится только на backend. */
export const ZOOM_SCHEDULE: readonly ZoomScheduleItem[] = [
  {
    id: 'mon-morning',
    dayLabel: 'Понедельник',
    timeLabel: '08:00',
    title: 'Утренняя хатха-практика',
    durationMin: 60,
    level: 'все уровни',
  },
  {
    id: 'wed-evening',
    dayLabel: 'Среда',
    timeLabel: '19:30',
    title: 'Вечерняя практика и восстановление',
    durationMin: 75,
    level: 'все уровни',
  },
  {
    id: 'sat-deep',
    dayLabel: 'Суббота',
    timeLabel: '11:00',
    title: 'Углублённая практика / семинар',
    durationMin: 90,
    level: 'продолжающие',
  },
] as const;

export type VideoCategoryId = 'practices' | 'seminars' | 'philosophy' | 'new';

export interface VideoCategory {
  id: VideoCategoryId;
  title: string;
  description: string;
}

export const VIDEO_CATEGORIES: readonly VideoCategory[] = [
  {
    id: 'practices',
    title: 'Практики',
    description: 'Записи регулярных занятий для самостоятельной практики.',
  },
  {
    id: 'seminars',
    title: 'Семинары',
    description: 'Тематические блоки и разборы техники.',
  },
  {
    id: 'philosophy',
    title: 'Философия',
    description: 'Разборы первоисточников и теория.',
  },
  {
    id: 'new',
    title: 'Новое',
    description: 'Недавно добавленные записи.',
  },
] as const;

export type ArticleCategoryId = 'technique' | 'lifestyle' | 'club-news' | 'open';

export interface ArticleCategory {
  id: ArticleCategoryId;
  title: string;
  access: 'public' | 'club';
}

export const ARTICLE_CATEGORIES: readonly ArticleCategory[] = [
  { id: 'open', title: 'Открытые материалы', access: 'public' },
  { id: 'technique', title: 'Техника практики', access: 'club' },
  { id: 'lifestyle', title: 'Йога вне коврика', access: 'club' },
  { id: 'club-news', title: 'Новости клуба', access: 'club' },
] as const;

export const CLUB_SUPPORT = {
  telegram: 'https://t.me/starovoitovae',
  telegramHandle: '@starovoitovae',
  email: 'support@tjyoga.ru',
  sla: 'Ответ до 2 часов, ежедневно 10:00–22:00 МСК',
  faq: [
    {
      q: 'Как попасть на занятие в Zoom?',
      a: 'В личном кабинете нажмите «Войти в занятие». Ссылка открывается через защищённый redirect и не показывается в интерфейсе.',
    },
    {
      q: 'Когда активируется доступ после оплаты?',
      a: 'После подтверждения оплаты Prodamus webhook активирует подписку автоматически. Обычно это занимает до нескольких минут.',
    },
    {
      q: 'Как продлить подписку?',
      a: 'Продление ручное: выберите тариф на странице клуба и оплатите снова. Grace-period после окончания — 72 часа.',
    },
  ],
} as const;

export const CLUB_SOCIAL_PROOF = [
  { label: 'Практик в неделю', value: '3+' },
  { label: 'Формат', value: 'Zoom + записи' },
  { label: 'Поддержка', value: '10:00–22:00 МСК' },
  { label: 'Grace-period', value: '72 часа' },
] as const;

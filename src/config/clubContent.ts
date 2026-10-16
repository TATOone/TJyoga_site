/**
 * Утверждённый контент клуба для публичной витрины.
 * Цены синхронизированы с PRODUCTS и backend PLAN_CATALOG (копейки).
 * Сезонный тон читается из campaignAccent.ts — этот файл держит устойчивые факты.
 */

export const CLUB_STRUCTURE = {
  title: 'Что входит в клуб',
  pillars: [
    {
      id: 'live',
      title: 'Живые практики',
      description:
        'Четыре раза в неделю в Zoom. Классическая хатха, с вариантами под разный уровень.',
    },
    {
      id: 'recordings',
      title: 'Записи, если пропустили',
      description: 'Пока подписка активна, занятие можно открыть в своё время.',
    },
    {
      id: 'knowledge',
      title: 'Знания и материалы',
      description: 'Тексты по технике, философии и «йоге вне коврика».',
    },
    {
      id: 'community',
      title: 'Мы в чате',
      description:
        'Можно спросить про колено, первый эфир или домашнюю практику. Отвечаем в рабочие часы.',
    },
  ],
} as const;

export const CLUB_PROGRAM = {
  title: 'Уровни',
  intro: 'У каждой практики указан уровень. Воскресенье длиннее - новичкам не обязательно.',
  levels: [
    {
      id: 'all',
      title: 'Все уровни',
      description:
        'Зарядка во вторник, утро в пятницу и вечер в среду. Можно с нуля: есть простой вариант позы.',
    },
    {
      id: 'beginners',
      title: 'Начинающие',
      description:
        'Темп спокойный, объяснения подробные. Названия асан знать заранее не нужно.',
    },
    {
      id: 'continuing',
      title: 'Продолжающие',
      description: 'Воскресенье вечером: более длинная практика. Новичкам не обязательно.',
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
    id: 'sun-evening',
    dayLabel: 'Воскресенье',
    timeLabel: '19:30–21:00',
    title: 'Вечерняя практика',
    durationMin: 90,
    level: 'продолжающие',
  },
  {
    id: 'tue-morning-charge',
    dayLabel: 'Вторник',
    timeLabel: '08:00–08:30',
    title: 'Зарядка',
    durationMin: 30,
    level: 'все уровни',
  },
  {
    id: 'wed-evening',
    dayLabel: 'Среда',
    timeLabel: '20:00–21:00',
    title: 'Вечерняя практика и восстановление',
    durationMin: 60,
    level: 'все уровни',
  },
  {
    id: 'fri-morning',
    dayLabel: 'Пятница',
    timeLabel: '08:00–09:00',
    title: 'Утренняя хатха-практика',
    durationMin: 60,
    level: 'все уровни',
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
    description: 'Записи регулярных занятий.',
  },
  {
    id: 'seminars',
    title: 'Семинары',
    description: 'Разборы техники.',
  },
  {
    id: 'philosophy',
    title: 'Философия',
    description: 'Первоисточники.',
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
      q: 'Можно ли приходить с нуля?',
      a: 'Да. Зарядка, утро и вечер - для всех уровней, есть простой вариант. Воскресенье длиннее: новичкам не обязательно. Перед первым эфиром можно написать в чат, что беспокоит в теле.',
    },
    {
      q: 'Что за йога у вас?',
      a: 'Классическая хатха-йога из первоисточников: дыхание, внимание, устойчивые асаны. Традиция нашей школы.',
    },
    {
      q: 'Что, если я пропущу эфир?',
      a: 'Запись появляется в кабинете. Пока подписка активна, можно практиковать в своё время.',
    },
    {
      q: 'Как попасть на занятие в Zoom?',
      a: 'В кабинете нажмите «Войти в занятие». Ссылка открывается через защищённый переход и не копируется в открытый чат.',
    },
    {
      q: 'Когда откроется доступ после оплаты?',
      a: 'Обычно за несколько минут. Если кабинет ещё закрыт - напишите в Telegram: в рабочие часы доступ включают вручную в течение двух часов.',
    },
    {
      q: 'Как продлить подписку?',
      a: 'После окончания подписки доступ ещё 72 часа - можно продлить без разрыва. Дальше снова выбираете тариф и оплачиваете.',
    },
  ],
} as const;

export const CLUB_SOCIAL_PROOF = [
  { label: 'Практик в неделю', value: '4' },
  { label: 'Формат', value: 'Zoom + записи' },
  { label: 'Поддержка', value: '10:00–22:00 МСК' },
  { label: 'Продление без разрыва', value: '72 часа' },
] as const;

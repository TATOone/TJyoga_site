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
        'Онлайн-занятия в Zoom три раза в неделю: хатха из первоисточников, с вариантами под разный уровень и живой обратной связью.',
    },
    {
      id: 'recordings',
      title: 'Записи, если пропустили',
      description:
        'Библиотека практик и семинаров в Kinescope. Пока подписка активна, можно вернуться к занятию в своём ритме.',
    },
    {
      id: 'knowledge',
      title: 'Знания, не хаос ленты',
      description:
        'Клубные материалы по технике, философии и практике «йога вне коврика» — рядом с расписанием, а не вместо него.',
    },
    {
      id: 'community',
      title: 'Преподаватель в чате',
      description:
        'Закрытый Telegram-чат и ответ в рабочие часы. Можно спросить про колено, тревогу перед первым эфиром или домашнюю практику.',
    },
  ],
} as const;

export const CLUB_PROGRAM = {
  title: 'Программа и уровни',
  intro:
    'Неделя читается сразу: не нужно угадывать, «куда жать». У каждой практики указан уровень. Новичкам не выставляют «продвинутый» эфир как обязательный.',
  levels: [
    {
      id: 'all',
      title: 'Все уровни',
      description:
        'Понедельник утром и среда вечером. Можно приходить с нуля: есть более простой вариант позы и опора на дыхание.',
    },
    {
      id: 'beginners',
      title: 'Начинающие',
      description:
        'Темп спокойный, объяснения подробные. Не нужно знать названия асан заранее. Если страшно — напишите в чат до занятия.',
    },
    {
      id: 'continuing',
      title: 'Продолжающие',
      description:
        'Суббота: углубление и семинары. Имеет смысл, когда регулярная практика уже есть. Новичкам не обязательно.',
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
      q: 'Можно ли приходить с нуля?',
      a: 'Да. Утренние и вечерние практики — для всех уровней, есть более простой вариант. Суббота глубже: новичкам она не обязательна. Перед первым эфиром можно написать в чат, что тревожит в теле.',
    },
    {
      q: 'Это фитнес или «йога для похудения»?',
      a: 'Нет. Мы передаём классическую хатха-йогу из первоисточников: дыхание, внимание, устойчивые асаны. Не трендовые связки и не марафон гибкости.',
    },
    {
      q: 'Что, если я пропущу эфир?',
      a: 'Запись появляется в библиотеке кабинета. Пока подписка активна, можно практиковать в своё время.',
    },
    {
      q: 'Как попасть на занятие в Zoom?',
      a: 'В личном кабинете нажмите «Войти в занятие». Ссылка открывается через защищённый переход и не копируется в открытый чат.',
    },
    {
      q: 'Когда откроется доступ после оплаты?',
      a: 'Обычно в течение нескольких минут после подтверждения оплаты. Если кабинет ещё закрыт — напишите в Telegram: в рабочие часы доступ включают вручную в течение двух часов.',
    },
    {
      q: 'Как продлить подписку?',
      a: 'После окончания подписки доступ сохраняется ещё 72 часа — можно продлить без разрыва. Дальше снова выбираете тариф и оплачиваете.',
    },
  ],
} as const;

export const CLUB_SOCIAL_PROOF = [
  { label: 'Практик в неделю', value: '3' },
  { label: 'Формат', value: 'Zoom + записи' },
  { label: 'Поддержка', value: '10:00–22:00 МСК' },
  { label: 'чтобы продлить без разрыва', value: '72 часа после окончания' },
] as const;

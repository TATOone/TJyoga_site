/**
 * Утверждённый контент клуба для публичной витрины.
 * Цены синхронизированы с PRODUCTS и backend PLAN_CATALOG (копейки).
 * Сезонный тон читается из campaignAccent.ts — этот файл держит устойчивые факты.
 * Расписание Zoom — единственный источник дней и часов. Та же формулировка
 * вручную повторена в rates/index.html: это статическая страница без сборки.
 */

/** Все занятия клуба подходят любому уровню. Отдельных уровней у практик нет. */
export const ALL_LEVELS_NOTE = 'Все занятия подходят для любого уровня';

export const CLUB_STRUCTURE = {
  title: 'Что входит в клуб',
  pillars: [
    {
      id: 'live',
      title: 'Живые практики',
      description: 'Четыре раза в неделю в Zoom. Мы видим вас на занятии и направляем.',
    },
    {
      id: 'recordings',
      title: 'Записи всех занятий',
      description: 'Пока подписка действует, любое занятие можно посмотреть в удобное время.',
    },
    {
      id: 'knowledge',
      title: 'Знания и материалы',
      description: 'Мы пишем тексты о технике и философии йоги и даём задания «Йога вне коврика».',
    },
    {
      id: 'community',
      title: 'Мы в чате',
      description:
        'Пишите нам в чат любые вопросы о практике. Отвечаем каждый день с 10:00 до 22:00 по Москве.',
    },
  ],
} as const;

export interface ZoomScheduleItem {
  id: string;
  dayLabel: string;
  timeLabel: string;
  title: string;
  durationMin: number;
  /**
   * Прежний слот уровня. Сейчас здесь кто ведёт занятие:
   * отдельных уровней у практик нет.
   */
  level: 'ведёт Тим' | 'ведёт Женя';
}

/**
 * Расписание Zoom, время МСК.
 * Id стабильны: на них может опираться переход в Zoom.
 * Вторник, четверг и суббота без занятий.
 * `tue-morning-charge` — прежняя зарядка, теперь в понедельник.
 * `fri-morning` — прежнее утро пятницы, теперь вечер.
 */
export const ZOOM_SCHEDULE: readonly ZoomScheduleItem[] = [
  {
    id: 'sun-evening',
    dayLabel: 'Воскресенье',
    timeLabel: '09:30–11:00',
    title: 'Утренняя практика',
    durationMin: 90,
    level: 'ведёт Женя',
  },
  {
    id: 'tue-morning-charge',
    dayLabel: 'Понедельник',
    timeLabel: '08:00–08:30',
    title: 'Йога-зарядка',
    durationMin: 30,
    level: 'ведёт Тим',
  },
  {
    id: 'wed-evening',
    dayLabel: 'Среда',
    timeLabel: '20:00–21:00',
    title: 'Вечерняя практика',
    durationMin: 60,
    level: 'ведёт Женя',
  },
  {
    id: 'fri-morning',
    dayLabel: 'Пятница',
    timeLabel: '20:00–21:00',
    title: 'Вечерняя практика',
    durationMin: 60,
    level: 'ведёт Женя',
  },
] as const;

/** Пункт тарифа. Дни и часы по-прежнему только в ZOOM_SCHEDULE. */
export const LIVE_CLASSES_SUMMARY =
  'Живые практики в Zoom: воскресенье утром, йога-зарядка в понедельник, вечер в среду и пятницу';

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
    description: 'Записи наших регулярных занятий.',
  },
  {
    id: 'seminars',
    title: 'Семинары',
    description: 'Разборы техники.',
  },
  {
    id: 'philosophy',
    title: 'Философия',
    description: 'Разборы первоисточников.',
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
  sla: 'Отвечаем в течение 2 часов, каждый день 10:00–22:00 МСК',
  faq: [
    {
      q: 'Можно ли приходить с нуля?',
      a: 'Да. Все наши занятия подходят для любого уровня: в нашей школе у каждой асаны есть базовая форма или вариант, который подойдёт вашему уровню практики. Названия асан знать заранее не нужно. Перед первым занятием можно написать нам в чат, если что-то беспокоит, и мы подскажем, с чего начать.',
    },
    {
      q: 'Какую йогу вы преподаёте?',
      a: 'Классическую хатха-йогу школы Патанджали, так, как нас учили наши учителя. В практике много внимания к дыханию, а в асанах мы стоим спокойно и устойчиво.',
    },
    {
      q: 'Что, если я пропущу эфир?',
      a: 'Запись появится в кабинете, и пока подписка действует, по ней можно позаниматься в любое время.',
    },
    {
      q: 'Как попасть на занятие в Zoom?',
      a: 'В кабинете нажмите «Войти в занятие». Ссылка есть только у участников клуба, поэтому в открытые чаты мы её не выкладываем.',
    },
    {
      q: 'Когда откроется доступ после оплаты?',
      a: 'Обычно через несколько минут. Если кабинет ещё закрыт, напишите нам в Telegram, и мы включим доступ вручную в течение двух часов (с 10:00 до 22:00 по Москве).',
    },
    {
      q: 'Как продлить подписку?',
      a: 'После окончания подписки доступ сохраняется ещё 72 часа, за это время её можно продлить без перерыва. Для продления просто снова выберите тариф и оплатите.',
    },
  ],
} as const;

export const CLUB_SOCIAL_PROOF = [
  { label: 'практики в неделю', value: '4' },
  { label: 'Формат', value: 'Zoom + записи' },
  { label: 'Поддержка', value: '10:00–22:00 МСК' },
  { label: 'чтобы продлить без перерыва', value: '72 часа' },
] as const;

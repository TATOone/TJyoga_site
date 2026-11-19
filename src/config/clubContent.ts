/**
 * Утверждённый контент клуба для публичной витрины.
 * Цены синхронизированы с PRODUCTS и backend PLAN_CATALOG (копейки).
 * Сезонный тон читается из campaignAccent.ts — этот файл держит устойчивые факты.
 * Расписание Zoom — единственный источник дней и часов. Та же формулировка
 * вручную повторена в rates/index.html: это статическая страница без сборки.
 */

/** Все занятия клуба подходят любому уровню. Отдельных уровней у практик нет. */
export const ALL_LEVELS_NOTE = 'Каждое занятие подходит для любого уровня';

export const CLUB_STRUCTURE = {
  title: 'Что входит в клуб',
  pillars: [
    {
      id: 'live',
      title: 'Живые практики',
      description: `Четыре раза в неделю в Zoom. Классическая хатха. ${ALL_LEVELS_NOTE}.`,
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

export interface ZoomScheduleItem {
  id: string;
  dayLabel: string;
  timeLabel: string;
  title: string;
  durationMin: number;
  /** Короткая йога-зарядка, не полная практика. */
  warmup?: boolean;
  /** Кто ведёт, если это зафиксировано. */
  instructor?: string;
}

/**
 * Пояс занятий. Сейчас совпадает с Москвой (UTC+3, без перевода часов),
 * поэтому на витрине рядом с часами остаётся привычное «МСК».
 */
export const CLUB_SCHEDULE_TIME_ZONE = 'Europe/Minsk';

export const CLUB_SCHEDULE_TIME_NOTE = 'Время по Минску (совпадает с Москвой).';

export const CLUB_SCHEDULE_TIME_SUFFIX = 'МСК';

/** Расписание Zoom. Ссылка на комнату хранится только на backend. Вторник, четверг и суббота — без занятий. */
export const ZOOM_SCHEDULE: readonly ZoomScheduleItem[] = [
  {
    id: 'sun-practice',
    dayLabel: 'Воскресенье',
    timeLabel: '09:30–11:00',
    title: 'Хатха-практика',
    durationMin: 90,
  },
  {
    id: 'mon-charge',
    dayLabel: 'Понедельник',
    timeLabel: '08:00–08:30',
    title: 'Йога-зарядка',
    durationMin: 30,
    warmup: true,
    instructor: 'Тим',
  },
  {
    id: 'wed-evening',
    dayLabel: 'Среда',
    timeLabel: '20:00–21:00',
    title: 'Вечерняя практика и восстановление',
    durationMin: 60,
  },
  {
    id: 'fri-evening',
    dayLabel: 'Пятница',
    timeLabel: '20:00–21:00',
    title: 'Хатха-практика',
    durationMin: 60,
    instructor: 'Женя',
  },
] as const;

const DAY_NOMINATIVE: Record<string, string> = {
  Воскресенье: 'воскресенье',
  Понедельник: 'понедельник',
  Вторник: 'вторник',
  Среда: 'среда',
  Четверг: 'четверг',
  Пятница: 'пятница',
  Суббота: 'суббота',
};

const DAY_ACCUSATIVE: Record<string, string> = {
  Воскресенье: 'воскресенье',
  Понедельник: 'понедельник',
  Вторник: 'вторник',
  Среда: 'среду',
  Четверг: 'четверг',
  Пятница: 'пятницу',
  Суббота: 'субботу',
};

const describeLiveClass = (item: ZoomScheduleItem): string => {
  const lead = item.instructor ? ` (ведёт ${item.instructor})` : '';
  if (item.warmup) {
    const day = DAY_ACCUSATIVE[item.dayLabel] ?? item.dayLabel.toLowerCase();
    return `${item.title.toLowerCase()} в ${day} ${item.timeLabel}${lead}`;
  }
  const day = DAY_NOMINATIVE[item.dayLabel] ?? item.dayLabel.toLowerCase();
  return `${day} ${item.timeLabel}${lead}`;
};

const joinWithAnd = (parts: readonly string[]): string => {
  if (parts.length <= 1) {
    return parts[0] ?? '';
  }
  const head = parts.slice(0, -1).join(', ');
  return `${head} и ${parts[parts.length - 1]}`;
};

/** Дни и часы одной фразой, без названия продукта. */
export const LIVE_CLASSES_WHEN = joinWithAnd(ZOOM_SCHEDULE.map(describeLiveClass));

export const LIVE_CLASSES_SUMMARY = `Живые практики в Zoom: ${LIVE_CLASSES_WHEN}`;

export const formatScheduleLine = (item: ZoomScheduleItem): string => {
  const who = item.instructor ? ` · ведёт ${item.instructor}` : '';
  return `${item.dayLabel} · ${item.timeLabel} ${CLUB_SCHEDULE_TIME_SUFFIX} · ${item.durationMin} мин${who}`;
};

export const formatNextSessionLead = (item: ZoomScheduleItem): string => {
  const who = item.instructor ? `, ведёт ${item.instructor}` : '';
  return `${item.dayLabel}, ${item.timeLabel} ${CLUB_SCHEDULE_TIME_SUFFIX} - ${item.title}${who}`;
};

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
      a: `Да. ${ALL_LEVELS_NOTE}. Можно приходить с нуля. Перед первым эфиром можно написать в чат, что беспокоит в теле и уме.`,
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

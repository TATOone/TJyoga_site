import type { ArticleCategoryId, VideoCategoryId } from './clubContent';

export interface SeedVideo {
  id: string;
  kinescopeId: string;
  title: string;
  description: string;
  category: VideoCategoryId;
  accessLevel: 'club_active' | 'public';
  durationMin: number;
  publishedAt: string;
}

export interface SeedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: ArticleCategoryId;
  access: 'public' | 'club';
  publishedAt: string;
  updatedAt: string;
}

/** Демо-контент клуба (MVP). Kinescope IDs — плейсхолдеры до заполнения в админке. */
export const SEED_VIDEOS: readonly SeedVideo[] = [
  {
    id: 'vid-practice-1',
    kinescopeId: 'demo-practice-morning',
    title: 'Утренняя хатха: мягкий старт',
    description: '60 минут практики для пробуждения тела и внимания.',
    category: 'practices',
    accessLevel: 'club_active',
    durationMin: 60,
    publishedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 'vid-practice-2',
    kinescopeId: 'demo-practice-evening',
    title: 'Вечернее восстановление',
    description: 'Практика на снятие напряжения и подготовку ко сну.',
    category: 'practices',
    accessLevel: 'club_active',
    durationMin: 75,
    publishedAt: '2026-06-05T19:30:00Z',
  },
  {
    id: 'vid-seminar-1',
    kinescopeId: 'demo-seminar-alignment',
    title: 'Семинар: выравнивание в асанах',
    description: 'Разбор ключевых точек внимания в базовых асанах.',
    category: 'seminars',
    accessLevel: 'club_active',
    durationMin: 90,
    publishedAt: '2026-06-08T11:00:00Z',
  },
  {
    id: 'vid-philosophy-1',
    kinescopeId: 'demo-philosophy-yoga-sutra',
    title: 'Йога-сутры: введение',
    description: 'Короткий разбор базовых понятий из первоисточников.',
    category: 'philosophy',
    accessLevel: 'club_active',
    durationMin: 45,
    publishedAt: '2026-06-10T12:00:00Z',
  },
] as const;

export const SEED_ARTICLES: readonly SeedArticle[] = [
  {
    id: 'art-open-1',
    slug: 'kak-nachat-praktikovat',
    title: 'Как начать практиковать хатха-йогу дома',
    excerpt: 'Простые шаги для регулярной практики без перегруза.',
    body: 'Регулярность важнее интенсивности. Начните с коротких сессий 3 раза в неделю, следите за дыханием и не форсируйте амплитуду. Если есть травмы — проконсультируйтесь с врачом и сообщите преподавателю.',
    category: 'open',
    access: 'public',
    publishedAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'art-tech-1',
    slug: 'dyhanie-v-asane',
    title: 'Дыхание в асане: базовые ориентиры',
    excerpt: 'Клубный материал о связи дыхания и устойчивости в практике.',
    body: 'Дыхание — якорь внимания. В статических положениях сохраняйте ровный ритм, не задерживайте воздух на усилиях. Если дыхание сбивается — уменьшите нагрузку и вернитесь к комфортной амплитуде.',
    category: 'technique',
    access: 'club',
    publishedAt: '2026-06-02T10:00:00Z',
    updatedAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'art-life-1',
    slug: 'yoga-vne-kovrika',
    title: 'Йога вне коврика: внимание в быту',
    excerpt: 'Как перенести качество практики в повседневные действия.',
    body: 'Практика не заканчивается после «намасте». Замечайте осанку за столом, темп ходьбы и реакцию на стресс. Короткие паузы осознанности в течение дня закрепляют эффект занятий.',
    category: 'lifestyle',
    access: 'club',
    publishedAt: '2026-06-07T10:00:00Z',
    updatedAt: '2026-06-07T10:00:00Z',
  },
  {
    id: 'art-news-1',
    slug: 'raspisanie-iyun',
    title: 'Расписание клуба: ориентиры июня',
    excerpt: 'Ближайшие практики и семинары для участников клуба.',
    body: 'Три регулярные Zoom-практики в неделю плюс субботний углублённый блок. Записи появляются в библиотеке в течение суток после эфира. При вопросах пишите в поддержку до 22:00 МСК.',
    category: 'club-news',
    access: 'club',
    publishedAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-01T09:00:00Z',
  },
] as const;

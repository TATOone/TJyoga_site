import type { ArticleCategoryId } from './clubContent';

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

export const SEED_ARTICLES: readonly SeedArticle[] = [
  {
    id: 'art-open-1',
    slug: 'kak-nachat-praktikovat',
    title: 'Как начать практиковать хатха-йогу дома',
    excerpt: 'Регулярность важнее количества. Можно начать коротко и спокойно.',
    body: 'Регулярность важнее количества. Начните с коротких практик 3 раза в неделю, следите за дыханием и не торопите тело. Если есть травмы - проконсультируйтесь с врачом и скажите нам.',
    category: 'open',
    access: 'public',
    publishedAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'art-tech-1',
    slug: 'dyhanie-v-asane',
    title: 'Дыхание в асане: базовые ориентиры',
    excerpt: 'Дыхание и устойчивость в практике.',
    body: 'Дыхание - якорь внимания. В статических положениях сохраняйте ровный ритм, не задерживайте воздух на усилиях. Если дыхание сбивается - уменьшите нагрузку и вернитесь к комфортной амплитуде.',
    category: 'technique',
    access: 'club',
    publishedAt: '2026-06-02T10:00:00Z',
    updatedAt: '2026-06-02T10:00:00Z',
  },
  {
    id: 'art-life-1',
    slug: 'yoga-vne-kovrika',
    title: 'Йога вне коврика: внимание в быту',
    excerpt: 'Внимание в обычном дне, когда коврик уже свёрнут.',
    body: 'Практика не заканчивается, когда свернули коврик. Замечайте осанку за столом, темп ходьбы и реакцию на спешку. Короткие паузы в течение дня закрепляют то, что вы делаете на занятии.',
    category: 'lifestyle',
    access: 'club',
    publishedAt: '2026-06-07T10:00:00Z',
    updatedAt: '2026-06-07T10:00:00Z',
  },
  {
    id: 'art-news-1',
    slug: 'raspisanie-iyun',
    title: 'Расписание клуба',
    excerpt: 'Как устроены живые практики и записи.',
    body: 'Четыре регулярные Zoom-практики в неделю, включая воскресный вечерний блок. Записи появляются в библиотеке в течение суток после эфира. Вопросы можно писать нам до 22:00 МСК.',
    category: 'club-news',
    access: 'club',
    publishedAt: '2026-06-01T09:00:00Z',
    updatedAt: '2026-06-01T09:00:00Z',
  },
] as const;

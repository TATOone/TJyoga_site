import { IMAGES } from './images';

export interface TeacherProfile {
  id: 'zhenya' | 'tim';
  shortName: string;
  displayName: string;
  schemaName: string;
  role: string;
  facts: string;
}

export const TEACHERS: readonly TeacherProfile[] = [
  {
    id: 'zhenya',
    shortName: 'Женя',
    displayName: 'Женя Старовойтова',
    schemaName: 'Старовойтова Евгения',
    role: 'основной преподаватель',
    facts: '10+ лет личной практики, 5+ лет преподавания',
  },
  {
    id: 'tim',
    shortName: 'Тим',
    displayName: 'Тим',
    schemaName: 'Аблаев Тимур',
    role: 'ассистент преподавателя',
    facts: '5+ лет практики, вдохновитель и поддержка',
  },
] as const;

export const TEACHERS_HEADLINE = 'Женя и Тим';

/** Короткий факт с /about — без нового продающего текста. */
export const TEACHERS_TEASER =
  'Классическая хатха школы Патанджали. Женя — основной преподаватель, Тим — ассистент.';

export const TEACHERS_PHOTO = {
  src: IMAGES.about.teachers,
  alt: IMAGES.about.alt,
} as const;

export const TEACHERS_ABOUT_PATH = '/about';
export const TEACHERS_ABOUT_LABEL = 'О нас';

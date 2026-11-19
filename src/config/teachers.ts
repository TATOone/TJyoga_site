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
    facts: 'практикует больше 10 лет, преподаёт больше 5 лет',
  },
  {
    id: 'tim',
    shortName: 'Тим',
    displayName: 'Тим',
    schemaName: 'Аблаев Тимур',
    role: 'помощник преподавателя',
    facts: 'практикует больше 5 лет, ведёт йога-зарядку по понедельникам',
  },
] as const;

export const TEACHERS_HEADLINE = 'Тим и Женя';

/** Короткий факт с /about - без нового продающего текста. */
export const TEACHERS_TEASER =
  'Классическая хатха-йога школы Патанджали. Практики в клубе ведёт Женя, а йога-зарядку по понедельникам - Тим.';

export const TEACHERS_PHOTO = {
  src: IMAGES.about.teachers,
  alt: IMAGES.about.alt,
} as const;

export const TEACHERS_ABOUT_PATH = '/about';
export const TEACHERS_ABOUT_LABEL = 'О нас';

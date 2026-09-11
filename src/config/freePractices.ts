/**
 * Открытые практики с YouTube-канала TJ Yoga.
 * Заголовки можно править здесь — на странице они выводятся как подписи к роликам.
 */

export const FREE_PAGE_PATH = '/free';
export const FREE_CTA_LABEL = 'Попробовать бесплатно';

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@TJyoga_club';
export const YOUTUBE_CHANNEL_HANDLE = '@TJyoga_club';

export interface FreePracticeVideo {
  id: string;
  title: string;
}

export const FREE_PRACTICE_VIDEOS: readonly FreePracticeVideo[] = [
  { id: 'UFyHLtLSQ6w', title: 'Йога утро 60 минут' },
  { id: 'WOAslQXbnYo', title: 'Йога вечер 60 минут' },
  { id: 'U0ZGlseSFK0', title: 'Йога утро 20 минут' },
];

export const youtubeThumbnailUrl = (videoId: string): string =>
  `https://i.ytimg.com/vi/${encodeURIComponent(videoId)}/hqdefault.jpg`;

export const youtubePrivacyEmbedUrl = (videoId: string): string => {
  const params = new URLSearchParams({
    autoplay: '1',
    rel: '0',
    playsinline: '1',
  });
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?${params.toString()}`;
};

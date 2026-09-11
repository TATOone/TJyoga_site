import React, { useCallback, useState } from 'react';
import {
  youtubePrivacyEmbedUrl,
  youtubeThumbnailUrl,
  type FreePracticeVideo,
} from '../config/freePractices';
import { analyticsEvents } from '../utils/analytics';

interface YouTubeLiteEmbedProps {
  video: FreePracticeVideo;
}

const YouTubePlayIcon: React.FC = () => (
  <svg viewBox="0 0 68 48" width="68" height="48" aria-hidden="true" focusable="false">
    <path
      d="M66.52 7.74c-.78-2.93-2.49-5.41-5.42-6.19C55.79.13 34 0 34 0S12.21.13 6.9 1.55C3.97 2.33 2.27 4.81 1.48 7.74.06 13.05 0 24 0 24s.06 10.95 1.48 16.26c.78 2.93 2.49 5.41 5.42 6.19C12.21 47.87 34 48 34 48s21.79-.13 27.1-1.55c2.93-.78 4.64-3.26 5.42-6.19C67.94 34.95 68 24 68 24s-.06-10.95-1.48-16.26z"
      fill="#FF0000"
    />
    <path d="M45 24 27 14v20z" fill="#fff" />
  </svg>
);

/**
 * Превью + кнопка Play. iframe с youtube-nocookie подключается только после клика.
 */
const YouTubeLiteEmbed: React.FC<YouTubeLiteEmbedProps> = ({ video }) => {
  const [isActive, setIsActive] = useState(false);

  const activate = useCallback(() => {
    setIsActive(true);
    analyticsEvents.ctaClick(`Смотреть: ${video.title}`, 'free_practices');
  }, [video.title]);

  return (
    <div className="relative aspect-video w-full min-w-0 overflow-hidden rounded-2xl bg-dark-brown">
      {isActive ? (
        <iframe
          title={video.title}
          src={youtubePrivacyEmbedUrl(video.id)}
          className="absolute inset-0 h-full w-full max-w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          onClick={activate}
          className="group absolute inset-0 h-full w-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2"
          aria-label={`Смотреть на YouTube: ${video.title}`}
        >
          <img
            src={youtubeThumbnailUrl(video.id)}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            width={480}
            height={360}
          />
          <span className="absolute inset-0 bg-dark-brown/20 transition-colors group-hover:bg-dark-brown/10" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-110">
            <YouTubePlayIcon />
          </span>
        </button>
      )}
    </div>
  );
};

export default YouTubeLiteEmbed;

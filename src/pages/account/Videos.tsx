import React from 'react';
import { VIDEO_CATEGORIES } from '../../config/clubContent';
import { apiClient, ApiClientError, type VideoListItem } from '../../lib/apiClient';
import { loadAuthSession } from '../../lib/authStorage';
import { analyticsEvents } from '../../utils/analytics';
import KinescopePlayer from '../../components/KinescopePlayer';

const Videos: React.FC = () => {
  const [videos, setVideos] = React.useState<VideoListItem[]>([]);
  const [activeVideo, setActiveVideo] = React.useState<VideoListItem | null>(null);
  const [category, setCategory] = React.useState<string>('all');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const session = loadAuthSession();
      if (!session) {
        setError('Требуется вход');
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.listVideos(session.accessToken);
        setVideos(data.videos);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Не удалось загрузить видео');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filtered =
    category === 'all' ? videos : videos.filter((video) => video.category === category);

  if (loading) {
    return <p className="text-gray-brown">Загрузка видео...</p>;
  }

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-red-700">{error}</p>
        <a href="/club/rates" className="text-terracotta hover:underline">
          Оформить подписку
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-brown mb-2">Видеозаписи</h1>
        <p className="text-gray-brown">Практики и семинары с проверкой доступа по подписке.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`min-h-[40px] px-3 rounded-lg border ${
            category === 'all' ? 'bg-terracotta text-light-text' : 'bg-light-text border-light-sandy'
          }`}
        >
          Все
        </button>
        {VIDEO_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`min-h-[40px] px-3 rounded-lg border ${
              category === item.id
                ? 'bg-terracotta text-light-text'
                : 'bg-light-text border-light-sandy'
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      {activeVideo ? (
        <section className="bg-light-text border border-light-sandy rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-dark-brown">{activeVideo.title}</h2>
            <button
              type="button"
              className="text-sm text-terracotta"
              onClick={() => setActiveVideo(null)}
            >
              Закрыть
            </button>
          </div>
          <KinescopePlayer
            videoId={activeVideo.id}
            kinescopeId={activeVideo.kinescope_id}
            title={activeVideo.title}
          />
          <p className="text-sm text-gray-brown">{activeVideo.description}</p>
        </section>
      ) : null}

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((video) => (
          <li key={video.id} className="bg-light-text border border-light-sandy rounded-2xl p-5">
            <p className="text-xs uppercase tracking-wide text-terracotta mb-1">{video.category}</p>
            <h3 className="font-semibold text-dark-brown mb-2">{video.title}</h3>
            <p className="text-sm text-gray-brown mb-4">{video.description}</p>
            <button
              type="button"
              className="min-h-[44px] px-4 rounded-lg bg-olive-green text-light-text"
              onClick={() => {
                setActiveVideo(video);
                analyticsEvents.ctaClick('video_open', 'account_videos');
              }}
            >
              Смотреть · {video.duration_min} мин
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Videos;

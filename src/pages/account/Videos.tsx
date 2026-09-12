import React from 'react';
import KinescopePlayer from '../../components/KinescopePlayer';
import { EmptyState, SectionHeader } from '../../components/ui';
import { VIDEO_CATEGORIES } from '../../config/clubContent';
import { FUNNEL_RATES_PATH } from '../../config/funnel';
import { apiClient, ApiClientError, type VideoListItem } from '../../lib/apiClient';
import { loadAuthSession } from '../../lib/authStorage';
import { analyticsEvents } from '../../utils/analytics';

const Videos: React.FC = () => {
  const [videos, setVideos] = React.useState<VideoListItem[]>([]);
  const [activeVideo, setActiveVideo] = React.useState<VideoListItem | null>(null);
  const [category, setCategory] = React.useState<string>('all');
  const [error, setError] = React.useState<string | null>(null);
  const [errorCode, setErrorCode] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const session = loadAuthSession();
      if (!session) {
        setError('Чтобы смотреть записи, войдите в кабинет.');
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.listVideos(session.accessToken);
        setVideos(data.videos);
      } catch (err) {
        if (err instanceof ApiClientError) {
          setErrorCode(err.code);
          setError(err.message);
        } else {
          setError('Не удалось загрузить видео. Попробуйте обновить страницу.');
        }
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filtered =
    category === 'all' ? videos : videos.filter((video) => video.category === category);

  const openVideo = (video: VideoListItem) => {
    setActiveVideo(video);
    if (!sessionStorage.getItem('account_first_video')) {
      sessionStorage.setItem('account_first_video', '1');
      analyticsEvents.ctaClick('first_video', 'account_videos');
    }
    analyticsEvents.ctaClick('video_open', 'account_videos');
  };

  if (loading) {
    return <p className="text-gray-brown">Загрузка видео...</p>;
  }

  if (errorCode === 'SUBSCRIPTION_REQUIRED') {
    return (
      <div className="space-y-6">
        <SectionHeader
          eyebrow="Кабинет"
          title="Видеозаписи"
          subtitle="Практики и семинары откроются, когда подписка будет активна."
        />
        <EmptyState
          title="Записи пока закрыты"
          description="Оформите или продлите тариф — и библиотека откроется. Пока подписка не активна, ссылки на видео не показываем."
          actionLabel="Выбрать тариф"
          actionTo={FUNNEL_RATES_PATH}
          onActionClick={() => analyticsEvents.ctaClick('renew', 'account_videos')}
        />
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Не удалось открыть записи"
        description={error}
        actionLabel="В поддержку"
        actionTo="/account/support"
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Кабинет"
        title="Видеозаписи"
        subtitle="Практики и семинары с проверкой доступа по подписке."
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`min-h-[40px] rounded-lg border px-3 ${
            category === 'all' ? 'bg-terracotta text-light-text' : 'border-light-sandy bg-light-text'
          }`}
        >
          Все
        </button>
        {VIDEO_CATEGORIES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setCategory(item.id)}
            className={`min-h-[40px] rounded-lg border px-3 ${
              category === item.id
                ? 'bg-terracotta text-light-text'
                : 'border-light-sandy bg-light-text'
            }`}
          >
            {item.title}
          </button>
        ))}
      </div>

      {activeVideo ? (
        <section className="space-y-3 rounded-card border border-light-sandy bg-light-text p-4 shadow-soft">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-dark-brown">{activeVideo.title}</h2>
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

      {videos.length === 0 ? (
        <EmptyState
          title="Записей пока нет"
          description="Как только эфир закончится, запись появится здесь. Ближайшую практику можно открыть из обзора."
          actionLabel="К обзору"
          actionTo="/account"
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="В этой категории пусто"
          description="Попробуйте другую категорию или откройте все записи."
          actionLabel="Показать все"
          onAction={() => setCategory('all')}
        />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((video) => (
            <li key={video.id} className="rounded-card border border-light-sandy bg-light-text p-5 shadow-soft">
              <p className="mb-1 text-xs uppercase tracking-wide text-terracotta">{video.category}</p>
              <h3 className="mb-2 font-semibold text-dark-brown">{video.title}</h3>
              <p className="mb-4 text-sm text-gray-brown">{video.description}</p>
              <button
                type="button"
                className="min-h-[44px] rounded-lg bg-olive-green px-4 text-light-text"
                onClick={() => openVideo(video)}
              >
                Смотреть · {video.duration_min} мин
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Videos;

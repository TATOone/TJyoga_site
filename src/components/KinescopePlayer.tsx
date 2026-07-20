import React from 'react';
import { apiClient, ApiClientError } from '../lib/apiClient';
import { loadAuthSession } from '../lib/authStorage';
import { analyticsEvents } from '../utils/analytics';

interface KinescopePlayerProps {
  videoId: string;
  kinescopeId: string;
  title: string;
}

/**
 * MVP-плеер: доступ проверяется через GET /content/videos/:id.
 * Kinescope Authorization Backend (server-to-server) вызывается самим Kinescope
 * с shared secret — не из браузера.
 */
const KinescopePlayer: React.FC<KinescopePlayerProps> = ({ videoId, kinescopeId, title }) => {
  const [allowed, setAllowed] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const authorize = async () => {
      const session = loadAuthSession();
      if (!session) {
        setError('Требуется авторизация');
        setLoading(false);
        return;
      }

      try {
        await apiClient.getVideo(videoId, session.accessToken);
        setAllowed(true);
        analyticsEvents.ctaClick('video_play_authorized', 'kinescope_player');
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Доступ к видео закрыт');
        analyticsEvents.ctaClick('video_play_denied', 'kinescope_player');
      } finally {
        setLoading(false);
      }
    };

    void authorize();
  }, [kinescopeId, videoId]);

  if (loading) {
    return <p className="text-gray-brown">Проверяем доступ...</p>;
  }

  if (error || !allowed) {
    return <p className="text-red-700">{error ?? 'Доступ запрещён'}</p>;
  }

  const isDemo = kinescopeId.startsWith('demo-');

  if (isDemo) {
    return (
      <div className="aspect-video w-full rounded-xl bg-dark-brown/90 text-light-text flex items-center justify-center p-6 text-center">
        <div>
          <p className="font-semibold mb-2">{title}</p>
          <p className="text-sm opacity-80">
            Демо-режим: подставьте реальный Kinescope ID в админке. Backend уже проверяет подписку
            перед показом плеера.
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      title={title}
      src={`https://kinescope.io/embed/${encodeURIComponent(kinescopeId)}`}
      className="aspect-video w-full rounded-xl border-0"
      allow="autoplay; fullscreen; picture-in-picture; encrypted-media; gyroscope; accelerometer; clipboard-write;"
      allowFullScreen
    />
  );
};

export default KinescopePlayer;

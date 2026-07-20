import React from 'react';
import { Link } from 'react-router-dom';
import { ZOOM_SCHEDULE } from '../../config/clubContent';
import { apiClient, ApiClientError, type MeResponse } from '../../lib/apiClient';
import { loadAuthSession } from '../../lib/authStorage';
import { analyticsEvents } from '../../utils/analytics';

const Dashboard: React.FC = () => {
  const [me, setMe] = React.useState<MeResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      const session = loadAuthSession();
      if (!session) {
        setError('Сессия не найдена');
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getMe(session.accessToken);
        setMe(data);
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Не удалось загрузить кабинет');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const subscriptionActive =
    me?.subscription?.status === 'active' || me?.subscription?.status === 'grace';

  const openZoom = async () => {
    const session = loadAuthSession();
    if (!session) {
      return;
    }
    try {
      analyticsEvents.ctaClick('zoom_enter', 'account_dashboard');
      const data = await apiClient.getZoomRedirect(session.accessToken, 'main');
      window.open(data.redirect_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Не удалось открыть Zoom');
    }
  };

  if (loading) {
    return <p className="text-gray-brown">Загрузка кабинета...</p>;
  }

  if (error) {
    return <p className="text-red-700">{error}</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-brown mb-2">Личный кабинет</h1>
        <p className="text-gray-brown mb-2">
          {me?.user?.email ? `Вы вошли как ${me.user.email}` : 'Добро пожаловать в клуб'}
        </p>
      </div>

      <section className="bg-light-text border border-light-sandy rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-dark-brown mb-2">Подписка</h2>
        {me?.subscription ? (
          <div className="space-y-1 text-dark-brown">
            <p>
              Статус:{' '}
              <span className="font-semibold text-olive-green">{me.subscription.status}</span>
            </p>
            <p>Тариф: {me.subscription.plan_code}</p>
            <p>Доступ до: {new Date(me.subscription.ends_at).toLocaleString('ru-RU')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-brown">Активной подписки нет.</p>
            <Link
              to="/club/rates"
              className="inline-flex min-h-[44px] items-center px-4 rounded-lg bg-terracotta text-light-text"
            >
              Выбрать тариф
            </Link>
          </div>
        )}
      </section>

      <section className="bg-light-text border border-light-sandy rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-dark-brown mb-2">Ближайшая практика</h2>
        <p className="text-dark-brown mb-1">{ZOOM_SCHEDULE[0]?.title}</p>
        <p className="text-sm text-gray-brown mb-4">
          {ZOOM_SCHEDULE[0]?.dayLabel} · {ZOOM_SCHEDULE[0]?.timeLabel} МСК
        </p>
        <button
          type="button"
          onClick={openZoom}
          disabled={!subscriptionActive}
          className="min-h-[44px] px-5 rounded-lg bg-olive-green text-light-text disabled:opacity-50"
        >
          Войти в занятие
        </button>
        {!subscriptionActive ? (
          <p className="text-sm text-gray-brown mt-2">Кнопка доступна при активной подписке.</p>
        ) : (
          <p className="text-sm text-gray-brown mt-2">
            Ссылка открывается через защищённый redirect и не отображается в интерфейсе.
          </p>
        )}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/account/videos"
          className="bg-cream border border-light-sandy rounded-2xl p-5 hover:border-terracotta transition-colors"
        >
          <h3 className="font-semibold text-terracotta mb-1">Записи</h3>
          <p className="text-sm text-gray-brown">Библиотека практик и семинаров Kinescope</p>
        </Link>
        <Link
          to="/account/knowledge"
          className="rounded-card border border-light-sandy bg-cream p-5 transition-colors hover:border-terracotta"
        >
          <h3 className="mb-1 font-semibold text-terracotta">Знания</h3>
          <p className="text-sm text-gray-brown">Клубные материалы TJ club</p>
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;

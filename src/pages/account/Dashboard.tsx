import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, EmptyState, SectionHeader, StatusBadge } from '../../components/ui';
import { FUNNEL_RATES_PATH } from '../../config/funnel';
import { apiClient, ApiClientError, type MeResponse } from '../../lib/apiClient';
import { loadAuthSession } from '../../lib/authStorage';
import { getNextZoomSession } from '../../lib/nextZoomSession';
import {
  formatAccountDate,
  getPlanLabel,
  getSubscriptionStatusView,
  hasPracticeAccess,
} from '../../lib/subscriptionDisplay';
import { analyticsEvents } from '../../utils/analytics';

const Dashboard: React.FC = () => {
  const [me, setMe] = React.useState<MeResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [zoomError, setZoomError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();
  const nextSession = React.useMemo(() => getNextZoomSession(), []);

  React.useEffect(() => {
    const load = async () => {
      const session = loadAuthSession();
      if (!session) {
        setError('Сессия не найдена. Войдите снова, чтобы открыть кабинет.');
        setLoading(false);
        return;
      }

      try {
        const data = await apiClient.getMe(session.accessToken);
        setMe(data);
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : 'Не удалось загрузить кабинет. Обновите страницу или напишите в поддержку.',
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const subscriptionActive = hasPracticeAccess(me?.subscription);
  const statusView = me?.subscription ? getSubscriptionStatusView(me.subscription.status) : null;

  const openZoom = async () => {
    const session = loadAuthSession();
    if (!session) {
      return;
    }
    setZoomError(null);
    try {
      analyticsEvents.ctaClick('zoom_enter', 'account_dashboard');
      const data = await apiClient.getZoomRedirect(session.accessToken, 'main');
      window.open(data.redirect_url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setZoomError(
        err instanceof ApiClientError
          ? err.message
          : 'Не удалось открыть Zoom. Попробуйте ещё раз или напишите в поддержку.',
      );
    }
  };

  if (loading) {
    return <p className="text-gray-brown">Загрузка кабинета...</p>;
  }

  if (error) {
    return (
      <EmptyState
        title="Кабинет сейчас недоступен"
        description={error}
        actionLabel="Написать в поддержку"
        actionTo="/account/support"
      />
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Кабинет"
        title="Что делать сейчас"
        subtitle={
          me?.user?.email
            ? `Вы вошли как ${me.user.email}`
            : 'Zoom, записи и статус подписки — в одном месте.'
        }
      />

      <section className="rounded-card border border-light-sandy bg-light-text p-6 shadow-soft">
        {subscriptionActive ? (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-dark-brown">Открыть практику</h2>
              <p className="mt-1 text-sm text-gray-brown">
                {nextSession
                  ? `Ближайшее занятие: ${nextSession.dayLabel}, ${nextSession.timeLabel} МСК — ${nextSession.title}.`
                  : 'Живое занятие открывается через защищённый переход.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={() => void openZoom()}>Войти в Zoom</Button>
              <Link
                to="/account/videos"
                className="inline-flex min-h-touch items-center justify-center rounded-soft border border-terracotta px-5 font-medium text-terracotta transition-colors hover:bg-cream"
                onClick={() => analyticsEvents.ctaClick('first_video', 'account_dashboard')}
              >
                Смотреть записи
              </Link>
            </div>
            {zoomError ? (
              <p className="text-sm text-danger" role="alert">
                {zoomError}
              </p>
            ) : (
              <p className="text-sm text-gray-brown">
                Ссылка на комнату не показывается в кабинете — только безопасный переход.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-dark-brown">Сначала тариф</h2>
              <p className="mt-1 text-sm text-gray-brown">
                Без активной подписки Zoom и записи закрыты. После оплаты кабинет откроет практику сразу.
              </p>
            </div>
            <Button
              onClick={() => {
                analyticsEvents.ctaClick('renew', 'account_dashboard');
                navigate(FUNNEL_RATES_PATH);
              }}
            >
              Выбрать тариф
            </Button>
          </div>
        )}
      </section>

      {nextSession ? (
        <section className="rounded-card border border-light-sandy bg-cream p-6">
          <h2 className="font-display text-xl font-semibold text-dark-brown">Ближайшее по расписанию</h2>
          <p className="mt-2 text-dark-brown">{nextSession.title}</p>
          <p className="mt-1 text-sm text-gray-brown">
            {nextSession.dayLabel} · {nextSession.timeLabel} МСК · {nextSession.durationMin} мин ·{' '}
            {nextSession.level}
          </p>
        </section>
      ) : null}

      <section className="rounded-card border border-light-sandy bg-light-text p-6 shadow-soft">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl font-semibold text-dark-brown">Подписка</h2>
          {statusView ? <StatusBadge label={statusView.label} tone={statusView.tone} /> : null}
        </div>
        {me?.subscription && statusView ? (
          <div className="space-y-2 text-dark-brown">
            <p>Тариф: {getPlanLabel(me.subscription.plan_code)}</p>
            <p>Доступ до: {formatAccountDate(me.subscription.ends_at)}</p>
            {me.subscription.status === 'grace' && statusView.description ? (
              <p className="text-sm text-gray-brown">{statusView.description}</p>
            ) : null}
            {me.subscription.status === 'grace' ? (
              <Link
                to={FUNNEL_RATES_PATH}
                className="inline-flex min-h-touch items-center font-medium text-terracotta hover:underline"
                onClick={() => analyticsEvents.ctaClick('renew', 'account_dashboard')}
              >
                Продлить доступ
              </Link>
            ) : null}
          </div>
        ) : (
          <p className="text-gray-brown">Активной подписки нет — Zoom и записи откроются после оплаты.</p>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          to="/account/videos"
          className="rounded-card border border-light-sandy bg-light-text p-5 shadow-soft transition-colors hover:border-terracotta"
        >
          <h3 className="mb-1 font-semibold text-terracotta">Записи</h3>
          <p className="text-sm text-gray-brown">Практики и семинары, если пропустили эфир</p>
        </Link>
        <Link
          to="/account/knowledge"
          className="rounded-card border border-light-sandy bg-light-text p-5 shadow-soft transition-colors hover:border-terracotta"
        >
          <h3 className="mb-1 font-semibold text-terracotta">Знания</h3>
          <p className="text-sm text-gray-brown">Клубные материалы рядом с практикой</p>
        </Link>
      </section>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, EmptyState, SectionHeader, StatusBadge } from '../../components/ui';
import { FUNNEL_RATES_PATH } from '../../config/funnel';
import { apiClient, ApiClientError, type MeResponse } from '../../lib/apiClient';
import { loadAuthSession } from '../../lib/authStorage';
import {
  formatAccountDate,
  getPlanLabel,
  getSubscriptionStatusView,
} from '../../lib/subscriptionDisplay';
import { analyticsEvents } from '../../utils/analytics';

const Subscription: React.FC = () => {
  const [me, setMe] = React.useState<MeResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const load = async () => {
      const session = loadAuthSession();
      if (!session) {
        setError('Чтобы увидеть статус подписки, войдите в кабинет.');
        return;
      }
      try {
        setMe(await apiClient.getMe(session.accessToken));
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : 'Не удалось загрузить подписку. Обновите страницу или напишите в поддержку.',
        );
      }
    };
    void load();
  }, []);

  if (error) {
    return (
      <EmptyState
        title="Статус подписки недоступен"
        description={error}
        actionLabel="В поддержку"
        actionTo="/account/support"
      />
    );
  }

  if (!me) {
    return <p className="text-gray-brown">Загрузка...</p>;
  }

  const statusView = me.subscription ? getSubscriptionStatusView(me.subscription.status) : null;
  const needsRenew =
    !me.subscription ||
    me.subscription.status === 'grace' ||
    me.subscription.status === 'expired' ||
    me.subscription.status === 'canceled' ||
    me.subscription.status === 'suspended';

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Кабинет"
        title="Подписка"
        subtitle="Тариф, срок доступа и как продлить вручную."
      />

      <section className="space-y-4 rounded-card border border-light-sandy bg-light-text p-6 shadow-soft">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-xl font-semibold text-dark-brown">Текущий статус</h2>
          {statusView ? <StatusBadge label={statusView.label} tone={statusView.tone} /> : null}
        </div>
        {me.subscription && statusView ? (
          <dl className="space-y-2 text-dark-brown">
            <div>
              <dt className="text-sm text-gray-brown">Тариф</dt>
              <dd className="font-medium">{getPlanLabel(me.subscription.plan_code)}</dd>
            </div>
            <div>
              <dt className="text-sm text-gray-brown">Оплаченный срок до</dt>
              <dd className="font-medium">{formatAccountDate(me.subscription.ends_at)}</dd>
            </div>
            {me.subscription.grace_ends_at ? (
              <div>
                <dt className="text-sm text-gray-brown">Доступ ещё открыт до</dt>
                <dd className="font-medium">{formatAccountDate(me.subscription.grace_ends_at)}</dd>
              </div>
            ) : null}
            {me.subscription.status === 'grace' && statusView.description ? (
              <p className="rounded-soft bg-golden-sandy/20 px-3 py-2 text-sm text-dark-brown">
                {statusView.description}
              </p>
            ) : null}
          </dl>
        ) : (
          <p className="text-gray-brown">
            Подписки нет. После оплаты здесь появятся тариф и дата окончания.
          </p>
        )}
      </section>

      <section className="space-y-3 rounded-card border border-light-sandy bg-cream p-6">
        <h2 className="font-display text-xl font-semibold text-dark-brown">
          {needsRenew ? 'Продлить доступ' : 'Продление'}
        </h2>
        <p className="text-sm text-gray-brown">
          Продление ручное: выберите тариф и оплатите снова. После подтверждения оплаты доступ
          обновится сам, без письма в поддержку.
        </p>
        <Button
          onClick={() => {
            analyticsEvents.ctaClick('renew', 'account_subscription');
            navigate(FUNNEL_RATES_PATH);
          }}
        >
          {needsRenew ? 'Продлить подписку' : 'Смотреть тарифы'}
        </Button>
      </section>
    </div>
  );
};

export default Subscription;

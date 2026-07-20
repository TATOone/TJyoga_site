import React from 'react';
import { Link } from 'react-router-dom';
import { apiClient, ApiClientError, type MeResponse } from '../../lib/apiClient';
import { loadAuthSession } from '../../lib/authStorage';

const Subscription: React.FC = () => {
  const [me, setMe] = React.useState<MeResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const session = loadAuthSession();
      if (!session) {
        setError('Требуется вход');
        return;
      }
      try {
        setMe(await apiClient.getMe(session.accessToken));
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Ошибка загрузки');
      }
    };
    void load();
  }, []);

  if (error) {
    return <p className="text-red-700">{error}</p>;
  }

  if (!me) {
    return <p className="text-gray-brown">Загрузка...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-brown mb-2">Подписка</h1>
        <p className="text-gray-brown">Статус доступа и ручное продление.</p>
      </div>
      <section className="bg-light-text border border-light-sandy rounded-2xl p-6 space-y-2">
        <h2 className="text-xl font-semibold text-dark-brown">Текущий статус</h2>
        {me.subscription ? (
          <>
            <p>Статус: {me.subscription.status}</p>
            <p>Тариф: {me.subscription.plan_code}</p>
            <p>Окончание: {new Date(me.subscription.ends_at).toLocaleString('ru-RU')}</p>
            {me.subscription.grace_ends_at ? (
              <p className="text-sm text-gray-brown">
                Grace-period до: {new Date(me.subscription.grace_ends_at).toLocaleString('ru-RU')}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-gray-brown">Подписка не активна.</p>
        )}
      </section>

      <section className="bg-cream border border-light-sandy rounded-2xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-dark-brown">Продление</h2>
        <p className="text-gray-brown text-sm">
          Продление ручное: выберите тариф и оплатите снова. После webhook доступ обновится
          автоматически.
        </p>
        <Link
          to="/club/rates"
          className="inline-flex min-h-[44px] items-center px-4 rounded-lg bg-terracotta text-light-text"
        >
          Продлить подписку
        </Link>
      </section>
    </div>
  );
};

export default Subscription;

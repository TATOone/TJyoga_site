import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import { Button, FormCard, StatusBadge } from '../components/ui';
import { apiClient, ApiClientError } from '../lib/apiClient';
import { loadAuthSession } from '../lib/authStorage';
import { usePageMeta } from '../utils/usePageMeta';

const PaymentSuccess: React.FC = () => {
  usePageMeta('paymentSuccess');
  const [searchParams] = useSearchParams();
  const orderIdFromQuery = searchParams.get('order_id');

  const [resolvedOrderId, setResolvedOrderId] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('Проверяем статус оплаты...');
  const [tone, setTone] = React.useState<'neutral' | 'success' | 'warning'>('neutral');

  React.useEffect(() => {
    const loadStatus = async () => {
      const orderId = orderIdFromQuery ?? sessionStorage.getItem('tj_yoga_last_order_id');
      setResolvedOrderId(orderId);

      if (!orderId) {
        setMessage('Не найден order_id. Если оплата прошла, доступ активируется после webhook.');
        setTone('warning');
        return;
      }

      const session = loadAuthSession();
      if (!session) {
        setMessage(
          'Оплата принята провайдером. Войдите в аккаунт, чтобы увидеть актуальный статус подписки.',
        );
        setTone('warning');
        return;
      }

      try {
        const order = await apiClient.getCheckoutOrder(orderId, session.accessToken);
        if (order.status === 'paid' || order.subscription_status === 'active') {
          setMessage('Оплата подтверждена. Доступ к клубу активирован.');
          setTone('success');
          return;
        }

        setMessage('Платёж ещё обрабатывается. Обновите страницу через минуту.');
        setTone('warning');
      } catch (error) {
        if (error instanceof ApiClientError && error.code === 'NOT_FOUND') {
          setMessage(
            'Заказ пока не синхронизирован. Если оплата прошла, доступ появится после webhook.',
          );
          setTone('warning');
          return;
        }

        setMessage('Не удалось проверить статус заказа. Напишите в поддержку, если оплата списалась.');
        setTone('warning');
      }
    };

    void loadStatus();
  }, [orderIdFromQuery]);

  return (
    <PublicPageLayout title="Оплата" subtitle="Статус вашего платежа">
      <FormCard className="text-center">
        <div className="mb-3 flex justify-center">
          <StatusBadge
            label={tone === 'success' ? 'Успешно' : tone === 'warning' ? 'В обработке' : 'Статус'}
            tone={tone === 'success' ? 'success' : 'warning'}
          />
        </div>
        <p className="text-dark-brown">{message}</p>
        {resolvedOrderId ? <p className="mt-2 text-sm text-gray-brown">Заказ: {resolvedOrderId}</p> : null}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/account">
            <Button>Перейти в кабинет</Button>
          </Link>
          <Link to="/club">
            <Button variant="secondary">Страница клуба</Button>
          </Link>
        </div>
      </FormCard>
    </PublicPageLayout>
  );
};

export default PaymentSuccess;

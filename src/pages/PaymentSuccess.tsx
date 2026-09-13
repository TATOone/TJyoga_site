import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PaymentNextActions from '../components/PaymentNextActions';
import PublicPageLayout from '../components/PublicPageLayout';
import { FormCard, StatusBadge } from '../components/ui';
import { apiClient, ApiClientError } from '../lib/apiClient';
import { loadAuthSession } from '../lib/authStorage';
import { readLastOrderId } from '../lib/checkoutStorage';
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
      const orderId = orderIdFromQuery ?? readLastOrderId();
      setResolvedOrderId(orderId);

      if (!orderId) {
        setMessage(
          'Номер заказа не найден. Если оплата уже прошла, доступ может ещё обрабатываться — откройте кабинет или напишите в Telegram.',
        );
        setTone('warning');
        return;
      }

      const session = loadAuthSession();
      if (!session) {
        setMessage(
          'Оплата принята. Войдите в кабинет — там Zoom, записи и статус подписки.',
        );
        setTone('warning');
        return;
      }

      try {
        const order = await apiClient.getCheckoutOrder(orderId, session.accessToken);
        if (order.status === 'paid' || order.subscription_status === 'active') {
          setMessage('Оплата подтверждена. Дальше — кабинет: откройте практику или записи.');
          setTone('success');
          return;
        }

        setMessage('Платёж ещё обрабатывается. Обновите страницу через минуту.');
        setTone('warning');
      } catch (error) {
        if (error instanceof ApiClientError && error.code === 'NOT_FOUND') {
          setMessage(
            'Заказ ещё не появился в кабинете. Если оплата прошла, доступ обычно открывается в течение нескольких минут.',
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
    <PublicPageLayout
      title="Оплата"
      subtitle="Дальше — кабинет: там Zoom, записи и статус подписки."
    >
      <FormCard className="text-center">
        <div className="mb-3 flex justify-center">
          <StatusBadge
            label={tone === 'success' ? 'Успешно' : tone === 'warning' ? 'В обработке' : 'Статус'}
            tone={tone === 'success' ? 'success' : 'warning'}
          />
        </div>
        <p className="text-dark-brown">{message}</p>
        {resolvedOrderId ? <p className="mt-2 text-sm text-gray-brown">Заказ: {resolvedOrderId}</p> : null}
        <div className="mt-6">
          <PaymentNextActions outcome="success" />
        </div>
      </FormCard>
    </PublicPageLayout>
  );
};

export default PaymentSuccess;

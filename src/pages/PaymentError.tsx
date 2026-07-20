import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import { Button, FormCard, StatusBadge } from '../components/ui';
import { usePageMeta } from '../utils/usePageMeta';

const PaymentError: React.FC = () => {
  usePageMeta('paymentError');
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');

  return (
    <PublicPageLayout
      title="Оплата не завершена"
      subtitle="Платёж был отменён или прерван. Вы можете повторить checkout в любой момент."
    >
      <FormCard className="text-center">
        <div className="mb-3 flex justify-center">
          <StatusBadge label="Не завершено" tone="danger" />
        </div>
        {orderId ? <p className="mb-4 text-sm text-gray-brown">Заказ: {orderId}</p> : null}
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/club/rates">
            <Button>Вернуться к тарифам</Button>
          </Link>
          <Link to="/account/support">
            <Button variant="secondary">Поддержка</Button>
          </Link>
        </div>
      </FormCard>
    </PublicPageLayout>
  );
};

export default PaymentError;

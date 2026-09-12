import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PaymentNextActions from '../components/PaymentNextActions';
import PublicPageLayout from '../components/PublicPageLayout';
import { FormCard, StatusBadge } from '../components/ui';
import { getProductById } from '../config/products';
import { readLastProductId } from '../lib/checkoutStorage';
import { usePageMeta } from '../utils/usePageMeta';

const PaymentError: React.FC = () => {
  usePageMeta('paymentError');
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  const [retryPath, setRetryPath] = React.useState<string | null>(null);

  React.useEffect(() => {
    const lastProduct = getProductById(readLastProductId() ?? '');
    setRetryPath(lastProduct?.checkoutPath ?? null);
  }, []);

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
        <PaymentNextActions outcome="error" retryPath={retryPath} />
      </FormCard>
    </PublicPageLayout>
  );
};

export default PaymentError;

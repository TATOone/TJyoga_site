import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import PublicPageLayout from '../components/PublicPageLayout';
import { CONSENT_BASELINE, LEGAL_DOCUMENTS } from '../config/legalDocuments';
import { getProductById, type ProductId } from '../config/products';
import { apiClient, ApiClientError, type AuthSession } from '../lib/apiClient';
import { saveAuthSession } from '../lib/authStorage';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const PRODUCT_PLAN_MAP: Partial<Record<ProductId, string>> = {
  'club-monthly': 'club-month',
  'club-yearly': 'club-year',
};

const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Введите имя и фамилию.'),
  email: z.string().email('Введите корректный email.'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов.'),
  telegram: z
    .string()
    .regex(/^@?[A-Za-z0-9_]{5,32}$/, 'Укажите Telegram username в формате @username.'),
  offerAccept: z.boolean().refine((value) => value, 'Нужно принять условия оферты.'),
  privacyAccept: z.boolean().refine((value) => value, 'Нужно принять политику обработки данных.'),
  medicalDisclaimerAccept: z
    .boolean()
    .refine((value) => value, 'Нужно подтвердить медицинский отказ от ответственности.'),
  cookiesAccept: z.boolean(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const LAST_ORDER_STORAGE_KEY = 'tj_yoga_last_order_id';

const CheckoutStub: React.FC = () => {
  usePageMeta('checkout');

  const { productId } = useParams<{ productId: string }>();
  const product = productId ? getProductById(productId) : null;
  const planCode = product ? PRODUCT_PLAN_MAP[product.id] : null;

  React.useEffect(() => {
    if (product) {
      analyticsEvents.checkoutStart(product.id, 'checkout_page');
    }
  }, [product]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      telegram: '',
      offerAccept: false,
      privacyAccept: false,
      medicalDisclaimerAccept: false,
      cookiesAccept: false,
    },
  });

  const onSubmit = async (formData: CheckoutFormData) => {
    if (!product || !planCode) {
      return;
    }

    analyticsEvents.formSubmit('checkout_stub', product.id);
    analyticsEvents.ctaClick(`checkout_submit_${product.id}`, 'checkout_stub');

    const acceptConsents = [
      { doc_type: 'offer', version: CONSENT_BASELINE.version },
      { doc_type: 'privacy', version: CONSENT_BASELINE.version },
      { doc_type: 'medical_disclaimer', version: CONSENT_BASELINE.version },
    ];

    if (formData.cookiesAccept) {
      acceptConsents.push({ doc_type: 'cookies', version: CONSENT_BASELINE.version });
    }

    const origin = window.location.origin;
    const idempotencyKey = crypto.randomUUID();

    try {
      let session: AuthSession;

      try {
        session = await apiClient.login({
          email: formData.email,
          password: formData.password,
        });
      } catch (error) {
        if (error instanceof ApiClientError && error.code === 'UNAUTHORIZED') {
          await apiClient.register({
            email: formData.email,
            password: formData.password,
            first_name: formData.fullName,
          });
          session = await apiClient.login({
            email: formData.email,
            password: formData.password,
          });
        } else {
          throw error;
        }
      }

      saveAuthSession(session, true);

      const checkoutSession = await apiClient.createCheckoutSession(
        {
          plan_code: planCode,
          return_url_success: `${origin}/payment/success`,
          return_url_error: `${origin}/payment/error`,
          accept_consents: acceptConsents,
          customer_email: formData.email,
          customer_extra: `${formData.fullName} | Telegram: ${formData.telegram}`,
        },
        session.accessToken,
        idempotencyKey,
      );

      sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, checkoutSession.order_id);
      window.location.assign(checkoutSession.payment_url);
    } catch (error) {
      if (error instanceof ApiClientError) {
        toast.error(error.message);
        return;
      }

      toast.error('Не удалось создать платёжную сессию. Попробуйте ещё раз.');
    }
  };

  if (!product) {
    return (
      <PublicPageLayout
        title="Товар не найден"
        subtitle="Проверьте ссылку или выберите актуальный тариф на странице клуба."
      >
        <div className="max-w-xl mx-auto text-center">
          <Link
            to="/club/rates"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
          >
            Перейти к тарифам
          </Link>
        </div>
      </PublicPageLayout>
    );
  }

  if (!planCode) {
    return (
      <PublicPageLayout
        title="Онлайн-оплата скоро"
        subtitle="Для этого продукта пока доступна заявка через поддержку. Выберите тариф клуба для оплаты онлайн."
      >
        <div className="max-w-xl mx-auto text-center">
          <Link
            to="/club/rates"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
          >
            Перейти к тарифам клуба
          </Link>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout
      title="Оформление заказа"
      subtitle="Подтверждение данных и согласий перед переходом к оплате Prodamus."
    >
      <div className="mx-auto max-w-3xl space-y-6">
        <article className="rounded-card border border-light-sandy bg-cream p-6 shadow-soft">
          <h2 className="mb-2 font-display text-xl font-semibold text-dark-brown">{product.shortTitle}</h2>
          <p className="mb-3 text-gray-brown">{product.description}</p>
          <p className="text-2xl font-bold text-olive-green">{product.priceLabel}</p>
        </article>

        <form
          className="space-y-5 rounded-card border border-light-sandy bg-light-text p-6 shadow-soft"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-dark-brown mb-1">
              Имя и фамилия
            </label>
            <input
              id="fullName"
              type="text"
              className="w-full px-4 py-3 rounded-lg border border-light-sandy focus:border-terracotta focus:outline-none"
              {...register('fullName')}
            />
            {errors.fullName && <p className="text-sm text-terracotta mt-1">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark-brown mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-3 rounded-lg border border-light-sandy focus:border-terracotta focus:outline-none"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-terracotta mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label htmlFor="telegram" className="block text-sm font-medium text-dark-brown mb-1">
                Telegram
              </label>
              <input
                id="telegram"
                type="text"
                placeholder="@username"
                className="w-full px-4 py-3 rounded-lg border border-light-sandy focus:border-terracotta focus:outline-none"
                {...register('telegram')}
              />
              {errors.telegram && <p className="text-sm text-terracotta mt-1">{errors.telegram.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-dark-brown mb-1">
              Пароль для личного кабинета
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full px-4 py-3 rounded-lg border border-light-sandy focus:border-terracotta focus:outline-none"
              {...register('password')}
            />
            {errors.password && <p className="text-sm text-terracotta mt-1">{errors.password.message}</p>}
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-semibold text-dark-brown">
              Обязательные согласия ({CONSENT_BASELINE.version})
            </legend>

            <label className="flex items-start gap-3 text-sm text-dark-brown">
              <input type="checkbox" className="mt-1" {...register('offerAccept')} />
              <span>
                Принимаю условия{' '}
                <Link className="text-terracotta hover:text-golden-sandy" to={LEGAL_DOCUMENTS.offer.path}>
                  оферты
                </Link>
                .
              </span>
            </label>
            {errors.offerAccept && (
              <p className="text-sm text-terracotta mt-1">{errors.offerAccept.message}</p>
            )}

            <label className="flex items-start gap-3 text-sm text-dark-brown">
              <input type="checkbox" className="mt-1" {...register('privacyAccept')} />
              <span>
                Согласен(а) с{' '}
                <Link className="text-terracotta hover:text-golden-sandy" to={LEGAL_DOCUMENTS.policy.path}>
                  политикой обработки данных
                </Link>
                .
              </span>
            </label>
            {errors.privacyAccept && (
              <p className="text-sm text-terracotta mt-1">{errors.privacyAccept.message}</p>
            )}

            <label className="flex items-start gap-3 text-sm text-dark-brown">
              <input type="checkbox" className="mt-1" {...register('medicalDisclaimerAccept')} />
              <span>
                Ознакомлен(а) с{' '}
                <Link
                  className="text-terracotta hover:text-golden-sandy"
                  to={LEGAL_DOCUMENTS['medical-disclaimer'].path}
                >
                  медицинским отказом
                </Link>
                .
              </span>
            </label>
            {errors.medicalDisclaimerAccept && (
              <p className="text-sm text-terracotta mt-1">{errors.medicalDisclaimerAccept.message}</p>
            )}

            <label className="flex items-start gap-3 text-sm text-dark-brown">
              <input type="checkbox" className="mt-1" {...register('cookiesAccept')} />
              <span>Согласен(а) на cookie для аналитики (опционально).</span>
            </label>
          </fieldset>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors disabled:opacity-70"
          >
            {isSubmitting ? 'Переходим к оплате...' : 'Подтвердить и перейти к оплате'}
          </button>
        </form>
      </div>
    </PublicPageLayout>
  );
};

export default CheckoutStub;

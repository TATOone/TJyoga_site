import React from 'react';
import { createPortal } from 'react-dom';
import { Link, useParams } from 'react-router-dom';
import { useForm, type FieldErrors } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-toastify';
import CheckoutProgress, { type CheckoutStepId } from '../components/CheckoutProgress';
import PublicPageLayout from '../components/PublicPageLayout';
import PurchaseLegalLinks from '../components/PurchaseLegalLinks';
import TrustStrip from '../components/TrustStrip';
import { TextField } from '../components/ui';
import { CONSENT_BASELINE, LEGAL_DOCUMENTS } from '../config/legalDocuments';
import { getProductById, type ProductId } from '../config/products';
import { apiClient, ApiClientError, type AuthSession } from '../lib/apiClient';
import { saveAuthSession } from '../lib/authStorage';
import { saveLastCheckoutRefs } from '../lib/checkoutStorage';
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

const CHECKOUT_FORM_ID = 'checkout-form';

const CheckoutStub: React.FC = () => {
  usePageMeta('checkout');

  const { productId } = useParams<{ productId: string }>();
  const product = productId ? getProductById(productId) : null;
  const planCode = product ? PRODUCT_PLAN_MAP[product.id] : null;
  const [currentStep, setCurrentStep] = React.useState<CheckoutStepId>('account');

  React.useEffect(() => {
    if (product) {
      analyticsEvents.checkoutStart(product.id, 'checkout_page');
    }
  }, [product]);

  const {
    register,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting, submitCount },
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

  const hasErrors = submitCount > 0 && Object.keys(errors).length > 0;

  React.useEffect(() => {
    const account = document.getElementById('checkout-account');
    const consents = document.getElementById('checkout-consents');
    const pay = document.getElementById('checkout-pay');
    const sections: Array<{ id: CheckoutStepId; el: HTMLElement | null }> = [
      { id: 'account', el: account },
      { id: 'consents', el: consents },
      { id: 'pay', el: pay },
    ];

    const observed = sections.filter((section) => section.el);
    if (observed.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        const match = observed.find((section) => section.el === visible?.target);
        if (match) {
          setCurrentStep(match.id);
        }
      },
      { threshold: [0.35, 0.6], rootMargin: '-20% 0px -35% 0px' },
    );

    observed.forEach((section) => {
      if (section.el) {
        observer.observe(section.el);
      }
    });

    return () => observer.disconnect();
  }, [product, planCode]);

  const scrollToFirstError = (formErrors: FieldErrors<CheckoutFormData>) => {
    analyticsEvents.ctaClick('checkout_validation_error', 'checkout_stub');
    const fieldOrder = [
      'fullName',
      'email',
      'telegram',
      'password',
      'offerAccept',
      'privacyAccept',
      'medicalDisclaimerAccept',
    ] as const;
    const firstInvalidField = fieldOrder.find((field) => formErrors[field]);
    if (firstInvalidField) {
      setFocus(firstInvalidField);
    }
    window.requestAnimationFrame(() => {
      const firstInvalid = document.querySelector<HTMLElement>(
        '[aria-invalid="true"], [data-consent-error="true"]',
      );
      firstInvalid?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };

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

      saveLastCheckoutRefs(checkoutSession.order_id, product.id);
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

  const submitLabel = isSubmitting ? 'Переходим к оплате...' : 'Подтвердить и перейти к оплате';

  return (
    <PublicPageLayout
      title="Оформление заказа"
      subtitle="Подтверждение данных и согласий перед переходом к оплате Prodamus."
    >
      <div className="mx-auto max-w-3xl space-y-6 pb-[calc(7.5rem+env(safe-area-inset-bottom,0px))] md:pb-0">
        <article className="rounded-card border border-light-sandy bg-cream p-6 shadow-soft">
          <h2 className="mb-2 font-display text-xl font-semibold text-dark-brown">{product.shortTitle}</h2>
          <p className="mb-3 text-gray-brown">{product.description}</p>
          <p className="text-2xl font-bold text-olive-green">{product.priceLabel}</p>
        </article>

        <TrustStrip />

        <div className="rounded-card border border-light-sandy bg-light-text px-4 py-4 shadow-soft sm:px-6">
          <CheckoutProgress current={currentStep} />
        </div>

        <form
          id={CHECKOUT_FORM_ID}
          className="space-y-6 rounded-card border border-light-sandy bg-light-text p-6 shadow-soft"
          onSubmit={handleSubmit(onSubmit, scrollToFirstError)}
          noValidate
        >
          {hasErrors ? (
            <div
              className="rounded-soft border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
              role="alert"
            >
              Проверьте поля ниже — без этого оплата не начнётся.
            </div>
          ) : null}

          <section id="checkout-account" className="space-y-4 scroll-mt-28">
            <h3 className="font-display text-lg font-semibold text-dark-brown">1. Аккаунт</h3>
            <TextField
              label="Имя и фамилия"
              autoComplete="name"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <TextField
                label="Telegram"
                autoComplete="username"
                placeholder="@username"
                hint="Формат @username"
                error={errors.telegram?.message}
                {...register('telegram')}
              />
            </div>

            <TextField
              label="Пароль для личного кабинета"
              type="password"
              autoComplete="new-password"
              hint="Минимум 8 символов"
              error={errors.password?.message}
              {...register('password')}
            />
          </section>

          <section id="checkout-consents" className="space-y-3 scroll-mt-28">
            <h3 className="font-display text-lg font-semibold text-dark-brown">2. Согласия</h3>
            <fieldset className="space-y-3 rounded-soft border border-light-sandy bg-cream/60 p-4">
              <legend className="px-1 text-sm font-semibold text-dark-brown">
                Обязательные согласия ({CONSENT_BASELINE.version})
              </legend>

              <label
                className={`flex min-h-touch items-start gap-3 rounded-soft border bg-light-text p-3 text-sm text-dark-brown ${
                  errors.offerAccept ? 'border-danger' : 'border-light-sandy'
                }`}
                data-consent-error={errors.offerAccept ? 'true' : undefined}
              >
                <input type="checkbox" className="mt-1 size-5 shrink-0" {...register('offerAccept')} />
                <span>
                  Принимаю условия{' '}
                  <Link className="text-terracotta hover:text-golden-sandy" to={LEGAL_DOCUMENTS.offer.path}>
                    оферты
                  </Link>
                  .
                </span>
              </label>
              {errors.offerAccept ? (
                <p className="text-sm text-danger" role="alert">
                  {errors.offerAccept.message}
                </p>
              ) : null}

              <label
                className={`flex min-h-touch items-start gap-3 rounded-soft border bg-light-text p-3 text-sm text-dark-brown ${
                  errors.privacyAccept ? 'border-danger' : 'border-light-sandy'
                }`}
                data-consent-error={errors.privacyAccept ? 'true' : undefined}
              >
                <input type="checkbox" className="mt-1 size-5 shrink-0" {...register('privacyAccept')} />
                <span>
                  Согласен(а) с{' '}
                  <Link className="text-terracotta hover:text-golden-sandy" to={LEGAL_DOCUMENTS.policy.path}>
                    политикой обработки данных
                  </Link>
                  .
                </span>
              </label>
              {errors.privacyAccept ? (
                <p className="text-sm text-danger" role="alert">
                  {errors.privacyAccept.message}
                </p>
              ) : null}

              <label
                className={`flex min-h-touch items-start gap-3 rounded-soft border bg-light-text p-3 text-sm text-dark-brown ${
                  errors.medicalDisclaimerAccept ? 'border-danger' : 'border-light-sandy'
                }`}
                data-consent-error={errors.medicalDisclaimerAccept ? 'true' : undefined}
              >
                <input
                  type="checkbox"
                  className="mt-1 size-5 shrink-0"
                  {...register('medicalDisclaimerAccept')}
                />
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
              {errors.medicalDisclaimerAccept ? (
                <p className="text-sm text-danger" role="alert">
                  {errors.medicalDisclaimerAccept.message}
                </p>
              ) : null}
            </fieldset>

            <PurchaseLegalLinks analyticsLocation="checkout_legal" />

            <fieldset className="space-y-3 rounded-soft border border-dashed border-light-sandy p-4">
              <legend className="px-1 text-sm font-semibold text-gray-brown">Дополнительно</legend>
              <label className="flex min-h-touch items-start gap-3 text-sm text-dark-brown">
                <input type="checkbox" className="mt-1 size-5 shrink-0" {...register('cookiesAccept')} />
                <span>Согласен(а) на cookie для аналитики (опционально).</span>
              </label>
            </fieldset>
          </section>

          <section id="checkout-pay" className="space-y-3 scroll-mt-28">
            <h3 className="font-display text-lg font-semibold text-dark-brown">3. Оплата</h3>
            <p className="rounded-soft bg-light-olive px-4 py-3 text-sm text-dark-brown">
              Дальше откроется оплата Prodamus. Кабинет — после подтверждения платежа, обычно за
              несколько минут.
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="hidden min-h-12 w-full items-center justify-center rounded-lg bg-terracotta px-5 py-3 font-medium text-light-text transition-colors hover:bg-golden-sandy disabled:opacity-70 md:inline-flex"
            >
              {submitLabel}
            </button>
          </section>
        </form>
      </div>

      {createPortal(
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-light-sandy bg-light-text/95 shadow-soft backdrop-blur-sm md:hidden"
          role="region"
          aria-label="Подтверждение заказа"
        >
          <div className="sticky-funnel-cta mx-auto flex w-full min-w-0 max-w-lg flex-col gap-2 px-3">
            <p className="text-xs leading-tight text-gray-brown">
              {product.priceLabel}. После оплаты — кабинет, обычно за несколько минут.
            </p>
            {hasErrors ? (
              <p className="text-xs text-danger" role="alert">
                Проверьте поля выше.
              </p>
            ) : null}
            <button
              type="submit"
              form={CHECKOUT_FORM_ID}
              disabled={isSubmitting}
              className="inline-flex min-h-touch w-full min-w-0 items-center justify-center rounded-soft bg-terracotta px-3 py-2 text-sm font-medium text-light-text transition-colors hover:bg-golden-sandy disabled:opacity-70"
            >
              {submitLabel}
            </button>
          </div>
        </div>,
        document.body,
      )}
    </PublicPageLayout>
  );
};

export default CheckoutStub;

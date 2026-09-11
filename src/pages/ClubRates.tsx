import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import { Button } from '../components/ui';
import { getActiveAccent } from '../config/campaignAccent';
import { CLUB_RATE_PRODUCT_IDS, PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const ClubRates: React.FC = () => {
  usePageMeta('clubRates');
  const accent = getActiveAccent();
  const monthly = PRODUCTS['club-monthly'];
  const yearly = PRODUCTS['club-yearly'];

  return (
    <PublicPageLayout
      title="Тарифы Йога-Клуба"
      subtitle={`${accent.ctaHint}. Месяц — ${monthly.priceLabel}, год — ${yearly.priceLabel}. Наполнение одно, доплат нет.`}
      eyebrow={accent.label}
    >
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {CLUB_RATE_PRODUCT_IDS.map((id) => {
            const product = PRODUCTS[id];

            return (
              <article
                key={product.id}
                className={`rounded-card border p-6 shadow-soft ${
                  product.featured
                    ? 'border-terracotta/40 bg-cream'
                    : 'border-light-sandy bg-light-text'
                }`}
              >
                {product.featured ? (
                  <p className="mb-3 text-sm font-medium text-terracotta">На 12 000 ₽ меньше за год</p>
                ) : null}
                <h2 className="mb-2 font-display text-2xl font-semibold text-terracotta">
                  {product.shortTitle}
                </h2>
                <p className="mb-4 text-gray-brown">{product.description}</p>
                <p className="mb-5 text-2xl font-bold text-olive-green">{product.priceLabel}</p>

                <ul className="mb-6 space-y-2 text-dark-brown">
                  {product.includes.map((item) => (
                    <li key={item} className="relative pl-4">
                      <span className="absolute left-0 text-olive-green">•</span>
                      {item}
                    </li>
                  ))}
                </ul>

                <Link to={product.checkoutPath} className="block">
                  <Button
                    fullWidth
                    onClick={() =>
                      analyticsEvents.ctaClick(`Оформить ${product.shortTitle}`, 'club_rates')
                    }
                  >
                    {product.ctaLabel}
                  </Button>
                </Link>
              </article>
            );
          })}
        </div>

        <div className="rounded-card bg-light-olive p-6 text-dark-brown">
          <h3 className="mb-3 font-display text-xl font-semibold">После оплаты</h3>
          <p className="mb-3">
            Кабинет открывается после подтверждения платежа — обычно за несколько минут. Если доступ
            не появился, мы включим его вручную в течение 2 часов (ежедневно 10:00–22:00 МСК).
          </p>
          <Link
            to="/how-to-buy"
            className="inline-flex min-h-touch items-center font-medium text-terracotta transition-colors hover:text-golden-sandy"
            onClick={() => analyticsEvents.ctaClick('Перейти в как купить', 'club_rates')}
          >
            Как проходит оформление
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default ClubRates;

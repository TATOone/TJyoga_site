import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import { Button, StatusBadge } from '../components/ui';
import { CLUB_RATE_PRODUCT_IDS, PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const ClubRates: React.FC = () => {
  usePageMeta('clubRates');

  return (
    <PublicPageLayout
      title="Тарифы Йога-Клуба"
      subtitle="Выберите удобный формат доступа к клубу: помесячно или сразу на год с выгодой."
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
                  <div className="mb-3">
                    <StatusBadge label="Выгоднее" tone="warning" />
                  </div>
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
                    Оформить подписку
                  </Button>
                </Link>
              </article>
            );
          })}
        </div>

        <div className="rounded-card bg-light-olive p-6 text-dark-brown">
          <h3 className="mb-3 font-display text-xl font-semibold">Важно перед оплатой</h3>
          <p className="mb-3">
            Доступ в клуб открывается после подтверждения оплаты. Если доступ не активировался
            автоматически, мы вручную обновим статус в течение 2 часов (ежедневно с 10:00 до 22:00
            МСК).
          </p>
          <Link
            to="/how-to-buy"
            className="inline-flex min-h-touch items-center font-medium text-terracotta transition-colors hover:text-golden-sandy"
            onClick={() => analyticsEvents.ctaClick('Перейти в как купить', 'club_rates')}
          >
            Подробнее о процессе покупки
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default ClubRates;

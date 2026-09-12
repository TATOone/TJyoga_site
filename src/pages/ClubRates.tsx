import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import PurchaseLegalLinks from '../components/PurchaseLegalLinks';
import TeachersTeaser from '../components/TeachersTeaser';
import Testimonials from '../components/Testimonials';
import TrustStrip from '../components/TrustStrip';
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
  const plans = [...CLUB_RATE_PRODUCT_IDS]
    .map((id) => PRODUCTS[id])
    .sort((left, right) => Number(Boolean(right.featured)) - Number(Boolean(left.featured)));

  return (
    <PublicPageLayout
      title="Тарифы Йога-Клуба"
      subtitle={`${accent.ctaHint}. Месяц — ${monthly.priceLabel}, год — ${yearly.priceLabel}. Наполнение одно, доплат нет.`}
      eyebrow={accent.label}
    >
      <div className="mx-auto max-w-5xl space-y-8">
        <TrustStrip />
        <TeachersTeaser analyticsLocation="club_rates_teachers" />

        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2">
          {plans.map((product) => {
            const featured = Boolean(product.featured);

            return (
              <article
                key={product.id}
                className={`flex min-w-0 flex-col rounded-card border p-6 shadow-soft md:p-8 ${
                  featured
                    ? 'border-terracotta bg-cream ring-2 ring-terracotta/35'
                    : 'border-light-sandy bg-light-text'
                }`}
              >
                {featured ? (
                  <p className="mb-3 inline-flex w-fit rounded-full bg-terracotta/10 px-3 py-1 text-sm font-semibold text-terracotta">
                    На 12 000 ₽ меньше за год
                  </p>
                ) : (
                  <p className="mb-3 text-sm font-medium text-transparent" aria-hidden="true">
                    На 12 000 ₽ меньше за год
                  </p>
                )}
                <h2
                  className={`mb-2 font-display font-semibold text-terracotta ${
                    featured ? 'text-3xl' : 'text-2xl'
                  }`}
                >
                  {product.shortTitle}
                </h2>
                <p className="mb-4 text-gray-brown">{product.description}</p>
                <p
                  className={`mb-5 font-bold text-olive-green ${
                    featured ? 'text-3xl' : 'text-2xl'
                  }`}
                >
                  {product.priceLabel}
                </p>

                <ul className="mb-6 flex-1 space-y-2 text-dark-brown">
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
                    size="lg"
                    className="min-h-12 text-base"
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

        <Testimonials variant="compact" />

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
          <div className="mt-5 border-t border-olive-green/20 pt-4">
            <PurchaseLegalLinks analyticsLocation="club_rates_legal" />
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default ClubRates;

import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import PurchaseLegalLinks from '../components/PurchaseLegalLinks';
import { CONSENT_BASELINE } from '../config/legalDocuments';
import { PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const HowToBuy: React.FC = () => {
  usePageMeta('howToBuy');

  const monthly = PRODUCTS['club-monthly'];
  const yearly = PRODUCTS['club-yearly'];

  const steps = [
    'Выберите месяц или год. Наполнение одно.',
    'Имя, почта, Telegram и пароль для кабинета.',
    'Оферта, политика данных и медицинский отказ - без этого оплата не начнётся.',
    'Кабинет открывается сам, обычно за несколько минут. Если нет - напишите в Telegram.',
  ];

  return (
    <PublicPageLayout title="Как оформить" subtitle="Картой. Цена как на сайте.">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-cream border border-light-sandy rounded-2xl p-6 md:p-8">
          <ol className="space-y-3">
            {steps.map((step, index) => (
              <li key={step} className="flex gap-3 text-dark-brown">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-olive-green text-light-text text-sm font-semibold">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <article className="bg-light-text border border-light-sandy rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-dark-brown mb-3">Если доступ не пришёл</h3>
            <p className="text-gray-brown mb-3">
              Напишите в Telegram. В рабочие часы включим вручную в течение{' '}
              {CONSENT_BASELINE.renewalSla}.
            </p>
            <p className="text-gray-brown">
              После окончания подписки остаётся {CONSENT_BASELINE.gracePeriodHours} часа, чтобы
              продлить без разрыва.
            </p>
          </article>
          <article className="bg-light-text border border-light-sandy rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-dark-brown mb-3">Документы перед оплатой</h3>
            <p className="text-gray-brown mb-3">Версия документов: {CONSENT_BASELINE.version}.</p>
            <PurchaseLegalLinks analyticsLocation="how_to_buy_legal" />
          </article>
        </div>

        <div className="bg-light-olive rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-dark-brown mb-2">Месяц или год</h2>
            <p className="text-gray-brown">
              {monthly.priceLabel}. {yearly.priceLabel}.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/club/rates"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg border border-terracotta text-terracotta hover:bg-cream transition-colors"
              onClick={() => analyticsEvents.ctaClick('Сравнить тарифы', 'how_to_buy')}
            >
              Тарифы
            </Link>
            <Link
              to={monthly.checkoutPath}
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
              onClick={() => analyticsEvents.ctaClick('Оформить клуб из how-to-buy', 'how_to_buy')}
            >
              {monthly.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default HowToBuy;

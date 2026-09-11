import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import { getActiveAccent } from '../config/campaignAccent';
import { CONSENT_BASELINE } from '../config/legalDocuments';
import { PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const HowToBuy: React.FC = () => {
  usePageMeta('howToBuy');

  const accent = getActiveAccent();
  const monthly = PRODUCTS['club-monthly'];
  const yearly = PRODUCTS['club-yearly'];

  const steps = [
    'Выберите месяц или год на странице тарифов — наполнение клуба одно и то же.',
    'В форме заказа укажите имя, почту, Telegram и пароль для кабинета.',
    'Подтвердите оферту, политику данных и медицинский отказ — без этого оплата не начнётся.',
    'После оплаты кабинет открывается сам, обычно за несколько минут. Если нет — пишите в Telegram, в рабочие часы доступ включают вручную.',
  ];

  return (
    <PublicPageLayout
      title="Как оформить подписку"
      subtitle={`${accent.ctaHint}. Цена на экране — та же при оплате.`}
      eyebrow={accent.label}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-cream border border-light-sandy rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-dark-brown mb-4">По шагам</h2>
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
              Напишите в Telegram. В рабочие часы доступ обновляют вручную в течение{' '}
              {CONSENT_BASELINE.renewalSla}.
            </p>
            <p className="text-gray-brown">
              После окончания подписки остаётся {CONSENT_BASELINE.gracePeriodHours} часа, чтобы
              продлить без разрыва.
            </p>
          </article>
          <article className="bg-light-text border border-light-sandy rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-dark-brown mb-3">Документы перед оплатой</h3>
            <p className="text-gray-brown mb-3">
              Короткие тексты, которые нужно принять в форме заказа. Версия документов:{' '}
              {CONSENT_BASELINE.version}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/offer" className="text-terracotta hover:text-golden-sandy transition-colors">
                Оферта
              </Link>
              <Link to="/policy" className="text-terracotta hover:text-golden-sandy transition-colors">
                Политика
              </Link>
              <Link to="/refund" className="text-terracotta hover:text-golden-sandy transition-colors">
                Возврат
              </Link>
            </div>
          </article>
        </div>

        <div className="bg-light-olive rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-dark-brown mb-2">Месяц или год</h2>
            <p className="text-gray-brown">
              {monthly.priceLabel}. {yearly.priceLabel}. Сравните на странице тарифов или сразу
              оформите месяц.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/club/rates"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg border border-terracotta text-terracotta hover:bg-cream transition-colors"
              onClick={() => analyticsEvents.ctaClick('Сравнить тарифы', 'how_to_buy')}
            >
              Сравнить тарифы
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

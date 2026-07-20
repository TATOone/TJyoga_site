import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import { CONSENT_BASELINE } from '../config/legalDocuments';
import { PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const HowToBuy: React.FC = () => {
  usePageMeta('howToBuy');

  const monthly = PRODUCTS['club-monthly'];

  const steps = [
    'Выберите продукт или тариф на странице клуба.',
    'Перейдите во внутренний checkout и заполните контактные данные.',
    'Подтвердите обязательные юридические согласия версии v1.0.0.',
    'После оплаты доступ активируется автоматически, либо вручную в рамках SLA.',
  ];

  return (
    <PublicPageLayout
      title="Как купить доступ"
      subtitle="Пошаговый процесс оформления покупки и получения доступа в клуб."
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-cream border border-light-sandy rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-dark-brown mb-4">Пошаговый процесс</h2>
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
            <h3 className="text-xl font-semibold text-dark-brown mb-3">Сроки и поддержка</h3>
            <p className="text-gray-brown mb-3">
              Если автоматическая активация не сработала, мы вручную обновим доступ в течение{' '}
              {CONSENT_BASELINE.renewalSla}.
            </p>
            <p className="text-gray-brown">
              Льготный период продления подписки: {CONSENT_BASELINE.gracePeriodHours} часа с момента
              окончания активного периода.
            </p>
          </article>
          <article className="bg-light-text border border-light-sandy rounded-2xl p-6">
            <h3 className="text-xl font-semibold text-dark-brown mb-3">Юридические документы</h3>
            <p className="text-gray-brown mb-3">
              Все обязательные документы зафиксированы в baseline версии{' '}
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
            <h2 className="text-2xl font-semibold text-dark-brown mb-2">Готовы начать?</h2>
            <p className="text-gray-brown">Быстрый старт — месячный тариф в Йога-Клубе.</p>
          </div>
          <Link
            to={monthly.checkoutPath}
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
            onClick={() => analyticsEvents.ctaClick('Оформить клуб из how-to-buy', 'how_to_buy')}
          >
            Оформить доступ
          </Link>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default HowToBuy;

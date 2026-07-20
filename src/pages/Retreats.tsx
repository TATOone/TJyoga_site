import React from 'react';
import { Link } from 'react-router-dom';
import Countdown from '../components/Countdown';
import PublicPageLayout from '../components/PublicPageLayout';
import { PRODUCTS } from '../config/products';
import { RETREAT_START } from '../config/retreat';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const Retreats: React.FC = () => {
  usePageMeta('retreats');

  const retreat = PRODUCTS['retreat-pass'];

  return (
    <PublicPageLayout
      title="Йога-Ретриты TJ Yoga"
      subtitle="Путешествия с фокусом на практику, восстановление и перезагрузку."
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <img
            src={retreat.image}
            alt="Йога-ретрит TJ Yoga"
            className="w-full h-full max-h-[420px] object-cover rounded-2xl shadow-sm"
            loading="lazy"
          />
          <div className="bg-cream border border-light-sandy rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-dark-brown mb-3">Что вас ждет</h2>
            <p className="text-gray-brown mb-4">{retreat.details}</p>
            <Countdown targetDate={RETREAT_START} />
            <ul className="space-y-2 text-dark-brown mt-4 mb-6">
              {retreat.includes.map((item) => (
                <li key={item} className="pl-4 relative">
                  <span className="absolute left-0 text-olive-green">•</span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-2xl font-bold text-olive-green mb-5">{retreat.priceLabel}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={retreat.checkoutPath}
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
                onClick={() => analyticsEvents.ctaClick('Забронировать ретрит', 'retreats_page')}
              >
                Забронировать место
              </Link>
              <a
                href="https://t.me/TJyogatrip/133"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg border border-terracotta text-terracotta hover:bg-cream transition-colors"
                onClick={() => {
                  analyticsEvents.ctaClick('Новости ретритов Telegram', 'retreats_page');
                  analyticsEvents.telegramClick('TJyogatrip', 'retreats_page');
                }}
              >
                Новости ретритов
              </a>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default Retreats;

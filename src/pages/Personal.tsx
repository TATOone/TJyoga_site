import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import { PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const Personal: React.FC = () => {
  usePageMeta('personal');

  const personal = PRODUCTS['personal-session'];

  return (
    <PublicPageLayout
      title="Персональные занятия"
      subtitle="Индивидуальная практика с фокусом на ваши цели и особенности."
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <img
          src={personal.image}
          alt="Персональные занятия TJ Yoga"
          className="w-full h-full max-h-[420px] object-cover rounded-2xl shadow-sm"
          loading="lazy"
        />
        <div className="bg-cream border border-light-sandy rounded-2xl p-6">
          <h2 className="text-2xl font-semibold text-dark-brown mb-3">{personal.shortTitle}</h2>
          <p className="text-gray-brown mb-4">{personal.details}</p>
          <ul className="space-y-2 text-dark-brown mb-6">
            {personal.includes.map((item) => (
              <li key={item} className="pl-4 relative">
                <span className="absolute left-0 text-olive-green">•</span>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-2xl font-bold text-olive-green mb-5">{personal.priceLabel}</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={personal.checkoutPath}
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
              onClick={() => analyticsEvents.ctaClick('Оформить персональное занятие', 'personal_page')}
            >
              Оформить занятие
            </Link>
            <a
              href="https://t.me/starovoitovae"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg border border-terracotta text-terracotta hover:bg-cream transition-colors"
              onClick={() => {
                analyticsEvents.ctaClick('Уточнить формат персонально', 'personal_page');
                analyticsEvents.telegramClick('starovoitovae', 'personal_page');
              }}
            >
              Задать вопрос в Telegram
            </a>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default Personal;

import React from 'react';
import PublicPageLayout from '../components/PublicPageLayout';
import { CLUB_SUPPORT } from '../config/clubContent';
import { PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const Personal: React.FC = () => {
  usePageMeta('personal');

  const personal = PRODUCTS['personal-session'];

  return (
    <PublicPageLayout
      title="Персональные занятия"
      subtitle="Один-на-один: смотрим ваше тело, дыхание и технику."
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <img
          src={personal.image}
          alt="Персональные занятия TJ Yoga"
          className="w-full h-full max-h-[420px] object-cover rounded-2xl shadow-sm"
          loading="lazy"
        />
        <div className="bg-cream border border-light-sandy rounded-2xl p-6">
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
          <a
            href={personal.bookingHref ?? CLUB_SUPPORT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
            onClick={() => {
              analyticsEvents.ctaClick('Написать Жене', 'personal_page');
              analyticsEvents.telegramClick('starovoitovae', 'personal_page');
            }}
          >
            Написать Жене
          </a>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default Personal;

import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import {
  CLUB_SOCIAL_PROOF,
  CLUB_STRUCTURE,
  CLUB_SUPPORT,
  ZOOM_SCHEDULE,
} from '../config/clubContent';
import { PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const Club: React.FC = () => {
  usePageMeta('club');

  const monthly = PRODUCTS['club-monthly'];
  const yearly = PRODUCTS['club-yearly'];

  return (
    <PublicPageLayout
      title="Йога-Клуб TJ Yoga"
      subtitle="Клубный формат для регулярной практики: прямые эфиры, библиотека записей и поддержка в закрытом сообществе."
    >
      <div className="max-w-5xl mx-auto space-y-10">
        <ul className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CLUB_SOCIAL_PROOF.map((item) => (
            <li
              key={item.label}
              className="bg-cream border border-light-sandy rounded-2xl p-4 text-center"
            >
              <p className="text-xl font-bold text-olive-green">{item.value}</p>
              <p className="text-sm text-gray-brown mt-1">{item.label}</p>
            </li>
          ))}
        </ul>

        <section className="bg-cream border border-light-sandy rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-dark-brown mb-4">{CLUB_STRUCTURE.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLUB_STRUCTURE.pillars.map((pillar) => (
              <article
                key={pillar.id}
                className="bg-light-text border border-light-sandy rounded-xl p-4"
              >
                <h3 className="text-lg font-semibold text-terracotta mb-2">{pillar.title}</h3>
                <p className="text-gray-brown text-sm md:text-base">{pillar.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-light-text border border-light-sandy rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-dark-brown mb-2">Расписание Zoom</h2>
          <p className="text-gray-brown mb-4 text-sm">
            Время указано по Москве. Ссылка на комнату открывается только из личного кабинета через
            защищённый redirect.
          </p>
          <ul className="space-y-3">
            {ZOOM_SCHEDULE.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border border-light-sandy rounded-xl p-4"
              >
                <div>
                  <p className="font-semibold text-dark-brown">{item.title}</p>
                  <p className="text-sm text-gray-brown">
                    {item.dayLabel} · {item.timeLabel} · {item.durationMin} мин · {item.level}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-dark-brown mb-4">Тарифы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="bg-light-text border border-light-sandy rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-terracotta mb-2">{monthly.shortTitle}</h3>
              <p className="text-gray-brown mb-4">{monthly.description}</p>
              <p className="text-2xl font-bold text-olive-green mb-4">{monthly.priceLabel}</p>
              <Link
                to={monthly.checkoutPath}
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
                onClick={() => analyticsEvents.ctaClick('Оформить месячный тариф', 'club_page')}
              >
                Оформить месячный тариф
              </Link>
            </article>
            <article className="bg-light-text border border-terracotta/35 rounded-2xl p-6 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-terracotta font-semibold mb-2">
                Выгоднее
              </p>
              <h3 className="text-xl font-semibold text-terracotta mb-2">{yearly.shortTitle}</h3>
              <p className="text-gray-brown mb-4">{yearly.description}</p>
              <p className="text-2xl font-bold text-olive-green mb-4">{yearly.priceLabel}</p>
              <Link
                to={yearly.checkoutPath}
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
                onClick={() => analyticsEvents.ctaClick('Оформить годовой тариф', 'club_page')}
              >
                Оформить годовой тариф
              </Link>
            </article>
          </div>
        </section>

        <section className="bg-cream border border-light-sandy rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-dark-brown mb-4">FAQ</h2>
          <ul className="space-y-4">
            {CLUB_SUPPORT.faq.map((item) => (
              <li key={item.q}>
                <h3 className="font-semibold text-dark-brown mb-1">{item.q}</h3>
                <p className="text-gray-brown text-sm md:text-base">{item.a}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="bg-light-olive rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-dark-brown mb-2">
              Нужна помощь с выбором тарифа?
            </h2>
            <p className="text-gray-brown">
              Сравните тарифы или напишите в Telegram. {CLUB_SUPPORT.sla}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/club/rates"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg border border-terracotta text-terracotta hover:bg-cream transition-colors"
              onClick={() => analyticsEvents.ctaClick('Смотреть тарифы', 'club_page')}
            >
              Смотреть тарифы
            </Link>
            <a
              href={CLUB_SUPPORT.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-olive-green text-light-text hover:bg-golden-sandy transition-colors"
              onClick={() => {
                analyticsEvents.ctaClick('Консультация в Telegram', 'club_page');
                analyticsEvents.telegramClick('starovoitovae', 'club_page_consultation');
              }}
            >
              Консультация в Telegram
            </a>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default Club;

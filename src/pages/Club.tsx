import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import TeachersTeaser from '../components/TeachersTeaser';
import Testimonials from '../components/Testimonials';
import { getActiveAccent } from '../config/campaignAccent';
import {
  CLUB_PROGRAM,
  CLUB_SOCIAL_PROOF,
  CLUB_STRUCTURE,
  CLUB_SUPPORT,
  ZOOM_SCHEDULE,
} from '../config/clubContent';
import { FREE_CTA_LABEL, FREE_PAGE_PATH } from '../config/freePractices';
import { PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const Club: React.FC = () => {
  usePageMeta('club');

  const accent = getActiveAccent();
  const monthly = PRODUCTS['club-monthly'];
  const yearly = PRODUCTS['club-yearly'];

  return (
    <PublicPageLayout
      title="Онлайн Йога-Клуб"
      subtitle="Классическая хатха в живом эфире и в записях. Практика для любого уровня, прямая связь с преподавателем и поддержка сообщества учеников. Понятная цена без доплат."
      eyebrow={accent.label}
    >
      <div className="max-w-5xl mx-auto space-y-10">
        <p className="max-w-3xl mx-auto text-center text-dark-brown">{accent.clubEmphasis}</p>
        <div className="flex justify-center">
          <Link
            to={FREE_PAGE_PATH}
            className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg border border-terracotta text-terracotta hover:bg-cream transition-colors"
            onClick={() => analyticsEvents.ctaClick(FREE_CTA_LABEL, 'club_page')}
          >
            {FREE_CTA_LABEL}
          </Link>
        </div>

        <TeachersTeaser analyticsLocation="club_teachers" />

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
          <h2 className="text-2xl font-semibold text-dark-brown mb-2">{CLUB_PROGRAM.title}</h2>
          <p className="text-gray-brown mb-6 text-sm md:text-base">{CLUB_PROGRAM.intro}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CLUB_PROGRAM.levels.map((level) => (
              <article
                key={level.id}
                className="border border-light-sandy rounded-xl p-4 bg-cream"
              >
                <h3 className="text-lg font-semibold text-olive-green mb-2">{level.title}</h3>
                <p className="text-gray-brown text-sm md:text-base">{level.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-light-text border border-light-sandy rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-dark-brown mb-2">Расписание Zoom</h2>
          <p className="text-gray-brown mb-4 text-sm">
            Время по Москве. Ссылка на комнату открывается только из личного кабинета.
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
                    {item.dayLabel} · {item.timeLabel} МСК · {item.durationMin} мин · {item.level}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <Testimonials variant="compact" />

        <section>
          <h2 className="text-2xl font-semibold text-dark-brown mb-2">Тарифы</h2>
          <p className="text-gray-brown mb-4 text-sm md:text-base">
            {monthly.priceLabel} или {yearly.priceLabel}. Наполнение одно. Скрытых доплат нет.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article className="bg-light-text border border-light-sandy rounded-2xl p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-terracotta mb-2">{monthly.shortTitle}</h3>
              <p className="text-gray-brown mb-4">{monthly.description}</p>
              <ul className="mb-4 space-y-2 text-sm text-dark-brown">
                {monthly.includes.map((item) => (
                  <li key={item} className="relative pl-4">
                    <span className="absolute left-0 text-olive-green">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-2xl font-bold text-olive-green mb-4">{monthly.priceLabel}</p>
              <Link
                to={monthly.checkoutPath}
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
                onClick={() => analyticsEvents.ctaClick('Оформить месячный тариф', 'club_page')}
              >
                {monthly.ctaLabel}
              </Link>
            </article>
            <article className="bg-light-text border border-terracotta/35 rounded-2xl p-6 shadow-sm">
              <p className="text-xs text-terracotta font-semibold mb-2">На 12 000 ₽ меньше за год</p>
              <h3 className="text-xl font-semibold text-terracotta mb-2">{yearly.shortTitle}</h3>
              <p className="text-gray-brown mb-4">{yearly.description}</p>
              <ul className="mb-4 space-y-2 text-sm text-dark-brown">
                {yearly.includes.map((item) => (
                  <li key={item} className="relative pl-4">
                    <span className="absolute left-0 text-olive-green">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-2xl font-bold text-olive-green mb-4">{yearly.priceLabel}</p>
              <Link
                to={yearly.checkoutPath}
                className="inline-flex items-center justify-center min-h-[44px] px-5 py-3 rounded-lg bg-terracotta text-light-text hover:bg-golden-sandy transition-colors"
                onClick={() => analyticsEvents.ctaClick('Оформить годовой тариф', 'club_page')}
              >
                {yearly.ctaLabel}
              </Link>
            </article>
          </div>
        </section>

        <section className="bg-cream border border-light-sandy rounded-2xl p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-dark-brown mb-4">Частые вопросы</h2>
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
            <h2 className="text-2xl font-semibold text-dark-brown mb-2">{accent.ctaHint}</h2>
            <p className="text-gray-brown">
              Сравните месяц и год или напишите в Telegram. {CLUB_SUPPORT.sla}
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
                analyticsEvents.ctaClick('Написать в Telegram', 'club_page');
                analyticsEvents.telegramClick('starovoitovae', 'club_page_consultation');
              }}
            >
              Написать в Telegram
            </a>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default Club;

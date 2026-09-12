import React from 'react';
import { SectionHeader } from '../../components/ui';
import { CLUB_SUPPORT } from '../../config/clubContent';
import { analyticsEvents } from '../../utils/analytics';

const Support: React.FC = () => {
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Кабинет"
        title="Поддержка"
        subtitle="Короткий путь: Telegram в рабочие часы. Ответ — в тот же день."
      />

      <section className="space-y-4 rounded-card border border-light-sandy bg-light-text p-6 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-terracotta">
          Когда отвечаем
        </p>
        <p className="font-display text-2xl font-semibold text-dark-brown">10:00–22:00 МСК</p>
        <p className="text-gray-brown">{CLUB_SUPPORT.sla}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={CLUB_SUPPORT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-touch items-center justify-center rounded-soft bg-olive-green px-5 font-medium text-light-text shadow-soft hover:opacity-95"
            onClick={() => {
              analyticsEvents.ctaClick('telegram_support', 'account_support');
              analyticsEvents.telegramClick('starovoitovae', 'account_support');
            }}
          >
            Написать в Telegram · {CLUB_SUPPORT.telegramHandle}
          </a>
          <a
            href={`mailto:${CLUB_SUPPORT.email}`}
            className="inline-flex min-h-touch items-center justify-center rounded-soft border border-terracotta px-5 font-medium text-terracotta hover:bg-cream"
          >
            {CLUB_SUPPORT.email}
          </a>
        </div>
      </section>

      <section className="rounded-card border border-light-sandy bg-cream p-6">
        <h2 className="mb-4 font-display text-xl font-semibold text-dark-brown">Частые вопросы</h2>
        <ul className="space-y-4">
          {CLUB_SUPPORT.faq.map((item) => (
            <li key={item.q}>
              <h3 className="font-semibold text-dark-brown">{item.q}</h3>
              <p className="mt-1 text-sm text-gray-brown">{item.a}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Support;

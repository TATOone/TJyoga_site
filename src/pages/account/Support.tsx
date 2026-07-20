import React from 'react';
import { CLUB_SUPPORT } from '../../config/clubContent';
import { analyticsEvents } from '../../utils/analytics';

const Support: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-brown mb-2">Поддержка</h1>
        <p className="text-gray-brown">Telegram, email и ответы на частые вопросы.</p>
      </div>
      <section className="bg-light-text border border-light-sandy rounded-2xl p-6 space-y-3">
        <h2 className="text-xl font-semibold text-dark-brown">Связаться с поддержкой</h2>
        <p className="text-gray-brown">{CLUB_SUPPORT.sla}</p>
        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={CLUB_SUPPORT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center justify-center px-4 rounded-lg bg-olive-green text-light-text"
            onClick={() => analyticsEvents.telegramClick('starovoitovae', 'account_support')}
          >
            Написать в Telegram
          </a>
          <a
            href={`mailto:${CLUB_SUPPORT.email}`}
            className="inline-flex min-h-[44px] items-center justify-center px-4 rounded-lg border border-terracotta text-terracotta"
          >
            {CLUB_SUPPORT.email}
          </a>
        </div>
      </section>

      <section className="bg-cream border border-light-sandy rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-dark-brown mb-4">FAQ</h2>
        <ul className="space-y-4">
          {CLUB_SUPPORT.faq.map((item) => (
            <li key={item.q}>
              <h3 className="font-semibold text-dark-brown">{item.q}</h3>
              <p className="text-sm text-gray-brown mt-1">{item.a}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Support;

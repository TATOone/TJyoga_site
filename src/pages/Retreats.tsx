import React from 'react';
import Countdown from '../components/Countdown';
import PublicPageLayout from '../components/PublicPageLayout';
import { PRODUCTS } from '../config/products';
import {
  RETREAT_BOOKING_HANDLE,
  RETREAT_BOOKING_URL,
  RETREAT_DATES_LABEL,
  RETREAT_NAME,
  RETREAT_START,
} from '../config/retreat';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const Retreats: React.FC = () => {
  usePageMeta('retreats');

  const retreat = PRODUCTS['retreat-pass'];

  return (
    <PublicPageLayout
      title={RETREAT_NAME}
      subtitle={`${RETREAT_DATES_LABEL} 2027, эко-отель в Налибокской пуще. Трансфер из Минска.`}
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <img
            src={retreat.image}
            alt={RETREAT_NAME}
            className="w-full h-full max-h-[420px] object-cover rounded-2xl shadow-sm"
            loading="lazy"
          />
          <div className="bg-cream border border-light-sandy rounded-2xl p-6">
            <h2 className="text-2xl font-semibold text-dark-brown mb-3">Что вас ждёт</h2>
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
            <p className="text-2xl font-bold text-olive-green mb-3">{retreat.priceLabel}</p>
            <p className="text-dark-brown mb-5">
              Одноместное проживание 57 000 ₽. Чтобы записаться, напишите Жене в Telegram:{' '}
              <a
                href={RETREAT_BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta underline underline-offset-2 hover:text-golden-sandy"
                onClick={() => {
                  analyticsEvents.ctaClick('Запись на ретрит', 'retreats_page');
                  analyticsEvents.telegramClick('starovoitovae', 'retreats_page');
                }}
              >
                {RETREAT_BOOKING_HANDLE}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default Retreats;

import React from 'react';
import PublicPageLayout from '../components/PublicPageLayout';
import { PRODUCTS } from '../config/products';
import {
  RETREAT_CHANNEL_HANDLE,
  RETREAT_CHANNEL_URL,
  RETREAT_NAME,
} from '../config/retreat';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const Retreats: React.FC = () => {
  usePageMeta('retreats');

  const retreat = PRODUCTS['retreat-pass'];

  return (
    <PublicPageLayout title={RETREAT_NAME} subtitle="Практика, природа и хорошие люди рядом.">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <img
            src={retreat.image}
            alt={RETREAT_NAME}
            className="w-full h-full max-h-[420px] object-cover rounded-2xl shadow-sm"
            loading="lazy"
          />
          <div className="bg-cream border border-light-sandy rounded-2xl p-6">
            <p className="text-gray-brown mb-4">{retreat.details}</p>
            {retreat.includes.length > 0 ? (
              <ul className="space-y-2 text-dark-brown mt-4 mb-6">
                {retreat.includes.map((item) => (
                  <li key={item} className="pl-4 relative">
                    <span className="absolute left-0 text-olive-ink">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="text-dark-brown mb-5">
              Чтобы первыми узнать о новом ретрите, подпишитесь на наш канал{' '}
              <a
                href={RETREAT_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-terracotta-ink underline underline-offset-2 hover:text-terracotta-ink-hover"
                onClick={() => {
                  analyticsEvents.ctaClick('Канал ретритов', 'retreats_page');
                  analyticsEvents.telegramClick('TJyogatrip', 'retreats_page');
                }}
              >
                {RETREAT_CHANNEL_HANDLE}
              </a>
              .
            </p>
            <p className="text-dark-brown">В красоте и спокойствии.</p>
            <p className="mt-1 font-semibold text-dark-brown">Ваши Тим и Женя</p>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
};

export default Retreats;

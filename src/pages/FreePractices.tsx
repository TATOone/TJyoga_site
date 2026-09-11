import React from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import YouTubeLiteEmbed from '../components/YouTubeLiteEmbed';
import {
  FREE_PRACTICE_VIDEOS,
  YOUTUBE_CHANNEL_HANDLE,
  YOUTUBE_CHANNEL_URL,
} from '../config/freePractices';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const FreePractices: React.FC = () => {
  usePageMeta('free');

  return (
    <PublicPageLayout
      title="Бесплатные практики"
      subtitle="Три занятия с YouTube-канала TJ Yoga. Можно смотреть здесь — кабинет не нужен."
      eyebrow="YouTube"
    >
      <div className="mx-auto w-full min-w-0 max-w-3xl space-y-10">
        <ol className="space-y-8">
          {FREE_PRACTICE_VIDEOS.map((video, index) => (
            <li key={video.id} className="min-w-0 space-y-3">
              <h2 className="text-xl font-semibold text-dark-brown md:text-2xl">
                <span className="sr-only">{index + 1}. </span>
                {video.title}
              </h2>
              <YouTubeLiteEmbed video={video} />
            </li>
          ))}
        </ol>

        <p className="text-center text-gray-brown">
          <a
            href={YOUTUBE_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center font-medium text-terracotta transition-colors hover:text-golden-sandy"
            onClick={() => analyticsEvents.ctaClick('Канал YouTube', 'free_practices')}
          >
            Канал {YOUTUBE_CHANNEL_HANDLE} на YouTube
          </a>
        </p>

        <section className="rounded-2xl bg-light-olive p-6 md:p-8">
          <h2 className="mb-2 text-2xl font-semibold text-dark-brown">В онлайн-клуб</h2>
          <p className="mb-5 text-gray-brown">
            Живые эфиры, записи и чат — в клубе. Как устроен формат и тарифы, можно посмотреть
            отдельно.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/club"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-terracotta px-5 py-3 text-terracotta transition-colors hover:bg-cream"
              onClick={() => analyticsEvents.ctaClick('Как устроен клуб', 'free_practices')}
            >
              Как устроен клуб
            </Link>
            <Link
              to="/club/rates"
              className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-terracotta px-5 py-3 text-light-text transition-colors hover:bg-golden-sandy"
              onClick={() => analyticsEvents.ctaClick('Тарифы', 'free_practices')}
            >
              Тарифы
            </Link>
          </div>
        </section>
      </div>
    </PublicPageLayout>
  );
};

export default FreePractices;

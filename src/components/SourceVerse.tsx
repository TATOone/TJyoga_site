import React, { Suspense, lazy } from 'react';
import { QUOTE_PADMASANA_POSTER } from '../config/media';
import { HOME_SOURCE_VERSE } from '../config/sourceVerse';

const QuotePadmasana = lazy(() => import('./QuotePadmasana'));

const FIGURE_CLASS = 'mb-4 w-[75%] max-w-[390px] sm:mb-5 md:mb-6';

const QuotePadmasanaFallback: React.FC = () => (
  <div
    className={`quote-padmasana quote-padmasana--fade ${FIGURE_CLASS}`}
    aria-hidden="true"
  >
    <img
      src={QUOTE_PADMASANA_POSTER}
      alt=""
      width={960}
      height={540}
      decoding="async"
      draggable={false}
    />
  </div>
);

const SourceVerse: React.FC = () => {
  const verse = HOME_SOURCE_VERSE;
  const quoteId = `${verse.id}-quote`;

  return (
    <section
      id="source-verse"
      className="source-verse py-16 md:py-24"
      aria-labelledby={quoteId}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <Suspense fallback={<QuotePadmasanaFallback />}>
            <QuotePadmasana className={FIGURE_CLASS} />
          </Suspense>
          <blockquote className="w-full">
            <p
              id={quoteId}
              lang={verse.lang}
              className="font-display text-dark-brown text-2xl leading-snug sm:text-3xl md:text-[2.15rem] md:leading-[1.35]"
            >
              {verse.quote}
            </p>
            <footer className="mt-5">
              <cite className="not-italic text-sm leading-relaxed text-gray-brown md:text-[0.95rem]">
                {verse.citation}
              </cite>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
};

export default SourceVerse;

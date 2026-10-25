import React from 'react';
import { QUOTE_PADMASANA_LOOP } from '../config/media';
import { HOME_SOURCE_VERSE } from '../config/sourceVerse';
import AmbientLoopVideo from './AmbientLoopVideo';

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
          <AmbientLoopVideo
            webmSrc={QUOTE_PADMASANA_LOOP.webm}
            mp4Src={QUOTE_PADMASANA_LOOP.mp4}
            posterSrc={QUOTE_PADMASANA_LOOP.poster}
            className="mb-6 w-full max-w-[520px] sm:mb-8 md:mb-10"
          />
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

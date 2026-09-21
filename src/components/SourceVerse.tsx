import React from 'react';
import { HOME_SOURCE_VERSE } from '../config/sourceVerse';

const SourceVerse: React.FC = () => {
  const verse = HOME_SOURCE_VERSE;
  const quoteId = `${verse.id}-quote`;

  return (
    <section
      id="source-verse"
      className="bg-light-olive py-16 md:py-20"
      aria-labelledby={quoteId}
    >
      <div className="container mx-auto px-4">
        <blockquote className="mx-auto max-w-3xl text-center">
          <p
            id={quoteId}
            lang={verse.lang}
            className="font-display text-dark-brown text-2xl leading-snug sm:text-3xl md:text-[2.15rem] md:leading-[1.35]"
          >
            {verse.quote}
          </p>
          <footer className="mt-5">
            <cite
              className="not-italic text-sm leading-relaxed text-gray-brown md:text-[0.95rem]"
            >
              {verse.citation}
            </cite>
          </footer>
        </blockquote>
      </div>
    </section>
  );
};

export default SourceVerse;

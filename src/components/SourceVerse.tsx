import React from 'react';
import { HOME_SOURCE_VERSE } from '../config/sourceVerse';

const SourceVerse: React.FC = () => {
  const verse = HOME_SOURCE_VERSE;
  const citationId = `${verse.id}-citation`;

  return (
    <section
      id="source-verse"
      className="bg-light-olive py-16 md:py-20"
      aria-labelledby={citationId}
    >
      <div className="container mx-auto px-4">
        <blockquote className="mx-auto max-w-3xl text-center">
          <div
            lang={verse.lang}
            className="font-devanagari text-dark-brown text-[1.35rem] leading-[1.95] sm:text-2xl md:text-[1.85rem] md:leading-[2.05]"
          >
            {verse.lines.map((line) => (
              <p key={line} className="mb-1 last:mb-0">
                {line}
              </p>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-gray-brown md:text-base">
            {verse.gloss}
          </p>
          <footer className="mt-5">
            <cite
              id={citationId}
              className="not-italic text-sm font-medium tracking-wide text-olive-green"
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

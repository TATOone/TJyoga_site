import React from 'react';

type SectionLoaderVariant = 'section' | 'cards' | 'footer';

interface SectionLoaderProps {
  variant?: SectionLoaderVariant;
}

const skeletonCardClass =
  'min-h-[7.5rem] rounded-xl border border-light-sandy bg-light-text shadow-soft';

const SectionLoader: React.FC<SectionLoaderProps> = ({ variant = 'section' }) => {
  switch (variant) {
    case 'footer':
      return (
        <div
          className="flex min-h-[12rem] items-center justify-center bg-dark-brown px-4 py-10"
          role="status"
          aria-live="polite"
        >
          <p className="animate-pulse text-cream">Загрузка…</p>
        </div>
      );
    case 'cards':
      return (
        <section
          className="min-h-[20rem] bg-cream py-16"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="container mx-auto px-4">
            <p className="mb-8 text-center text-dark-brown">Загрузка…</p>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              <div className={`${skeletonCardClass} animate-pulse`} />
              <div className={`${skeletonCardClass} animate-pulse [animation-delay:120ms]`} />
              <div className={`${skeletonCardClass} animate-pulse [animation-delay:240ms]`} />
            </div>
          </div>
        </section>
      );
    case 'section':
      return (
        <section
          className="flex min-h-[16rem] items-center justify-center bg-cream px-4 py-16"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <p className="animate-pulse text-center text-dark-brown">Загрузка…</p>
        </section>
      );
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
};

export default SectionLoader;

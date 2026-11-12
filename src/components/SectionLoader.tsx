import React from 'react';
import { Skeleton } from './ui/Skeleton';

type SectionLoaderVariant = 'section' | 'cards' | 'footer';

interface SectionLoaderProps {
  variant?: SectionLoaderVariant;
}

const SectionLoader: React.FC<SectionLoaderProps> = ({ variant = 'section' }) => {
  switch (variant) {
    case 'footer':
      return (
        <div
          className="flex min-h-[12rem] items-center justify-center bg-dark-brown px-4 py-10"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <span className="sr-only">Загрузка…</span>
          <div className="w-full max-w-5xl space-y-3">
            <Skeleton className="mx-auto h-5 w-32 bg-footer-muted/30" />
            <Skeleton className="mx-auto h-4 w-64 bg-footer-muted/20" />
            <Skeleton className="mx-auto h-4 w-48 bg-footer-muted/20" />
          </div>
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
          <span className="sr-only">Загрузка…</span>
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
              <Skeleton className="min-h-[7.5rem] rounded-2xl border border-light-sandy bg-light-text" />
              <Skeleton className="min-h-[7.5rem] rounded-2xl border border-light-sandy bg-light-text [animation-delay:120ms]" />
              <Skeleton className="min-h-[7.5rem] rounded-2xl border border-light-sandy bg-light-text [animation-delay:240ms]" />
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
          <span className="sr-only">Загрузка…</span>
          <div className="w-full max-w-3xl space-y-3">
            <Skeleton className="mx-auto h-8 w-48" />
            <Skeleton className="mx-auto h-4 w-full max-w-md" />
            <Skeleton className="mx-auto h-4 w-2/3" />
          </div>
        </section>
      );
    default: {
      const _exhaustive: never = variant;
      return _exhaustive;
    }
  }
};

export default SectionLoader;

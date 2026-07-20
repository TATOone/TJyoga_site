import React from 'react';
import PublicPageLayout from './PublicPageLayout';
import { LEGAL_BASELINE_VERSION, LEGAL_EFFECTIVE_FROM } from '../config/legalDocuments';

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <PublicPageLayout title={title} subtitle={subtitle}>
      <article className="max-w-4xl mx-auto bg-light-text border border-light-sandy rounded-2xl p-6 md:p-8 space-y-5 text-dark-brown">
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide text-gray-brown">
          <span className="bg-cream px-3 py-1 rounded-full border border-light-sandy">
            Версия {LEGAL_BASELINE_VERSION}
          </span>
          <span className="bg-cream px-3 py-1 rounded-full border border-light-sandy">
            Действует с {LEGAL_EFFECTIVE_FROM}
          </span>
        </div>
        {children}
      </article>
    </PublicPageLayout>
  );
};

export default LegalPageLayout;

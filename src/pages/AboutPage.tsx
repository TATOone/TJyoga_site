import React, { Suspense, lazy } from 'react';
import PublicPageLayout from '../components/PublicPageLayout';
import { usePageMeta } from '../utils/usePageMeta';

const About = lazy(() => import('../components/About'));
const Testimonials = lazy(() => import('../components/Testimonials'));

const AboutPage: React.FC = () => {
  usePageMeta('about');

  return (
    <PublicPageLayout
      title="О проекте TJ Yoga"
      subtitle="Классическая хатха-йога из первоисточников и бережный подход к практике."
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <Suspense fallback={<div className="py-8 text-center text-gray-brown">Загрузка...</div>}>
          <About />
        </Suspense>
        <Suspense fallback={<div className="py-8 text-center text-gray-brown">Загрузка...</div>}>
          <Testimonials />
        </Suspense>
      </div>
    </PublicPageLayout>
  );
};

export default AboutPage;

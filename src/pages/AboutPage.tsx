import React, { Suspense, lazy } from 'react';
import PublicPageLayout from '../components/PublicPageLayout';
import SectionLoader from '../components/SectionLoader';
import { usePageMeta } from '../utils/usePageMeta';

const About = lazy(() => import('../components/About'));
const Testimonials = lazy(() => import('../components/Testimonials'));

const AboutPage: React.FC = () => {
  usePageMeta('about');

  return (
    <PublicPageLayout
      title="О нас"
      subtitle="Мы, Женя и Тим, преподаём классическую хатха-йогу из первоисточников. Тепло, живо, из традиции нашей школы."
    >
      <div className="max-w-6xl mx-auto space-y-8">
        <Suspense fallback={<SectionLoader variant="cards" />}>
          <About />
        </Suspense>
        <Suspense fallback={<SectionLoader variant="cards" />}>
          <Testimonials />
        </Suspense>
      </div>
    </PublicPageLayout>
  );
};

export default AboutPage;

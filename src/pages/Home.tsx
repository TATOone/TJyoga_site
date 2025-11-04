import React, { Suspense, lazy } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';

// Lazy load components that are below the fold
const About = lazy(() => import('../components/About'));
const Services = lazy(() => import('../components/Services'));
const ForWhom = lazy(() => import('../components/ForWhom'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const Blog = lazy(() => import('../components/Blog'));
const CTA = lazy(() => import('../components/CTA'));
const Footer = lazy(() => import('../components/Footer'));

// Loading fallback component
const SectionLoader: React.FC = () => (
  <div className="py-16 flex items-center justify-center">
    <div className="animate-pulse text-gray-brown">Загрузка...</div>
  </div>
);

const Home: React.FC = () => {
  return (
    <div>
      <Header />
      <main>
        <Hero />
        <Suspense fallback={<SectionLoader />}>
          <About />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Services />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ForWhom />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <Blog />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <CTA />
        </Suspense>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </main>
    </div>
  );
};

export default Home;
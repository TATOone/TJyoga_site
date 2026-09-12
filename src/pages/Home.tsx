import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import StickyFunnelCta from '../components/StickyFunnelCta';
import { getActiveAccent } from '../config/campaignAccent';
import { PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const About = lazy(() => import('../components/About'));
const Services = lazy(() => import('../components/Services'));
const ForWhom = lazy(() => import('../components/ForWhom'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const Blog = lazy(() => import('../components/Blog'));
const CTA = lazy(() => import('../components/CTA'));
const Footer = lazy(() => import('../components/Footer'));

const SectionLoader: React.FC = () => (
  <div className="py-16 flex items-center justify-center">
    <div className="animate-pulse text-gray-brown">Загрузка...</div>
  </div>
);

const Home: React.FC = () => {
  usePageMeta('home');
  const accent = getActiveAccent();
  const monthly = PRODUCTS['club-monthly'];
  const yearly = PRODUCTS['club-yearly'];

  const quickLinks = [
    {
      title: 'Йога-Клуб',
      description: 'Эфиры, записи, уровни и чат с преподавателем — как устроена неделя.',
      to: '/club',
      cta: 'Как устроен клуб',
    },
    {
      title: 'Тарифы',
      description: `${monthly.priceLabel} или ${yearly.priceLabel}. Одно наполнение, цена без доплат.`,
      to: '/club/rates',
      cta: 'Выбрать тариф',
    },
    {
      title: 'Как оформить',
      description: 'Оплата, когда откроется кабинет и куда писать, если доступ не пришёл.',
      to: '/how-to-buy',
      cta: 'Как проходит оплата',
    },
  ];

  return (
    <div>
      <Header />
      <main>
        <Hero />
        <Suspense fallback={<SectionLoader />}>
          <Services />
        </Suspense>
        <section id="club-entry" className="py-16 bg-light-text">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-dark-brown mb-4">
              Клуб — основной формат
            </h2>
            <p className="text-center text-gray-brown max-w-3xl mx-auto mb-10">{accent.homeEmphasis}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickLinks.map((item) => (
                <article key={item.to} className="bg-cream border border-light-sandy rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-terracotta mb-2">{item.title}</h3>
                  <p className="text-dark-brown mb-5">{item.description}</p>
                  <Link
                    to={item.to}
                    className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-lg border border-terracotta text-terracotta hover:bg-light-text transition-colors"
                    onClick={() => analyticsEvents.ctaClick(item.cta, 'home_club_entry')}
                  >
                    {item.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section id="how-it-works" className="py-16 bg-cream">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-dark-brown mb-10">
              Как присоединиться
            </h2>
            <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { step: '1', title: 'Тариф', text: 'Месяц или год — одно и то же наполнение клуба.' },
                { step: '2', title: 'Оплата', text: 'Картой через защищённую форму. Цена как на сайте.' },
                { step: '3', title: 'Кабинет', text: 'Доступ открывается сам, обычно за несколько минут.' },
                { step: '4', title: 'Практика', text: 'Zoom, записи и чат — всё в одном месте.' },
              ].map((item) => (
                <li
                  key={item.step}
                  className="bg-light-text border border-light-sandy rounded-2xl p-5 text-center"
                >
                  <p className="text-terracotta font-bold text-2xl mb-2">{item.step}</p>
                  <h3 className="font-semibold text-dark-brown mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-brown">{item.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
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
        <Suspense fallback={<SectionLoader />}>
          <About />
        </Suspense>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </main>
      <StickyFunnelCta />
    </div>
  );
};

export default Home;

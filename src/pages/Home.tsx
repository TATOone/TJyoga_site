import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Hero from '../components/Hero';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

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
  usePageMeta('home');

  const quickLinks = [
    {
      title: 'Йога-Клуб',
      description: 'Формат, наполнение и преимущества клубной практики.',
      to: '/club',
      cta: 'Смотреть клуб',
    },
    {
      title: 'Тарифы',
      description: 'Месячная и годовая подписка в одном checkout-потоке.',
      to: '/club/rates',
      cta: 'Выбрать тариф',
    },
    {
      title: 'Как купить',
      description: 'Пошаговый сценарий оплаты, получения доступа и поддержки.',
      to: '/how-to-buy',
      cta: 'Изучить процесс',
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
              Быстрый вход в Йога-Клуб
            </h2>
            <p className="text-center text-gray-brown max-w-3xl mx-auto mb-10">
              Мы перевели ключевой путь в отдельные страницы клуба, тарифов и покупки, чтобы вы сразу
              попадали в нужный сценарий без лишних шагов.
            </p>
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
              Как это работает
            </h2>
            <ol className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              {[
                { step: '1', title: 'Регистрация', text: 'Создайте аккаунт в кабинете.' },
                { step: '2', title: 'Оплата', text: 'Выберите тариф и оплатите через Prodamus.' },
                { step: '3', title: 'Доступ', text: 'Webhook активирует подписку автоматически.' },
                { step: '4', title: 'Практика', text: 'Zoom, записи и статьи — в кабинете.' },
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
    </div>
  );
};

export default Home;
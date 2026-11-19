import React, { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import PublicPageLayout from '../components/PublicPageLayout';
import SectionLoader from '../components/SectionLoader';
import { FREE_CTA_LABEL, FREE_PAGE_PATH } from '../config/freePractices';
import { IMAGES } from '../config/images';
import { analyticsEvents } from '../utils/analytics';
import { usePageMeta } from '../utils/usePageMeta';

const Testimonials = lazy(() => import('../components/Testimonials'));

const AboutPage: React.FC = () => {
  usePageMeta('about');

  return (
    <PublicPageLayout
      title="О нас"
      subtitle="Мы Тим и Женя, практикуем и преподаём классическую хатха-йогу."
    >
      <div className="max-w-3xl mx-auto space-y-8">
        <img
          src={IMAGES.about.teachers}
          alt={IMAGES.about.alt}
          className="w-full h-auto rounded-lg shadow-lg"
          loading="lazy"
          width="800"
          height="600"
          decoding="async"
        />
        <div className="space-y-4 text-dark-brown leading-relaxed">
          <p>Онлайн-клуб классической хатха-йоги, который мы ведём вживую.</p>
          <p>
            Мы - Тим и Женя. Практикуем и преподаём классическую хатха-йогу школы Патанджали и ведём
            онлайн-клуб TJ Yoga.
          </p>
          <p>
            Хатха-йоге мы учились у наших учителей в ашраме в Ришикеше и получили там сертификаты.
            Учёба на этом не закончилась: сейчас мы проходим более продвинутый курс онлайн и дальше
            тоже будем учиться.
          </p>
          <p>
            Мы и сами практикуем со своими учителями. По себе знаем: практика становится регулярнее,
            когда есть опора. Поэтому в клубе мы занимаемся с вами вживую в Zoom, видим вас и
            направляем. А если не получилось прийти, занятие можно посмотреть в записи.
          </p>
          <p>
            В нашей школе у каждой асаны есть базовая форма или вариант, который подойдёт вашему
            уровню практики. Поэтому к нам можно прийти с любым опытом, в том числе с нуля.
          </p>
          <p>
            <strong>Женя Старовойтова</strong> - основной преподаватель. Практикует больше 10 лет,
            преподаёт больше 5 лет и ведёт практики в клубе.
          </p>
          <p>
            <strong>Тим</strong> - помощник преподавателя. Практикует больше 5 лет и ведёт
            йога-зарядку по понедельникам.
          </p>
          <p>Мы активные и энергичные, во многом благодаря йоге. Приходите практиковать вместе с нами 🌷</p>
          <p className="italic">Тим и Женя</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to="/club/rates"
            className="cta-primary px-5"
            onClick={() => analyticsEvents.ctaClick('Выбрать тариф', 'about_page')}
          >
            Выбрать тариф
          </Link>
          <Link
            to={FREE_PAGE_PATH}
            className="cta-secondary px-5"
            onClick={() => analyticsEvents.ctaClick(FREE_CTA_LABEL, 'about_page')}
          >
            {FREE_CTA_LABEL}
          </Link>
        </div>
        <Suspense fallback={<SectionLoader variant="cards" />}>
          <Testimonials />
        </Suspense>
      </div>
    </PublicPageLayout>
  );
};

export default AboutPage;

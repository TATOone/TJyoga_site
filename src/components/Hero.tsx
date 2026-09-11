import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getActiveAccent } from '../config/campaignAccent';
import { FREE_CTA_LABEL, FREE_PAGE_PATH } from '../config/freePractices';
import { IMAGES } from '../config/images';
import { analyticsEvents } from '../utils/analytics';

const Hero: React.FC = () => {
  const [imageError, setImageError] = React.useState(false);
  const accent = getActiveAccent();

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center bg-cream">
      {!imageError && (
        <img
          src={IMAGES.hero.main}
          alt={IMAGES.hero.alt}
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          loading="eager"
          fetchPriority="high"
          width="1920"
          height="1080"
          decoding="async"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
          onError={(e) => {
            console.error('Hero image failed to load:', IMAGES.hero.main);
            setImageError(true);
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
      )}
      <div className="relative z-10 text-center px-4 max-w-4xl">
        <motion.p
          className="text-sm md:text-base text-terracotta font-semibold mb-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {accent.heroEyebrow}
        </motion.p>
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-dark-brown mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {accent.heroHeadline}
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-dark-brown mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {accent.heroSubhead}
        </motion.p>
        <motion.ul
          className="flex flex-wrap justify-center gap-3 mb-8 text-sm md:text-base text-dark-brown"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <li className="bg-cream/90 border border-light-sandy rounded-full px-3 py-1">Живые практики + записи</li>
          <li className="bg-cream/90 border border-light-sandy rounded-full px-3 py-1">Уровни на виду</li>
          <li className="bg-cream/90 border border-light-sandy rounded-full px-3 py-1">Преподаватель в чате</li>
        </motion.ul>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link
            to="/club/rates"
            className="bg-terracotta text-light-text px-6 py-3 rounded-lg hover:bg-golden-sandy transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta min-h-[44px] inline-flex items-center justify-center font-medium"
            aria-label="Выбрать тариф Йога-Клуба"
            onClick={() => {
              analyticsEvents.ctaClick('Выбрать тариф', 'hero');
            }}
          >
            Выбрать тариф
          </Link>
          <Link
            to={FREE_PAGE_PATH}
            className="border border-terracotta text-terracotta px-6 py-3 rounded-lg hover:bg-cream transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta min-h-[44px] inline-flex items-center justify-center font-medium"
            aria-label="Посмотреть бесплатные практики на YouTube"
            onClick={() => {
              analyticsEvents.ctaClick(FREE_CTA_LABEL, 'hero');
            }}
          >
            {FREE_CTA_LABEL}
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
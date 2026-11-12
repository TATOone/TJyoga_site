import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getActiveAccent } from '../config/campaignAccent';
import { FREE_CTA_LABEL, FREE_PAGE_PATH } from '../config/freePractices';
import { IMAGES } from '../config/images';
import { EASE_OUT_QUART } from '../lib/motion';
import { analyticsEvents } from '../utils/analytics';

const HERO_CHIPS = [
  'Йога из первоисточников',
  'Структура практики',
  'Поддержка от преподавателя',
] as const;

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
          className="text-sm md:text-base text-terracotta-ink font-semibold mb-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE_OUT_QUART }}
        >
          {accent.heroEyebrow}
        </motion.p>
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-dark-brown mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_QUART }}
        >
          {accent.heroHeadline}
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-dark-brown mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE_OUT_QUART }}
        >
          {accent.heroSubhead}
        </motion.p>
        <motion.ul
          className="flex flex-wrap justify-center gap-3 mb-8 text-sm md:text-base text-dark-brown"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: EASE_OUT_QUART }}
        >
          {HERO_CHIPS.map((chip) => (
            <li
              key={chip}
              className="bg-cream/90 border border-light-sandy rounded-full px-3 py-1"
            >
              {chip}
            </li>
          ))}
        </motion.ul>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: EASE_OUT_QUART }}
        >
          <Link
            to="/club/rates"
            className="cta-primary px-6"
            aria-label="Выбрать тариф клуба"
            data-hero-primary-cta=""
            onClick={() => {
              analyticsEvents.ctaClick('Выбрать тариф', 'hero');
            }}
          >
            Выбрать тариф
          </Link>
          <Link
            to={FREE_PAGE_PATH}
            className="cta-secondary px-6"
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
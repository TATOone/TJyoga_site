import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IMAGES } from '../config/images';
import { analyticsEvents } from '../utils/analytics';


const Hero: React.FC = () => {
  const [imageError, setImageError] = React.useState(false);

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
          className="text-sm md:text-base uppercase tracking-wide text-terracotta font-semibold mb-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Йога-Клуб TJ Yoga
        </motion.p>
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-dark-brown mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Регулярная хатха-практика с поддержкой преподавателя
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-dark-brown mb-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Прямые эфиры в Zoom, библиотека записей, клубные статьи и сообщество — всё в одном доступе
        </motion.p>
        <motion.ul
          className="flex flex-wrap justify-center gap-3 mb-8 text-sm md:text-base text-dark-brown"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <li className="bg-cream/90 border border-light-sandy rounded-full px-3 py-1">3+ практики в неделю</li>
          <li className="bg-cream/90 border border-light-sandy rounded-full px-3 py-1">Zoom без копируемой ссылки</li>
          <li className="bg-cream/90 border border-light-sandy rounded-full px-3 py-1">Записи Kinescope</li>
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
            to="/club"
            className="border border-terracotta text-terracotta px-6 py-3 rounded-lg hover:bg-cream transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta min-h-[44px] inline-flex items-center justify-center font-medium"
            aria-label="Посмотреть, что внутри клуба"
            onClick={() => {
              analyticsEvents.ctaClick('Что внутри клуба', 'hero');
            }}
          >
            Посмотреть, что внутри
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
import React from 'react';
import { motion } from 'framer-motion';
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
        <motion.h1
          className="text-4xl md:text-6xl font-bold text-dark-brown mb-4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Хатха Йога из первоисточников
        </motion.h1>
        <motion.p
          className="text-lg md:text-xl text-dark-brown mb-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Древние знания для современной жизни. Онлайн-клуб, ретриты и персональные занятия с семьёй йогов
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <a
            href="https://payform.ru/t5a23mO/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-terracotta text-light-text px-6 py-3 rounded-lg hover:bg-golden-sandy transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta"
            aria-label="Присоединиться к йога-клубу"
            onClick={() => {
              analyticsEvents.ctaClick('Присоединиться к йога-клубу', 'hero');
            }}
          >
            Присоединиться к йога-клубу
          </a>
          <a
            href="https://t.me/starovoitovae"
            className="border border-terracotta text-terracotta px-6 py-3 rounded-lg hover:bg-cream transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta"
            aria-label="Бесплатная консультация"
            onClick={() => {
              analyticsEvents.ctaClick('Бесплатная консультация', 'hero');
              analyticsEvents.telegramClick('starovoitovae', 'hero_consultation');
            }}
          >
            Бесплатная консультация
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
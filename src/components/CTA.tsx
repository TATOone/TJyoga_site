import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getActiveAccent } from '../config/campaignAccent';
import { CLUB_SUPPORT } from '../config/clubContent';
import { PRODUCTS } from '../config/products';
import { useSectionInView } from '../hooks/useSectionInView';
import { REVEAL_HIDDEN, REVEAL_VISIBLE, revealTransition } from '../lib/motion';
import { analyticsEvents } from '../utils/analytics';

const CTA: React.FC = () => {
  const { ref, isInView } = useSectionInView();
  const accent = getActiveAccent();
  const monthly = PRODUCTS['club-monthly'];
  const yearly = PRODUCTS['club-yearly'];

  return (
    <section id="cta" className="py-16 bg-cream">
      <div className="container mx-auto px-4 text-center">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-dark-brown mb-4"
          ref={ref}
          initial={REVEAL_HIDDEN}
          animate={isInView ? REVEAL_VISIBLE : {}}
          transition={revealTransition()}
        >
          {accent.ctaHint}
        </motion.h2>
        <motion.p
          className="text-lg text-dark-brown mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={revealTransition(0.12)}
        >
          {monthly.priceLabel} или {yearly.priceLabel}. Если есть вопрос - напишите нам.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={REVEAL_HIDDEN}
          animate={isInView ? REVEAL_VISIBLE : {}}
          transition={revealTransition(0.2)}
        >
          <Link
            to="/club/rates"
            className="cta-primary px-6"
            aria-label="Выбрать тариф клуба"
            onClick={() => {
              analyticsEvents.ctaClick('Выбрать тариф', 'cta');
            }}
          >
            Выбрать тариф
          </Link>
          <a
            href={CLUB_SUPPORT.telegram}
            className="cta-secondary px-6"
            aria-label="Написать преподавателю в Telegram"
            onClick={() => {
              analyticsEvents.ctaClick('Написать в Telegram', 'cta');
              analyticsEvents.telegramClick('starovoitovae', 'cta_write');
            }}
          >
            Написать в Telegram
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;

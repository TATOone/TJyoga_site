import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getActiveAccent } from '../config/campaignAccent';
import { PRODUCTS } from '../config/products';
import { useSectionInView } from '../hooks/useSectionInView';
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
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {accent.ctaHint}
        </motion.h2>
        <motion.p
          className="text-lg text-dark-brown mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {monthly.priceLabel} или {yearly.priceLabel}. Если остался вопрос про тело или формат —
          напишите, не нужно решать это в одиночку.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/club/rates"
            className="bg-terracotta text-light-text px-6 py-3 rounded-lg hover:bg-golden-sandy transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta min-h-[44px] inline-flex items-center justify-center"
            aria-label="Выбрать тариф клуба"
            onClick={() => {
              analyticsEvents.ctaClick('Выбрать тариф', 'cta');
            }}
          >
            Выбрать тариф
          </Link>
          <a
            href="https://t.me/starovoitovae"
            className="border border-terracotta text-terracotta px-6 py-3 rounded-lg hover:bg-cream transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta min-h-[44px] inline-flex items-center justify-center"
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

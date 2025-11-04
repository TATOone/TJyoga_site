import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const CTA: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

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
          Начни свой путь сегодня
        </motion.h2>
        <motion.p
          className="text-lg text-dark-brown mb-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Запишись на бесплатную консультацию или сразу присоединяйся к йога-клубу
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a
            href="https://t.me/starovoitovae"
            className="bg-terracotta text-light-text px-6 py-3 rounded-lg hover:bg-golden-sandy transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta"
            aria-label="Написать Жене"
          >
            Написать Жене
          </a>
          <a
            href="https://t.me/TJyoga"
            className="border border-terracotta text-terracotta px-6 py-3 rounded-lg hover:bg-cream transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-terracotta"
            aria-label="Присоединиться к клубу"
          >
            Присоединиться к клубу
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
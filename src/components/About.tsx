import React from 'react';
import { motion } from 'framer-motion';
import { IMAGES } from '../config/images';
import { useSectionInView } from '../hooks/useSectionInView';
import { REVEAL_HIDDEN, REVEAL_VISIBLE, revealTransition } from '../lib/motion';

const About: React.FC = () => {
  const { ref, isInView } = useSectionInView();

  return (
    <section id="about" className="py-16 bg-light-text">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-dark-brown mb-8"
          ref={ref}
          initial={REVEAL_HIDDEN}
          animate={isInView ? REVEAL_VISIBLE : {}}
          transition={revealTransition()}
        >
          Женя и Тим
        </motion.h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <motion.div
            className="md:w-1/2"
            initial={REVEAL_HIDDEN}
            animate={isInView ? REVEAL_VISIBLE : {}}
            transition={revealTransition(0.12)}
          >
            <img
              src={IMAGES.about.teachers}
              alt={IMAGES.about.alt}
              className="w-full h-auto rounded-lg shadow-lg"
              loading="lazy"
              width="800"
              height="600"
              decoding="async"
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              onError={(e) => {
                console.error('About image failed to load:', IMAGES.about.teachers);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </motion.div>
          <motion.div
            className="md:w-1/2"
            initial={REVEAL_HIDDEN}
            animate={isInView ? REVEAL_VISIBLE : {}}
            transition={revealTransition(0.2)}
          >
            <p className="text-dark-brown mb-4">
              Мы - Женя и Тим. Практикуем и преподаём классическую хатха-йогу школы Патанджали. Эту линию мы получили в Ришикеше: из текстов и живой практики.
            </p>
            <p className="text-dark-brown mb-4">
              Мы активные и энергичные, во многом благодаря йоге.
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-olive-ink">Женя Старовойтова - основной преподаватель, 10+ лет личной практики, 5+ лет преподавания</p>
              <p className="font-semibold text-olive-ink">Тим - ассистент преподавателя, 5+ лет практики, вдохновитель и поддержка</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
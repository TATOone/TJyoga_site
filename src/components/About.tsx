import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { IMAGES } from '../config/images';

const About: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="about" className="py-16 bg-light-text">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-dark-brown mb-8"
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          TJ Yoga
        </motion.h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img
              src={ IMAGES.about.teachers }
              alt={ IMAGES.about.alt}
              className="w-full h-auto rounded-lg shadow-lg"
              loading="lazy"
              width="800"
              height="600"
              decoding="async"
            />
          </motion.div>
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <p className="text-dark-brown mb-4">
              Мы — Женя и Тим, семья йогов, которая передаёт классические знания Хатха Йоги школы Патанджали. Наша практика началась в священном Ришикеше, где мы получили международные сертификаты преподавателей.
            </p>
            <p className="text-dark-brown mb-4">
              Мы верим, что йога — это не про идеальность, а про честность с собой. Жизнь бывает непредсказуемой, и именно такая она — самая настоящая. Мы делимся не только асанами, но и философией, которая помогает находить баланс в современном мире.
            </p>
            <div className="space-y-2">
              <p className="font-semibold text-olive-green">Женя Старовойтова — основной преподаватель, 10+ лет личной практики, 5+ лет преподавания</p>
              <p className="font-semibold text-olive-green">Тим — ассистент преподавателя, 5+ лет практики, вдохновитель и поддержка</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
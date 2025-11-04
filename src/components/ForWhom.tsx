import React from 'react';
    import { motion, useInView } from 'framer-motion';
    import { useRef } from 'react';

    const ForWhom: React.FC = () => {
      const ref = useRef(null);
      const isInView = useInView(ref, { once: true });

      const items = [
        {
          title: 'Любой уровень практики',
          description: 'От первого занятия до продвинутой практики — мы подберём подход именно для вас'
        },
        {
          title: 'Любой возраст (18-65+)',
          description: 'Практика адаптируется под ваши возможности: мамы, профессионалы, люди в возрасте — все найдут своё'
        },
        {
          title: 'Любая цель',
          description: 'Снять стресс, избавиться от боли в спине или найти духовный путь — йога работает комплексно'
        }
      ];

      return (
        <section id="for-whom" className="py-16 bg-light-olive">
          <div className="container mx-auto px-4">
            <motion.h2
              className="text-3xl md:text-4xl font-bold text-center text-dark-brown mb-8"
              ref={ref}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              Классическая Хатха подходит всем
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  className="text-center flex flex-col"
                  initial={{ opacity: 0, y: 50 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <h3 className={`text-xl font-semibold mb-2 flex-shrink-0 ${index % 2 === 0 ? 'text-terracotta' : 'text-olive-green'}`}>{item.title}</h3>
                  <p className="text-dark-brown flex-grow">{item.description}</p>
                </motion.div>
              ))}
            </div>
            <motion.p
              className="text-center text-gray-brown max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              Перед присоединением к клубу мы проводим индивидуальную консультацию, чтобы узнать об особенностях вашего тела и подобрать оптимальный формат практики.
            </motion.p>
          </div>
        </section>
      );
    };

    export default ForWhom;
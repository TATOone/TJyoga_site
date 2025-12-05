import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MessageCircle, Globe, Star } from 'lucide-react';
import { IMAGES } from '../config/images';
import { analyticsEvents } from '../utils/analytics';

const Services: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const services = [
    {
      icon: <MessageCircle className="w-8 h-8 text-terracotta" />,
      title: 'Онлайн Йога-Клуб',
      description: 'Закрытый Telegram-канал с полным погружением в практику:\n\n • Онлайн-занятия в прямом эфире\n • Библиотека записанных уроков\n • "Йога вне коврика" — работа с умом\n • Знания о йоге из первоисточников\n • Поддержка сообщества практикующих',
      price: '6 000 ₽/месяц',
      button: 'Вступить в клуб',
      link: 'https://payform.ru/t5a23mO/',
      image: IMAGES.services.onlineClub
    },
    {
      icon: <Globe className="w-8 h-8 text-golden-sandy" />,
      title: 'Йога-Ретриты',
      description: 'Погружение в практику в самых красивых уголках мира. Две поездки в год с полным сопровождением, ежедневными занятиями и духовным обновлением.',
      price: 'от 35 000 ₽',
      button: 'Узнать подробности',
      link: 'https://t.me/+uCnk6bfxiZ4wNThi',
      image: IMAGES.services.retreat
    },
    {
      icon: <Star className="w-8 h-8 text-olive-green" />,
      title: 'Персональные занятия',
      description: 'Индивидуальный подход с учётом особенностей вашего тела и целей. Глубокая проработка практики один-на-один с Женей.',
      price: '8 000 ₽/занятие',
      button: 'Записаться',
      link: 'https://t.me/starovoitovae',
      image: IMAGES.services.personal
    }
  ];

  return (
    <section id="services" className="py-16 bg-light-sandy">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-dark-brown mb-12"
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Практикуй с нами
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              className="bg-light-text rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col border border-light-sandy"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <img 
                src={service.image} 
                alt={service.title} 
                className="w-full h-48 object-cover" 
                loading="lazy"
                width="800"
                height="400"
                decoding="async"
              />
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center mb-4">
                  {service.icon}
                  <h3 className="text-xl font-semibold text-terracotta ml-2">{service.title}</h3>
                </div>
                <p className="text-dark-brown mb-4 flex-grow whitespace-pre-line">{service.description}</p>
                <p className="text-2xl font-bold text-olive-green mb-4">{service.price}</p>
                <a
                  href={service.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-terracotta text-light-text px-4 py-2 rounded hover:bg-golden-sandy transition-colors duration-300 block text-center focus:outline-none focus:ring-2 focus:ring-terracotta mt-auto"
                  aria-label={service.button}
                  onClick={() => {
                    analyticsEvents.serviceClick(service.title);
                    analyticsEvents.ctaClick(service.button, 'services');
                    if (service.link.includes('t.me')) {
                      const channel = service.link.includes('TJyoga') ? 'TJyoga' : service.link.includes('+uCnk6bfxiZ4wNThi') ? 'TJyoga.trip' : 'starovoitovae';
                      analyticsEvents.telegramClick(channel, `services_${service.title}`);
                    }
                  }}
                >
                  {service.button}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { MessageCircle, Globe, Star } from 'lucide-react';
import { analyticsEvents } from '../utils/analytics';
import Countdown from './Countdown';
import { RETREAT_START } from '../config/retreat';
import { Link } from 'react-router-dom';
import { HOME_SERVICE_PRODUCT_IDS, PRODUCTS } from '../config/products';
import type { ProductId } from '../config/products';

type Service = {
  id: ProductId;
  icon: React.ReactElement;
  title: string;
  description: string;
  price: string;
  button: string;
  link: string;
  checkoutPath: string;
  image: string;
  showCountdown?: boolean;
  featured?: boolean;
};

const Services: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const iconByProduct: Record<ProductId, React.ReactElement> = {
    'club-monthly': <MessageCircle className="w-8 h-8 text-terracotta" />,
    'club-yearly': <MessageCircle className="w-8 h-8 text-terracotta" />,
    'retreat-pass': <Globe className="w-8 h-8 text-golden-sandy" />,
    'personal-session': <Star className="w-8 h-8 text-olive-green" />,
  };

  const services: Service[] = HOME_SERVICE_PRODUCT_IDS.map((id) => {
    const product = PRODUCTS[id];

    return {
      id: product.id,
      icon: iconByProduct[id],
      title: product.title,
      description: product.details,
      price: product.priceLabel,
      button:
        id === 'club-monthly'
          ? 'Вступить в клуб'
          : id === 'retreat-pass'
            ? 'Смотреть ретриты'
            : 'Смотреть персональный формат',
      link: product.primaryPath,
      checkoutPath: product.checkoutPath,
      image: product.image,
      showCountdown: product.showCountdown,
      featured: product.featured,
    };
  });

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
              key={service.id}
              className={`service-card bg-light-text rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border ${
                service.featured
                  ? 'border-terracotta/30 ring-1 ring-terracotta/10 md:-translate-y-1'
                  : 'border-light-sandy'
              }`}
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
                <p className="text-dark-brown mb-2 flex-grow whitespace-pre-line">{service.description}</p>
                {service.showCountdown && (
                  <Countdown targetDate={RETREAT_START} />
                )}
                <p className="text-2xl font-bold text-olive-green mb-4 mt-1">{service.price}</p>
                <div className="mt-auto space-y-2">
                  <Link
                    to={service.link}
                    className="service-card__cta bg-terracotta text-light-text px-4 py-3 rounded-lg hover:bg-golden-sandy transition-colors duration-300 block text-center focus:outline-none focus:ring-2 focus:ring-terracotta min-h-[44px] flex items-center justify-center font-medium"
                    aria-label={service.button}
                    onClick={() => {
                      analyticsEvents.serviceClick(service.title);
                      analyticsEvents.ctaClick(service.button, 'services');
                    }}
                  >
                    {service.button}
                  </Link>
                  <Link
                    to={service.checkoutPath}
                    className="service-card__cta border border-terracotta text-terracotta px-4 py-3 rounded-lg hover:bg-cream transition-colors duration-300 block text-center focus:outline-none focus:ring-2 focus:ring-terracotta min-h-[44px] flex items-center justify-center font-medium"
                    aria-label={`Купить: ${service.title}`}
                    onClick={() => analyticsEvents.ctaClick(`Купить ${service.title}`, 'services')}
                  >
                    Купить
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
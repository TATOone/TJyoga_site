import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Globe, Star } from 'lucide-react';
import { analyticsEvents } from '../utils/analytics';
import Countdown from './Countdown';
import { RETREAT_START } from '../config/retreat';
import { Link } from 'react-router-dom';
import { HOME_SERVICE_PRODUCT_IDS, PRODUCTS } from '../config/products';
import type { ProductId } from '../config/products';
import { useSectionInView } from '../hooks/useSectionInView';
import { REVEAL_HIDDEN, REVEAL_VISIBLE, revealTransition } from '../lib/motion';

type Service = {
  id: ProductId;
  icon: React.ReactElement;
  title: string;
  description: string;
  price: string;
  button: string;
  checkoutLabel: string;
  link: string;
  checkoutPath: string;
  bookingHref?: string;
  image: string;
  showCountdown?: boolean;
};

const Services: React.FC = () => {
  const { ref, isInView } = useSectionInView<HTMLElement>();

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
      title: product.homeCard?.title ?? product.title,
      description: product.homeCard?.description ?? product.details,
      price: product.priceLabel,
      button: product.homeCard?.primaryCta ?? product.ctaLabel,
      checkoutLabel: product.homeCard?.secondaryCta ?? (product.bookingHref ? 'Записаться' : 'Оплатить'),
      link: product.primaryPath,
      checkoutPath: product.checkoutPath,
      bookingHref: product.bookingHref,
      image: product.image,
      showCountdown: product.showCountdown,
    };
  });

  return (
    <section
      id="services"
      ref={ref}
      className="py-16 bg-light-sandy"
      aria-labelledby="services-heading"
    >
      <div className="container mx-auto px-4">
        <h2 id="services-heading" className="sr-only">
          Клуб, ретриты и персональные занятия
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              className={`service-card bg-light-text rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-[transform,box-shadow] duration-300 ease-out-quart flex flex-col border ${
                service.id === 'club-monthly'
                  ? 'border-terracotta/30 ring-1 ring-terracotta/10 md:-translate-y-1'
                  : 'border-light-sandy'
              }`}
              initial={REVEAL_HIDDEN}
              animate={isInView ? REVEAL_VISIBLE : {}}
              transition={revealTransition(index * 0.12)}
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
                  <h3 className="ml-2 text-xl font-semibold text-terracotta-ink">{service.title}</h3>
                </div>
                <p className="text-dark-brown mb-2 flex-grow whitespace-pre-line">{service.description}</p>
                {service.showCountdown && (
                  <Countdown targetDate={RETREAT_START} />
                )}
                <p className="text-2xl font-bold text-olive-ink mb-4 mt-1">{service.price}</p>
                <div className="mt-auto space-y-2">
                  <Link
                    to={service.link}
                    className="service-card__cta cta-primary w-full px-4"
                    aria-label={service.button}
                    onClick={() => {
                      analyticsEvents.serviceClick(service.title);
                      analyticsEvents.ctaClick(service.button, 'services');
                    }}
                  >
                    {service.button}
                  </Link>
                  {service.bookingHref ? (
                    <a
                      href={service.bookingHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="service-card__cta cta-secondary w-full px-4"
                      aria-label={`${service.checkoutLabel}: ${service.title}`}
                      onClick={() => {
                        analyticsEvents.ctaClick(`${service.checkoutLabel} ${service.title}`, 'services');
                        analyticsEvents.telegramClick('starovoitovae', 'services');
                      }}
                    >
                      {service.checkoutLabel}
                    </a>
                  ) : (
                    <Link
                      to={service.checkoutPath}
                      className="service-card__cta cta-secondary w-full px-4"
                      aria-label={`${service.checkoutLabel}: ${service.title}`}
                      onClick={() => analyticsEvents.ctaClick(`${service.checkoutLabel} ${service.title}`, 'services')}
                    >
                      {service.checkoutLabel}
                    </Link>
                  )}
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
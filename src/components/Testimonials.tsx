import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { TESTIMONIALS, TESTIMONIALS_TITLE } from '../config/testimonials';

interface TestimonialsProps {
  variant?: 'full' | 'compact';
}

const TestimonialCard: React.FC<{
  name: string;
  text: string;
  image: string;
  compact: boolean;
}> = ({ name, text, image, compact }) => {
  return (
    <article
      className={`flex min-w-0 flex-col items-center border border-light-sandy bg-light-text text-center ${
        compact ? 'rounded-card p-4 shadow-soft' : 'rounded-lg p-6 shadow-lg'
      }`}
    >
      <div className={compact ? 'mb-3' : 'mb-4'}>
        <img
          src={image}
          alt={name}
          className="mx-auto h-20 w-20 rounded-full border-2 border-light-sandy object-cover"
          loading="lazy"
          width="80"
          height="80"
          decoding="async"
          onError={(event) => {
            const target = event.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        <p className="mt-3 font-semibold text-olive-green">{name}</p>
      </div>
      <p className="text-dark-brown">«{text}»</p>
    </article>
  );
};

const Testimonials: React.FC<TestimonialsProps> = ({ variant = 'full' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const compact = variant === 'compact';

  if (compact) {
    return (
      <section id="testimonials" className="min-w-0">
        <h2 className="mb-4 text-center font-display text-2xl font-semibold text-dark-brown">
          {TESTIMONIALS_TITLE}
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <TestimonialCard
              key={testimonial.name}
              name={testimonial.name}
              text={testimonial.text}
              image={testimonial.image}
              compact
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="bg-cream py-16">
      <div className="container mx-auto px-4">
        <motion.h2
          className="mb-12 text-center font-display text-3xl font-bold text-dark-brown md:text-4xl"
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          {TESTIMONIALS_TITLE}
        </motion.h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <TestimonialCard
                name={testimonial.name}
                text={testimonial.text}
                image={testimonial.image}
                compact={false}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

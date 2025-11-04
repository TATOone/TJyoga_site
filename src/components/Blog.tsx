import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { IMAGES } from '../config/images';

const Blog: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const posts = [
    {
      title: 'Философия йоги',
      image: IMAGES.blog.preview1
    },
    {
      title: 'Практические советы',
      image: IMAGES.blog.preview2
    }
  ];

  return (
    <section id="blog" className="py-16 bg-light-text">
      <div className="container mx-auto px-4">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center text-dark-brown mb-8"
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Изучай йогу глубже
        </motion.h2>
        <motion.p
          className="text-center text-dark-brown mb-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Мы делимся знаниями о йоге, философией и практическими советами в нашем Telegram-канале и блоге.
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {posts.map((post, index) => (
            <motion.div
              key={index}
              className="bg-light-olive p-4 rounded-lg border border-light-sandy"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <img src={post.image} alt={post.title} className="w-full h-32 object-cover rounded mb-4" loading="lazy" />
              <h3 className="text-lg font-semibold text-terracotta">{post.title}</h3>
            </motion.div>
          ))}
        </div>
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <a
            href="https://t.me/TJyoga"
            className="bg-olive-green text-light-text px-6 py-3 rounded-lg hover:bg-golden-sandy transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-olive-green"
            aria-label="Читать о йоге"
          >
            Читать о йоге
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;
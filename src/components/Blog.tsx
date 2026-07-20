import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { IMAGES } from '../config/images';
import { SEED_ARTICLES } from '../config/seedContent';
import { analyticsEvents } from '../utils/analytics';

const Blog: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const publicPosts = SEED_ARTICLES.filter((article) => article.access === 'public').slice(0, 2);
  const images = [IMAGES.blog.preview1, IMAGES.blog.preview2];

  return (
    <section id="blog" className="bg-light-text py-16">
      <div className="container mx-auto px-4">
        <motion.h2
          className="mb-4 text-center font-display text-3xl font-bold text-dark-brown md:text-4xl"
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Блог
        </motion.h2>
        <motion.p
          className="mx-auto mb-8 max-w-2xl text-center text-dark-brown"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Открытые заметки о практике — как в канале yogaTJ. Углублённые материалы клуба — в разделе
          «Знания» внутри кабинета.
        </motion.p>
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {publicPosts.map((post, index) => (
            <motion.article
              key={post.id}
              className="rounded-card border border-light-sandy bg-light-olive p-4 shadow-soft"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <img
                src={images[index] ?? images[0]}
                alt={post.title}
                className="mb-4 h-32 w-full rounded object-cover"
                loading="lazy"
                width="800"
                height="320"
                decoding="async"
              />
              <h3 className="mb-2 font-display text-lg font-semibold text-terracotta">{post.title}</h3>
              <p className="mb-3 text-sm text-dark-brown">{post.excerpt}</p>
              <Link
                to={`/blog/${post.slug}`}
                className="text-sm font-medium text-olive-green hover:underline"
                onClick={() => analyticsEvents.ctaClick('blog_article', 'home_blog')}
              >
                Читать
              </Link>
            </motion.article>
          ))}
        </div>
        <motion.div
          className="flex flex-col justify-center gap-3 text-center sm:flex-row"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link
            to="/blog"
            className="inline-flex min-h-touch items-center justify-center rounded-soft bg-olive-green px-6 py-3 text-light-text transition-colors hover:bg-golden-sandy"
            onClick={() => analyticsEvents.ctaClick('Все записи блога', 'home_blog')}
          >
            Все записи блога
          </Link>
          <Link
            to="/account/knowledge"
            className="inline-flex min-h-touch items-center justify-center rounded-soft border border-olive-green px-6 py-3 text-olive-green transition-colors hover:bg-cream"
            onClick={() => analyticsEvents.ctaClick('Знания клуба', 'home_blog')}
          >
            Знания клуба
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;

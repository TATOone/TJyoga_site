import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { IMAGES } from '../config/images';
import { SEED_ARTICLES } from '../config/seedContent';
import { useSectionInView } from '../hooks/useSectionInView';
import { REVEAL_HIDDEN, REVEAL_VISIBLE, revealTransition } from '../lib/motion';
import { analyticsEvents } from '../utils/analytics';

const Blog: React.FC = () => {
  const { ref, isInView } = useSectionInView();

  const publicPosts = SEED_ARTICLES.filter((article) => article.access === 'public').slice(0, 2);
  const images = [IMAGES.blog.preview1, IMAGES.blog.preview2];

  return (
    <section id="blog" className="bg-light-text py-16">
      <div className="container mx-auto px-4">
        <motion.h2
          className="mb-4 text-center font-display text-3xl font-bold text-dark-brown md:text-4xl"
          ref={ref}
          initial={REVEAL_HIDDEN}
          animate={isInView ? REVEAL_VISIBLE : {}}
          transition={revealTransition()}
        >
          Блог
        </motion.h2>
        <motion.p
          className="mx-auto mb-8 max-w-2xl text-center text-dark-brown"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={revealTransition(0.12)}
        >
          Открытые заметки о практике, как в канале TJyoga.
        </motion.p>
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {publicPosts.map((post, index) => (
            <motion.article
              key={post.id}
              className="overflow-hidden rounded-2xl border border-light-sandy bg-light-olive shadow-soft"
              initial={REVEAL_HIDDEN}
              animate={isInView ? REVEAL_VISIBLE : {}}
              transition={revealTransition(index * 0.12)}
            >
              <img
                src={images[index] ?? images[0]}
                alt={post.title}
                className="h-32 w-full object-cover"
                loading="lazy"
                width="800"
                height="320"
                decoding="async"
              />
              <div className="p-4">
                <h3 className="mb-2 font-display text-lg font-semibold text-terracotta-ink">{post.title}</h3>
                <p className="mb-3 text-sm text-dark-brown">{post.excerpt}</p>
                <Link
                  to={`/blog/${post.slug}`}
                  className="text-sm font-medium text-olive-ink hover:underline"
                  onClick={() => analyticsEvents.ctaClick('blog_article', 'home_blog')}
                >
                  Читать
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
        <motion.div
          className="flex flex-col justify-center gap-3 text-center sm:flex-row"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={revealTransition(0.24)}
        >
          <Link
            to="/blog"
            className="inline-flex min-h-touch items-center justify-center rounded-lg bg-olive-ink px-6 py-3 font-semibold text-light-text transition-[transform,background-color] duration-300 ease-out-quart hover:bg-olive-ink-hover active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-offset-2"
            onClick={() => analyticsEvents.ctaClick('Все записи блога', 'home_blog')}
          >
            Все записи блога
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Blog;

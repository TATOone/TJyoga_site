import React from 'react';
import { motion } from 'framer-motion';

const Header: React.FC = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-light-text/90 backdrop-blur-sm shadow-sm">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <motion.h1
          className="text-2xl font-bold text-terracotta"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          TJ Yoga
        </motion.h1>
        <ul className="hidden md:flex space-x-6">
          <li>
            <button
              onClick={() => scrollToSection('hero')}
              className="text-dark-brown hover:text-olive-green transition-colors duration-300"
            >
              Главная
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('about')}
              className="text-dark-brown hover:text-olive-green transition-colors duration-300"
            >
              О нас
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('services')}
              className="text-dark-brown hover:text-olive-green transition-colors duration-300"
            >
              Услуги
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('for-whom')}
              className="text-dark-brown hover:text-olive-green transition-colors duration-300"
            >
              Для кого
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('testimonials')}
              className="text-dark-brown hover:text-olive-green transition-colors duration-300"
            >
              Отзывы
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('blog')}
              className="text-dark-brown hover:text-olive-green transition-colors duration-300"
            >
              Знания
            </button>
          </li>
          <li>
            <button
              onClick={() => scrollToSection('cta')}
              className="text-dark-brown hover:text-olive-green transition-colors duration-300"
            >
              Контакты
            </button>
          </li>
        </ul>
        <button className="md:hidden text-dark-brown" aria-label="Menu">
          {/* Mobile menu toggle - for simplicity, not implemented fully, but accessible */}
          ☰
        </button>
      </nav>
    </header>
  );
};

export default Header;
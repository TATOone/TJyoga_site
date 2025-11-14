import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false); // Закрываем меню после клика
    }
  };

  // Закрываем меню при изменении размера окна (если стало desktop)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Блокируем скролл когда меню открыто
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const menuItems = [
    { id: 'hero', label: 'Главная' },
    { id: 'about', label: 'О нас' },
    { id: 'services', label: 'Услуги' },
    { id: 'for-whom', label: 'Для кого' },
    { id: 'testimonials', label: 'Отзывы' },
    { id: 'blog', label: 'Знания' },
    { id: 'cta', label: 'Контакты' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-light-text/90 backdrop-blur-sm shadow-sm">
      <nav id="navigation" className="container mx-auto px-4 py-4 flex justify-between items-center" role="navigation" aria-label="Главная навигация">
        <motion.a
          href="#hero"
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          aria-label="TJ yoga - перейти на главную"
        >
          <img
            src="/images/logo/tjyoga-logo.svg"
            alt="TJ yoga logo"
            className="h-10 md:h-12 w-auto"
            width="200"
            height="50"
            loading="eager"
          />
        </motion.a>
        
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => scrollToSection(item.id)}
                className="text-dark-brown hover:text-olive-green transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 rounded px-2 py-1"
                aria-label={`Перейти к разделу ${item.label}`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-dark-brown p-2 focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 rounded"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 bg-dark-brown/50 backdrop-blur-sm z-40 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Menu Panel */}
            <motion.div
              className="fixed top-0 right-0 bottom-0 w-64 bg-light-text shadow-xl z-50 md:hidden"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
            >
              <div className="flex flex-col h-full pt-20 px-6">
                <ul className="flex flex-col space-y-4">
                  {menuItems.map((item, index) => (
                    <motion.li
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className="w-full text-left text-dark-brown hover:text-olive-green transition-colors duration-300 py-3 border-b border-light-sandy focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 rounded px-2"
                        aria-label={`Перейти к разделу ${item.label}`}
                      >
                        {item.label}
                      </button>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
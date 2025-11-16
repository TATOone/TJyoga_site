import React, { useEffect, useContext } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { MobileMenuContext } from '../../App';

const Header: React.FC = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useContext(MobileMenuContext);

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

        {/* Mobile Menu Button - скрываем когда меню открыто */}
        {!isMobileMenuOpen && (
          <button
            className="md:hidden text-dark-brown p-2 focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 rounded"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Открыть меню"
            aria-expanded={false}
          >
            <Menu className="w-6 h-6" />
          </button>
        )}
      </nav>

      {/* Mobile Menu Panel - rendered via portal to body */}
      {createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
              <motion.div
                className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-cream shadow-2xl border-l-4 border-light-sandy z-[9999] md:hidden"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <div className="flex flex-col h-full justify-between p-8 pt-20 bg-cream">
                  {/* Close button */}
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-6 right-6 text-dark-brown p-2 focus:outline-none focus:ring-2 focus:ring-olive-green rounded-full hover:bg-light-sandy/50 transition-colors z-10"
                    aria-label="Закрыть меню"
                  >
                    <X className="w-7 h-7" />
                  </button>

                  {/* Navigation */}
                  <nav className="flex-1 flex flex-col justify-center">
                    <ul className="space-y-4">
                      {menuItems.map((item, index) => (
                        <motion.li
                          key={item.id}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 300 }}
                        >
                          <button
                            onClick={() => scrollToSection(item.id)}
                            className="w-full text-left text-dark-brown hover:text-olive-green transition-colors duration-300 py-3 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-olive-green rounded-lg"
                            aria-label={`Перейти к разделу ${item.label}`}
                          >
                            {item.label}
                          </button>
                        </motion.li>
                      ))}
                    </ul>
                  </nav>

                  {/* CTA Buttons */}
                  <div className="space-y-3 mt-8">
                    <motion.a
                      href="https://t.me/your_channel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-terracotta text-white text-center py-3.5 rounded-lg font-medium hover:bg-terracotta/90 transition-colors shadow-md"
                      onClick={() => setIsMobileMenuOpen(false)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      Присоединиться к клубу
                    </motion.a>
                    <motion.a
                      href="https://t.me/your_channel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full border-2 border-terracotta text-terracotta text-center py-3.5 rounded-lg font-medium hover:bg-terracotta/10 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      Написать Жене
                    </motion.a>
                  </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </header>
  );
};

export default Header;
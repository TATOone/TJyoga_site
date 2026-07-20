import React, { useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { MobileMenuContext } from '../context/mobileMenuContext';
import { PRODUCTS } from '../config/products';
import { analyticsEvents } from '../utils/analytics';

const Header: React.FC = () => {
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useContext(MobileMenuContext);
  const location = useLocation();

  const closeMenu = React.useCallback(() => {
    setIsMobileMenuOpen(false);
  }, [setIsMobileMenuOpen]);

  const menuItems = [
    { to: '/', label: 'Главная' },
    { to: '/club', label: 'Клуб' },
    { to: '/club/rates', label: 'Тарифы' },
    { to: '/blog', label: 'Блог' },
    { to: '/retreats', label: 'Ретриты' },
    { to: '/personal', label: 'Персонально' },
    { to: '/about', label: 'О нас' },
    { to: '/how-to-buy', label: 'Как купить' },
    { to: '/account', label: 'Кабинет' },
  ];
  const clubCheckoutPath = PRODUCTS['club-monthly'].checkoutPath;

  useEffect(() => {
    closeMenu();
  }, [closeMenu, location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        closeMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [closeMenu]);

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

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 rounded px-2 py-1 ${
      isActive ? 'text-terracotta' : 'text-dark-brown hover:text-olive-green'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-light-text/90 backdrop-blur-sm shadow-sm">
      <nav id="navigation" className="container mx-auto px-4 py-4 flex justify-between items-center" role="navigation" aria-label="Главная навигация">
        <motion.div
          className="flex items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" aria-label="TJ yoga - перейти на главную">
            <img
              src="/images/logo/full_logo.png"
              alt="TJ yoga logo"
              className="h-12 md:h-16 w-auto"
              width="250"
              height="64"
              loading="eager"
            />
          </Link>
        </motion.div>
        
        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          {menuItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={navLinkClass}
                onClick={() => analyticsEvents.ctaClick(`nav_${item.label}`, 'header_desktop')}
                aria-label={`Перейти на страницу ${item.label}`}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <button
          className="md:hidden text-dark-brown p-2 focus:outline-none focus:ring-2 focus:ring-olive-green focus:ring-offset-2 rounded"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Открыть меню"
          aria-expanded={isMobileMenuOpen}
        >
          <Menu className="w-6 h-6" />
        </button>
      </nav>

      {/* Mobile Menu Panel - rendered via portal to body */}
      {createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-cream shadow-2xl border-l-4 border-light-sandy z-[9999] md:hidden overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="flex flex-col min-h-full justify-between p-8 pt-20 pb-8 bg-cream">
                <button
                  onClick={closeMenu}
                  className="absolute top-6 right-6 text-dark-brown p-2 focus:outline-none focus:ring-2 focus:ring-olive-green rounded-full hover:bg-light-sandy/50 transition-colors z-10"
                  aria-label="Закрыть меню"
                >
                  <X className="w-7 h-7" />
                </button>

                <nav className="flex-1 flex flex-col justify-center">
                  <ul className="space-y-4">
                    {menuItems.map((item, index) => (
                      <motion.li
                        key={item.to}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05, type: 'spring', stiffness: 300 }}
                      >
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `block w-full text-left transition-colors duration-300 py-3 text-xl font-medium focus:outline-none focus:ring-2 focus:ring-olive-green rounded-lg ${
                              isActive ? 'text-terracotta' : 'text-dark-brown hover:text-olive-green'
                            }`
                          }
                          onClick={() =>
                            analyticsEvents.ctaClick(`nav_${item.label}`, 'header_mobile')
                          }
                          aria-label={`Перейти на страницу ${item.label}`}
                        >
                          {item.label}
                        </NavLink>
                      </motion.li>
                    ))}
                  </ul>
                </nav>

                <div className="space-y-3 mt-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Link
                      to={clubCheckoutPath}
                      className="block w-full bg-terracotta text-white text-center py-3.5 rounded-lg font-medium hover:bg-terracotta/90 transition-colors shadow-md"
                      onClick={() =>
                        analyticsEvents.ctaClick('Присоединиться к клубу', 'header_mobile')
                      }
                    >
                      Присоединиться к клубу
                    </Link>
                  </motion.div>
                  <motion.a
                    href="https://t.me/starovoitovae"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full border-2 border-terracotta text-terracotta text-center py-3.5 rounded-lg font-medium hover:bg-terracotta/10 transition-colors"
                    onClick={() => {
                      analyticsEvents.ctaClick('Написать Жене', 'header_mobile');
                      analyticsEvents.telegramClick('starovoitovae', 'header_mobile');
                      closeMenu();
                    }}
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
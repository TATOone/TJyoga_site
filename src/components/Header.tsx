import React, { useContext, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CLUB_SUPPORT } from '../config/clubContent';
import { FUNNEL_PRIMARY_LABEL, FUNNEL_RATES_PATH } from '../config/funnel';
import { MobileMenuContext } from '../context/mobileMenuContext';
import { EASE_OUT_QUART } from '../lib/motion';
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
    { to: '/how-to-buy', label: 'Как оформить' },
    { to: '/account', label: 'Кабинет' },
  ];

  useEffect(() => {
    closeMenu();
  }, [closeMenu, location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
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
    `inline-flex min-h-touch items-center rounded px-2 py-1 transition-colors duration-300 ease-out-quart focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-offset-2 ${
      isActive
        ? 'font-semibold text-terracotta-ink'
        : 'text-dark-brown hover:text-olive-ink'
    }`;

  const headerCtaClass =
    'cta-primary button-sm min-w-[44px] shrink-0 px-3 sm:px-4';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-light-text/90 backdrop-blur-sm shadow-sm">
      <nav id="navigation" className="container mx-auto px-4 py-4 flex justify-between items-center gap-3" role="navigation" aria-label="Главная навигация">
        <motion.div
          className="flex min-w-0 items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
        >
          <Link to="/" aria-label="TJ Yoga - на главную">
            <img
              src="/images/logo/full_logo.png"
              alt="Логотип TJ Yoga"
              className="h-12 md:h-16 w-auto max-w-[9.5rem] sm:max-w-none"
              width="250"
              height="64"
              loading="eager"
            />
          </Link>
        </motion.div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <ul className="hidden lg:flex items-center gap-x-5">
            {menuItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to !== '/account' && item.to !== '/blog'}
                  className={navLinkClass}
                  onClick={() => analyticsEvents.ctaClick(`nav_${item.label}`, 'header_desktop')}
                  aria-label={`Перейти на страницу ${item.label}`}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <Link
            to={FUNNEL_RATES_PATH}
            className={headerCtaClass}
            aria-label={FUNNEL_PRIMARY_LABEL}
            onClick={() => {
              analyticsEvents.ctaClick(FUNNEL_PRIMARY_LABEL, 'header');
              closeMenu();
            }}
          >
            <span className="sm:hidden">Тарифы</span>
            <span className="hidden sm:inline">{FUNNEL_PRIMARY_LABEL}</span>
          </Link>

          <button
            className="lg:hidden text-dark-brown p-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-offset-2 rounded min-h-touch min-w-[44px] inline-flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Открыть меню"
            aria-expanded={isMobileMenuOpen}
          >
            <motion.span
              className="inline-flex"
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
            >
              <Menu className="w-6 h-6" />
            </motion.span>
          </button>
        </div>
      </nav>

      {createPortal(
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-cream shadow-2xl border-l-4 border-light-sandy z-[9999] lg:hidden overflow-y-auto"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT_QUART }}
            >
              <div className="flex flex-col min-h-full justify-between p-8 pt-20 pb-8 bg-cream">
                <button
                  onClick={closeMenu}
                  className="absolute top-6 right-6 text-dark-brown p-2 min-h-touch min-w-[44px] inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green rounded-full hover:bg-light-sandy/50 transition-colors duration-300 ease-out-quart z-10"
                  aria-label="Закрыть меню"
                >
                  <X className="w-7 h-7" />
                </button>

                <nav className="flex-1 flex flex-col justify-center">
                  <ul className="space-y-4">
                    {menuItems.map((item, index) => (
                      <motion.li
                        key={item.to}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: Math.min(index * 0.06, 0.36),
                          duration: 0.5,
                          ease: EASE_OUT_QUART,
                        }}
                      >
                        <NavLink
                          to={item.to}
                          end={item.to !== '/account' && item.to !== '/blog'}
                          className={({ isActive }) =>
                            `block w-full text-left transition-colors duration-300 ease-out-quart py-3 min-h-touch text-xl font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green rounded-lg ${
                              isActive
                                ? 'font-semibold text-terracotta-ink'
                                : 'text-dark-brown hover:text-olive-ink'
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
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.36, duration: 0.5, ease: EASE_OUT_QUART }}
                  >
                    <Link
                      to={FUNNEL_RATES_PATH}
                      className="cta-primary w-full shadow-md"
                      onClick={() =>
                        analyticsEvents.ctaClick(FUNNEL_PRIMARY_LABEL, 'header_mobile')
                      }
                    >
                      {FUNNEL_PRIMARY_LABEL}
                    </Link>
                  </motion.div>
                  <motion.a
                    href={CLUB_SUPPORT.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-secondary w-full border-2"
                    onClick={() => {
                      analyticsEvents.ctaClick('Написать Жене', 'header_mobile');
                      analyticsEvents.telegramClick('starovoitovae', 'header_mobile');
                      closeMenu();
                    }}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.5, ease: EASE_OUT_QUART }}
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

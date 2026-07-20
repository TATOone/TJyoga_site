import React from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CLUB_SUPPORT } from '../config/clubContent';
import { apiClient } from '../lib/apiClient';
import { clearAuthSession, loadAuthSession } from '../lib/authStorage';
import { usePageMeta } from '../utils/usePageMeta';
import { Button } from './ui';

const navItems = [
  { to: '/account', label: 'Обзор', end: true },
  { to: '/account/videos', label: 'Видео' },
  { to: '/account/knowledge', label: 'Знания' },
  { to: '/account/subscription', label: 'Подписка' },
  { to: '/account/support', label: 'Поддержка' },
] as const;

const AccountLayout: React.FC = () => {
  usePageMeta('account');
  const navigate = useNavigate();
  const session = loadAuthSession();

  const handleLogout = async () => {
    const current = loadAuthSession();
    if (current?.refreshToken) {
      try {
        await apiClient.logout(current.refreshToken);
      } catch {
        // local clear anyway
      }
    }
    clearAuthSession();
    navigate('/account/login');
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-light-sandy bg-light-text/95 backdrop-blur-sm">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-4">
          <Link to="/" className="font-display text-lg font-semibold text-dark-brown">
            TJ Yoga
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link to="/blog" className="text-olive-green hover:underline">
              Блог
            </Link>
            {session?.user?.role === 'admin' || session?.user?.role === 'editor' ? (
              <Link to="/admin" className="text-terracotta hover:underline">
                Админка
              </Link>
            ) : null}
            <Button variant="ghost" onClick={() => void handleLogout()}>
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <nav aria-label="Кабинет" className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                `block min-h-touch rounded-soft px-4 py-2 ${
                  isActive
                    ? 'bg-terracotta text-light-text'
                    : 'border border-light-sandy bg-light-text text-dark-brown hover:bg-cream'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href={CLUB_SUPPORT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="block min-h-touch rounded-soft border border-olive-green px-4 py-2 text-olive-green hover:bg-light-olive"
          >
            Telegram
          </a>
        </nav>

        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AccountLayout;

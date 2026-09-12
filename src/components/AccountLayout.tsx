import React from 'react';
import { BookOpen, CreditCard, Home, LifeBuoy, PlayCircle } from 'lucide-react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { CLUB_SUPPORT } from '../config/clubContent';
import { apiClient } from '../lib/apiClient';
import { clearAuthSession, loadAuthSession } from '../lib/authStorage';
import { usePageMeta } from '../utils/usePageMeta';
import { Button } from './ui';

const navItems = [
  { to: '/account', label: 'Обзор', icon: Home, end: true },
  { to: '/account/videos', label: 'Видео', icon: PlayCircle },
  { to: '/account/knowledge', label: 'Знания', icon: BookOpen },
  { to: '/account/subscription', label: 'Подписка', icon: CreditCard },
  { to: '/account/support', label: 'Поддержка', icon: LifeBuoy },
] as const;

const desktopLinkClass = (isActive: boolean): string =>
  [
    'flex min-h-touch items-center gap-2 rounded-soft px-4 py-2 text-sm font-medium transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-offset-2',
    isActive
      ? 'bg-terracotta text-light-text shadow-soft'
      : 'border border-light-sandy bg-light-text text-dark-brown hover:border-terracotta hover:bg-cream',
  ].join(' ');

const mobileLinkClass = (isActive: boolean): string =>
  [
    'flex min-h-touch min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[11px] font-medium',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-inset',
    isActive ? 'text-terracotta' : 'text-gray-brown',
  ].join(' ');

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
        <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="font-display text-lg font-semibold text-dark-brown">
            TJ Yoga
          </Link>
          <div className="flex items-center gap-2 text-sm sm:gap-3">
            <a
              href={CLUB_SUPPORT.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden text-olive-green hover:underline sm:inline"
            >
              Telegram
            </a>
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

      <div className="container mx-auto grid grid-cols-1 gap-8 px-4 py-6 pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:grid-cols-[220px_1fr] lg:py-8 lg:pb-8">
        <nav aria-label="Кабинет" className="hidden space-y-2 lg:block">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) => desktopLinkClass(isActive)}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {item.label}
              </NavLink>
            );
          })}
          <a
            href={CLUB_SUPPORT.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-touch items-center rounded-soft border border-olive-green px-4 py-2 text-sm font-medium text-olive-green hover:bg-light-olive"
          >
            Написать в Telegram
          </a>
        </nav>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>

      <nav
        aria-label="Кабинет"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-light-sandy bg-light-text/95 pb-[env(safe-area-inset-bottom)] shadow-soft backdrop-blur-sm lg:hidden"
      >
        <div className="mx-auto flex max-w-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) => mobileLinkClass(isActive)}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AccountLayout;

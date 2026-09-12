import { FREE_CTA_LABEL, FREE_PAGE_PATH } from './freePractices';
import { PRODUCTS } from './products';

export const FUNNEL_RATES_PATH = '/club/rates';
export const FUNNEL_PRIMARY_LABEL = 'Выбрать тариф';

export const FUNNEL_PAGE_PATHS = ['/', '/club', '/club/rates', '/how-to-buy', '/free'] as const;

export type FunnelPagePath = (typeof FUNNEL_PAGE_PATHS)[number];

export const HERO_PRIMARY_CTA_ATTR = 'data-hero-primary-cta';

export const isFunnelPagePath = (pathname: string): pathname is FunnelPagePath =>
  (FUNNEL_PAGE_PATHS as readonly string[]).includes(pathname);

export const isCheckoutPath = (pathname: string): boolean =>
  pathname === '/checkout' || pathname.startsWith('/checkout/');

export const isPaymentPath = (pathname: string): boolean => pathname.startsWith('/payment');

export interface FunnelAction {
  to: string;
  label: string;
}

export const getStickyFunnelActions = (
  pathname: string,
): { primary: FunnelAction; secondary?: FunnelAction } => {
  if (pathname === '/club/rates') {
    const yearly = PRODUCTS['club-yearly'];
    const monthly = PRODUCTS['club-monthly'];
    return {
      primary: { to: yearly.checkoutPath, label: yearly.ctaLabel },
      secondary: { to: monthly.checkoutPath, label: monthly.ctaLabel },
    };
  }

  if (pathname === '/free') {
    return {
      primary: { to: FUNNEL_RATES_PATH, label: FUNNEL_PRIMARY_LABEL },
    };
  }

  return {
    primary: { to: FUNNEL_RATES_PATH, label: FUNNEL_PRIMARY_LABEL },
    secondary: { to: FREE_PAGE_PATH, label: FREE_CTA_LABEL },
  };
};

export const stickyFunnelAnalyticsLocation = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'sticky_funnel_home';
    case '/club':
      return 'sticky_funnel_club';
    case '/club/rates':
      return 'sticky_funnel_rates';
    case '/how-to-buy':
      return 'sticky_funnel_how_to_buy';
    case '/free':
      return 'sticky_funnel_free';
    default: {
      return 'sticky_funnel';
    }
  }
};

import React, { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { MobileMenuContext } from '../context/mobileMenuContext';
import {
  getStickyFunnelActions,
  HERO_PRIMARY_CTA_ATTR,
  isCheckoutPath,
  isFunnelPagePath,
  isPaymentPath,
  stickyFunnelAnalyticsLocation,
} from '../config/funnel';
import { analyticsEvents } from '../utils/analytics';

const StickyFunnelCta: React.FC = () => {
  const location = useLocation();
  const { isMobileMenuOpen } = useContext(MobileMenuContext);
  const [heroCtaOnScreen, setHeroCtaOnScreen] = useState(false);

  const pathname = location.pathname;
  const onFunnelPage = isFunnelPagePath(pathname);
  const hideForRoute = isCheckoutPath(pathname) || isPaymentPath(pathname);

  useEffect(() => {
    if (!onFunnelPage || hideForRoute) {
      setHeroCtaOnScreen(false);
      return;
    }

    const heroCta = document.querySelector(`[${HERO_PRIMARY_CTA_ATTR}]`);
    if (!heroCta) {
      setHeroCtaOnScreen(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setHeroCtaOnScreen(entry.isIntersecting && entry.intersectionRatio >= 0.35);
      },
      { threshold: [0, 0.35, 0.6, 1] },
    );

    observer.observe(heroCta);
    return () => observer.disconnect();
  }, [hideForRoute, onFunnelPage, pathname]);

  if (!onFunnelPage || hideForRoute || isMobileMenuOpen || heroCtaOnScreen) {
    return null;
  }

  const { primary, secondary } = getStickyFunnelActions(pathname);
  const analyticsLocation = stickyFunnelAnalyticsLocation(pathname);

  return (
    <>
      <div
        className="h-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:hidden"
        aria-hidden="true"
      />
      {createPortal(
        <div
          className="fixed inset-x-0 bottom-0 z-40 md:hidden"
          role="region"
          aria-label="Быстрые действия"
        >
          <div className="sticky-funnel-cta border-t border-light-sandy bg-light-text/95 shadow-soft backdrop-blur-sm">
            <div className="mx-auto flex w-full min-w-0 max-w-lg gap-2 px-3">
              <Link
                to={primary.to}
                className="inline-flex min-h-touch min-w-0 flex-[1.15] items-center justify-center rounded-soft bg-terracotta px-2 py-2 text-center text-sm font-medium leading-tight text-light-text transition-colors hover:bg-golden-sandy focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-offset-2"
                onClick={() => analyticsEvents.ctaClick(primary.label, analyticsLocation)}
              >
                {primary.label}
              </Link>
              {secondary ? (
                <Link
                  to={secondary.to}
                  className="inline-flex min-h-touch min-w-0 flex-1 items-center justify-center rounded-soft border border-terracotta px-2 py-2 text-center text-sm font-medium leading-tight text-terracotta transition-colors hover:bg-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-offset-2"
                  onClick={() => analyticsEvents.ctaClick(secondary.label, analyticsLocation)}
                >
                  {secondary.label}
                </Link>
              ) : null}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
};

export default StickyFunnelCta;

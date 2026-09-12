import React from 'react';
import { Link } from 'react-router-dom';
import { CLUB_SUPPORT } from '../config/clubContent';
import { FUNNEL_RATES_PATH } from '../config/funnel';
import { loadAuthSession } from '../lib/authStorage';
import { analyticsEvents } from '../utils/analytics';

export type PaymentOutcome = 'success' | 'error';

type ActionVariant = 'primary' | 'secondary' | 'ghost';

interface PaymentNextActionsProps {
  outcome: PaymentOutcome;
  retryPath?: string | null;
}

const actionClass = (variant: ActionVariant): string => {
  const variantClass = (() => {
    switch (variant) {
      case 'primary':
        return 'bg-terracotta text-light-text hover:bg-golden-sandy shadow-soft';
      case 'secondary':
        return 'border border-terracotta text-terracotta bg-transparent hover:bg-cream';
      case 'ghost':
        return 'border border-light-sandy text-dark-brown bg-light-text hover:bg-cream';
      default: {
        const _exhaustive: never = variant;
        return _exhaustive;
      }
    }
  })();

  return [
    'inline-flex w-full min-h-touch items-center justify-center rounded-soft px-5 text-base font-medium',
    'transition-colors duration-200 focus:outline-none',
    'focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-offset-2',
    variantClass,
  ].join(' ');
};

const PaymentNextActions: React.FC<PaymentNextActionsProps> = ({ outcome, retryPath }) => {
  const hasSession = Boolean(loadAuthSession());
  const cabinetTo = hasSession ? '/account' : '/account/login';
  const cabinetLabel = hasSession ? 'Кабинет' : 'Войти в кабинет';
  const analyticsLocation = outcome === 'success' ? 'payment_success' : 'payment_error';

  const cabinetLink = (
    <Link
      to={cabinetTo}
      className={actionClass(outcome === 'success' ? 'primary' : 'ghost')}
      onClick={() => analyticsEvents.ctaClick(cabinetLabel, analyticsLocation)}
    >
      {cabinetLabel}
    </Link>
  );

  const telegramLink = (
    <a
      href={CLUB_SUPPORT.telegram}
      target="_blank"
      rel="noopener noreferrer"
      className={actionClass('secondary')}
      onClick={() => {
        analyticsEvents.ctaClick('Telegram', analyticsLocation);
        analyticsEvents.telegramClick('starovoitovae', analyticsLocation);
      }}
    >
      Telegram
    </a>
  );

  const ratesLabel = retryPath ? 'Повторить' : 'К тарифам';
  const ratesTo = retryPath ?? FUNNEL_RATES_PATH;

  const ratesLink = (
    <Link
      to={ratesTo}
      className={actionClass(outcome === 'error' ? 'primary' : 'ghost')}
      onClick={() => analyticsEvents.ctaClick(ratesLabel, analyticsLocation)}
    >
      {ratesLabel}
    </Link>
  );

  switch (outcome) {
    case 'success':
      return (
        <div className="flex flex-col gap-3">
          {cabinetLink}
          {telegramLink}
          <Link
            to={FUNNEL_RATES_PATH}
            className={actionClass('ghost')}
            onClick={() => analyticsEvents.ctaClick('К тарифам', analyticsLocation)}
          >
            К тарифам
          </Link>
        </div>
      );
    case 'error':
      return (
        <div className="flex flex-col gap-3">
          {ratesLink}
          {retryPath ? (
            <Link
              to={FUNNEL_RATES_PATH}
              className={actionClass('ghost')}
              onClick={() => analyticsEvents.ctaClick('К тарифам', analyticsLocation)}
            >
              К тарифам
            </Link>
          ) : null}
          {telegramLink}
          {cabinetLink}
        </div>
      );
    default: {
      const _exhaustive: never = outcome;
      return _exhaustive;
    }
  }
};

export default PaymentNextActions;

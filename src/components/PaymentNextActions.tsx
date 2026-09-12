import React from 'react';
import { Link } from 'react-router-dom';
import { CLUB_SUPPORT } from '../config/clubContent';
import { FUNNEL_RATES_PATH } from '../config/funnel';
import { loadAuthSession } from '../lib/authStorage';
import { analyticsEvents } from '../utils/analytics';
import { Button } from './ui';

export type PaymentOutcome = 'success' | 'error';

interface PaymentNextActionsProps {
  outcome: PaymentOutcome;
  retryPath?: string | null;
}

const PaymentNextActions: React.FC<PaymentNextActionsProps> = ({ outcome, retryPath }) => {
  const hasSession = Boolean(loadAuthSession());
  const cabinetTo = hasSession ? '/account' : '/account/login';
  const cabinetLabel = hasSession ? 'Кабинет' : 'Войти в кабинет';
  const analyticsLocation = outcome === 'success' ? 'payment_success' : 'payment_error';

  const cabinetButton = (
    <Link
      to={cabinetTo}
      className="block"
      onClick={() => analyticsEvents.ctaClick(cabinetLabel, analyticsLocation)}
    >
      <Button fullWidth variant={outcome === 'success' ? 'primary' : 'ghost'}>
        {cabinetLabel}
      </Button>
    </Link>
  );

  const telegramButton = (
    <a
      href={CLUB_SUPPORT.telegram}
      target="_blank"
      rel="noopener noreferrer"
      className="block"
      onClick={() => {
        analyticsEvents.ctaClick('Telegram', analyticsLocation);
        analyticsEvents.telegramClick('starovoitovae', analyticsLocation);
      }}
    >
      <Button fullWidth variant="secondary">
        Telegram
      </Button>
    </a>
  );

  const ratesLabel = retryPath ? 'Повторить' : 'К тарифам';
  const ratesTo = retryPath ?? FUNNEL_RATES_PATH;

  const ratesButton = (
    <Link
      to={ratesTo}
      className="block"
      onClick={() => analyticsEvents.ctaClick(ratesLabel, analyticsLocation)}
    >
      <Button fullWidth variant={outcome === 'error' ? 'primary' : 'ghost'}>
        {ratesLabel}
      </Button>
    </Link>
  );

  switch (outcome) {
    case 'success':
      return (
        <div className="flex flex-col gap-3">
          {cabinetButton}
          {telegramButton}
          <Link
            to={FUNNEL_RATES_PATH}
            className="block"
            onClick={() => analyticsEvents.ctaClick('К тарифам', analyticsLocation)}
          >
            <Button fullWidth variant="ghost">
              К тарифам
            </Button>
          </Link>
        </div>
      );
    case 'error':
      return (
        <div className="flex flex-col gap-3">
          {ratesButton}
          {retryPath ? (
            <Link
              to={FUNNEL_RATES_PATH}
              className="block"
              onClick={() => analyticsEvents.ctaClick('К тарифам', analyticsLocation)}
            >
              <Button fullWidth variant="ghost">
                К тарифам
              </Button>
            </Link>
          ) : null}
          {telegramButton}
          {cabinetButton}
        </div>
      );
    default: {
      const _exhaustive: never = outcome;
      return _exhaustive;
    }
  }
};

export default PaymentNextActions;

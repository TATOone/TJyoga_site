import type { MeResponse } from './apiClient';

export type KnownSubscriptionStatus = 'active' | 'grace' | 'expired' | 'suspended' | 'canceled';
export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger';

export interface SubscriptionStatusView {
  label: string;
  tone: StatusTone;
  description?: string;
}

const KNOWN_STATUSES: readonly KnownSubscriptionStatus[] = [
  'active',
  'grace',
  'expired',
  'suspended',
  'canceled',
];

const isKnownStatus = (status: string): status is KnownSubscriptionStatus =>
  (KNOWN_STATUSES as readonly string[]).includes(status);

export const hasPracticeAccess = (
  subscription: MeResponse['subscription'] | null | undefined,
): boolean => subscription?.status === 'active' || subscription?.status === 'grace';

export const formatAccountDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Moscow',
  });

export const getSubscriptionStatusView = (status: string): SubscriptionStatusView => {
  if (!isKnownStatus(status)) {
    return { label: status, tone: 'neutral' };
  }

  switch (status) {
    case 'active':
      return { label: 'Активна', tone: 'success' };
    case 'grace':
      return {
        label: 'Ещё открыта',
        tone: 'warning',
        description:
          'Оплаченный срок закончился, но доступ ещё действует 72 часа. Можно продлить без разрыва практики.',
      };
    case 'expired':
      return { label: 'Истекла', tone: 'danger' };
    case 'suspended':
      return { label: 'Приостановлена', tone: 'danger' };
    case 'canceled':
      return { label: 'Отменена', tone: 'neutral' };
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
};

export const getPlanLabel = (planCode: string): string => {
  switch (planCode) {
    case 'club-month':
    case 'club-monthly':
      return 'Месячная подписка';
    case 'club-year':
    case 'club-yearly':
      return 'Годовая подписка';
    default:
      return planCode;
  }
};

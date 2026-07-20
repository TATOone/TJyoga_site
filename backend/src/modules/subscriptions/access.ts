import type { SubscriptionRecord } from '../../types/domain.js';

export interface SubscriptionAccessDecision {
  allowed: boolean;
  status: 'active' | 'grace' | 'denied';
  reason: string;
  effectiveUntil: string | null;
}

const maxIsoDate = (dates: string[]): string => {
  let current = dates[0];
  for (const next of dates.slice(1)) {
    if (new Date(next).getTime() > new Date(current).getTime()) {
      current = next;
    }
  }
  return current;
};

const addHours = (dateIso: string, hours: number): string => {
  const date = new Date(dateIso);
  date.setUTCHours(date.getUTCHours() + hours);
  return date.toISOString();
};

export const evaluateSubscriptionAccess = (
  subscription: SubscriptionRecord | null,
  graceHours: number,
  nowDate: Date = new Date(),
): SubscriptionAccessDecision => {
  if (!subscription) {
    return {
      allowed: false,
      status: 'denied',
      reason: 'subscription_absent',
      effectiveUntil: null,
    };
  }

  if (subscription.status === 'canceled' || subscription.status === 'suspended' || subscription.status === 'expired') {
    return {
      allowed: false,
      status: 'denied',
      reason: `subscription_${subscription.status}`,
      effectiveUntil: null,
    };
  }

  const activeCandidates: string[] = [subscription.endsAt];
  if (subscription.manualExtendedUntil) {
    activeCandidates.push(subscription.manualExtendedUntil);
  }
  const activeUntilIso = maxIsoDate(activeCandidates);
  const activeUntilMs = new Date(activeUntilIso).getTime();
  const nowMs = nowDate.getTime();

  if (nowMs <= activeUntilMs) {
    return {
      allowed: true,
      status: 'active',
      reason: 'subscription_active_or_manually_extended',
      effectiveUntil: activeUntilIso,
    };
  }

  const graceEndsAtIso = subscription.graceEndsAt ?? addHours(activeUntilIso, graceHours);
  const graceEndsAtMs = new Date(graceEndsAtIso).getTime();

  if (nowMs <= graceEndsAtMs) {
    return {
      allowed: true,
      status: 'grace',
      reason: `grace_period_${graceHours}h`,
      effectiveUntil: graceEndsAtIso,
    };
  }

  return {
    allowed: false,
    status: 'denied',
    reason: 'subscription_expired_after_grace',
    effectiveUntil: graceEndsAtIso,
  };
};

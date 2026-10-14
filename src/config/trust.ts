import { CLUB_SUPPORT } from './clubContent';
import { CONSENT_BASELINE } from './legalDocuments';
import { TEACHERS_HEADLINE } from './teachers';

export interface TrustChip {
  id: string;
  label: string;
}

/**
 * Короткие фактические чипы для тарифов и checkout.
 * Формулировки из уже утверждённого контента клуба / legal baseline.
 */
export const TRUST_CHIPS: readonly TrustChip[] = [
  { id: 'teachers', label: `Ведут ${TEACHERS_HEADLINE}` },
  { id: 'support', label: 'Поддержка 10:00–22:00 МСК' },
  { id: 'access', label: 'Доступ обычно за несколько минут' },
  { id: 'grace', label: `${CONSENT_BASELINE.gracePeriodHours} часа, чтобы продлить без разрыва` },
] as const;

export const TRUST_SUPPORT_SLA = CLUB_SUPPORT.sla;
export const TRUST_RENEWAL_SLA = CONSENT_BASELINE.renewalSla;
export const TRUST_GRACE_HOURS = CONSENT_BASELINE.gracePeriodHours;

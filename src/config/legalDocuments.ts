export type LegalDocumentType = 'offer' | 'policy' | 'refund' | 'medical-disclaimer';
export type ConsentType =
  | 'offer_accept'
  | 'privacy_accept'
  | 'medical_disclaimer_accept'
  | 'cookies_accept';

export interface LegalDocumentConfig {
  type: LegalDocumentType;
  title: string;
  path: string;
  version: string;
  effectiveFrom: string;
}

export interface ConsentRequirement {
  type: ConsentType;
  label: string;
  documentType: LegalDocumentType;
  required: boolean;
}

export const LEGAL_BASELINE_VERSION = 'v1.0.0';
export const LEGAL_EFFECTIVE_FROM = '2026-06-11';

export const OPERATOR_INFO = {
  brandName: 'TJ Yoga',
  operatorName: 'Старовойтова Евгения Викторовна',
  operatorStatus: 'самозанятая',
  /** Замените на фактический ИНН самозанятого перед production-публикацией оферты. */
  inn: '000000000000',
  legalEmail: 'legal@tjyoga.ru',
  supportEmail: 'support@tjyoga.ru',
  legalTelegram: '@starovoitovae',
  taxInfo: 'Самозанятая: Старовойтова Евгения Викторовна. ИНН указан в публичной оферте.',
  bankDetailsNote:
    'Оплата цифровых услуг принимается через платёжного партнёра Prodamus. Чек формируется в соответствии с режимом НПД.',
} as const;

export const LEGAL_DOCUMENTS: Record<LegalDocumentType, LegalDocumentConfig> = {
  offer: {
    type: 'offer',
    title: 'Публичная оферта',
    path: '/offer',
    version: LEGAL_BASELINE_VERSION,
    effectiveFrom: LEGAL_EFFECTIVE_FROM,
  },
  policy: {
    type: 'policy',
    title: 'Политика обработки персональных данных',
    path: '/policy',
    version: LEGAL_BASELINE_VERSION,
    effectiveFrom: LEGAL_EFFECTIVE_FROM,
  },
  refund: {
    type: 'refund',
    title: 'Условия возврата',
    path: '/refund',
    version: LEGAL_BASELINE_VERSION,
    effectiveFrom: LEGAL_EFFECTIVE_FROM,
  },
  'medical-disclaimer': {
    type: 'medical-disclaimer',
    title: 'Медицинский отказ от ответственности',
    path: '/medical-disclaimer',
    version: LEGAL_BASELINE_VERSION,
    effectiveFrom: LEGAL_EFFECTIVE_FROM,
  },
};

export const LEGAL_LINKS: readonly LegalDocumentConfig[] = [
  LEGAL_DOCUMENTS.offer,
  LEGAL_DOCUMENTS.policy,
  LEGAL_DOCUMENTS.refund,
  LEGAL_DOCUMENTS['medical-disclaimer'],
];

export const CONSENT_REQUIREMENTS: readonly ConsentRequirement[] = [
  {
    type: 'offer_accept',
    label: 'Принимаю условия публичной оферты',
    documentType: 'offer',
    required: true,
  },
  {
    type: 'privacy_accept',
    label: 'Согласен(а) с политикой обработки персональных данных',
    documentType: 'policy',
    required: true,
  },
  {
    type: 'medical_disclaimer_accept',
    label: 'Подтверждаю ознакомление с медицинским отказом от ответственности',
    documentType: 'medical-disclaimer',
    required: true,
  },
  {
    type: 'cookies_accept',
    label: 'Согласен(а) на использование cookie для аналитики',
    documentType: 'policy',
    required: false,
  },
];

export const CONSENT_BASELINE = {
  version: LEGAL_BASELINE_VERSION,
  legalMode: 'final_texts_now',
  gracePeriodHours: 72,
  renewalSla: 'до 2 часов, ежедневно 10:00-22:00 МСК',
} as const;

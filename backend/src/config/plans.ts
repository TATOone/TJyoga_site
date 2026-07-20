export interface PlanDefinition {
  code: string;
  title: string;
  amountRub: number;
  durationDays: number;
}

export const PLAN_CATALOG: Record<string, PlanDefinition> = {
  'club-month': {
    code: 'club-month',
    title: 'Месячная подписка Йога-Клуб',
    amountRub: 600_000,
    durationDays: 30,
  },
  'club-year': {
    code: 'club-year',
    title: 'Годовая подписка Йога-Клуб',
    amountRub: 6_000_000,
    durationDays: 365,
  },
};

export const REQUIRED_CHECKOUT_CONSENTS = ['offer', 'privacy', 'medical_disclaimer'] as const;

export type RequiredCheckoutConsent = (typeof REQUIRED_CHECKOUT_CONSENTS)[number];

export const resolvePlanCode = (planCode: string): PlanDefinition | null => {
  const normalized = planCode.trim().toLowerCase();
  const aliasMap: Record<string, string> = {
    'club-monthly': 'club-month',
    'club-yearly': 'club-year',
  };

  const resolvedCode = aliasMap[normalized] ?? normalized;
  return PLAN_CATALOG[resolvedCode] ?? null;
};

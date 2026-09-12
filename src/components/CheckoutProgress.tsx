import React from 'react';

const CHECKOUT_STEPS = [
  { id: 'account', label: 'Аккаунт' },
  { id: 'consents', label: 'Согласия' },
  { id: 'pay', label: 'Оплата' },
] as const;

export type CheckoutStepId = (typeof CHECKOUT_STEPS)[number]['id'];

interface CheckoutProgressProps {
  current: CheckoutStepId;
}

const stepIndex = (id: CheckoutStepId): number => {
  switch (id) {
    case 'account':
      return 0;
    case 'consents':
      return 1;
    case 'pay':
      return 2;
    default: {
      const _exhaustive: never = id;
      return _exhaustive;
    }
  }
};

const CheckoutProgress: React.FC<CheckoutProgressProps> = ({ current }) => {
  const currentIndex = stepIndex(current);

  return (
    <ol
      className="grid grid-cols-3 gap-1 sm:gap-2"
      aria-label="Шаги оформления"
    >
      {CHECKOUT_STEPS.map((step, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming';
        const circleClass =
          state === 'upcoming'
            ? 'bg-light-sandy text-gray-brown'
            : 'bg-terracotta text-light-text';
        const labelClass = state === 'upcoming' ? 'text-gray-brown' : 'text-dark-brown';

        return (
          <li key={step.id} className="flex min-w-0 flex-col items-center gap-1 text-center">
            <span
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${circleClass}`}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              {index + 1}
            </span>
            <span className={`text-xs font-medium leading-tight sm:text-sm ${labelClass}`}>
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
};

export default CheckoutProgress;

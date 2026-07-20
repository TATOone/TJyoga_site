import React from 'react';

type StatusTone = 'neutral' | 'success' | 'warning' | 'danger';

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
}

const toneClass: Record<StatusTone, string> = {
  neutral: 'bg-light-olive text-dark-brown',
  success: 'bg-olive-green/15 text-olive-green',
  warning: 'bg-golden-sandy/25 text-dark-brown',
  danger: 'bg-danger/10 text-danger',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, tone = 'neutral' }) => {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide',
        toneClass[tone],
      ].join(' ')}
    >
      {label}
    </span>
  );
};

export default StatusBadge;

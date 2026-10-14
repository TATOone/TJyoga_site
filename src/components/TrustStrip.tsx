import React from 'react';
import { TRUST_CHIPS } from '../config/trust';

interface TrustStripProps {
  className?: string;
}

const TrustStrip: React.FC<TrustStripProps> = ({ className = '' }) => {
  return (
    <ul
      aria-label="Как устроен доступ и поддержка"
      className={`flex min-w-0 flex-wrap gap-2 ${className}`.trim()}
    >
      {TRUST_CHIPS.map((chip) => (
        <li
          key={chip.id}
          className="max-w-full rounded-full border border-light-sandy bg-cream px-3 py-1.5 text-sm leading-snug text-dark-brown"
        >
          {chip.label}
        </li>
      ))}
    </ul>
  );
};

export default TrustStrip;

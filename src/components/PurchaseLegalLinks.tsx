import React from 'react';
import { Link } from 'react-router-dom';
import { LEGAL_DOCUMENTS } from '../config/legalDocuments';
import { analyticsEvents } from '../utils/analytics';

const PURCHASE_DOCS = [
  { doc: LEGAL_DOCUMENTS.offer, label: 'Оферта' },
  { doc: LEGAL_DOCUMENTS.policy, label: 'Политика' },
  { doc: LEGAL_DOCUMENTS.refund, label: 'Возврат' },
] as const;

interface PurchaseLegalLinksProps {
  analyticsLocation: string;
}

const PurchaseLegalLinks: React.FC<PurchaseLegalLinksProps> = ({ analyticsLocation }) => {
  return (
    <nav aria-label="Документы перед оплатой" className="min-w-0">
      <p className="mb-2 text-sm text-gray-brown">Оферта, политика и возврат — рядом с оплатой.</p>
      <ul className="flex min-w-0 flex-wrap gap-x-4 gap-y-2">
        {PURCHASE_DOCS.map(({ doc, label }) => (
          <li key={doc.path}>
            <Link
              to={doc.path}
              className="inline-flex min-h-touch items-center text-sm font-medium text-terracotta transition-colors hover:text-golden-sandy"
              onClick={() => analyticsEvents.ctaClick(`legal_${doc.type}`, analyticsLocation)}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default PurchaseLegalLinks;

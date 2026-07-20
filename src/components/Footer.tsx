import React from 'react';
import { Link } from 'react-router-dom';
import { LEGAL_LINKS, OPERATOR_INFO } from '../config/legalDocuments';
import { analyticsEvents } from '../utils/analytics';

const Footer: React.FC = () => {
  const publicLinks = [
    { label: 'Главная', to: '/' },
    { label: 'Клуб', to: '/club' },
    { label: 'Блог', to: '/blog' },
    { label: 'Тарифы', to: '/club/rates' },
    { label: 'Ретриты', to: '/retreats' },
    { label: 'Персонально', to: '/personal' },
    { label: 'Как купить', to: '/how-to-buy' },
  ];

  return (
    <footer className="bg-dark-brown text-light-text py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-olive-green mb-2">{OPERATOR_INFO.brandName}</h3>
            <p className="text-gray-brown mb-1">
              Оператор: {OPERATOR_INFO.operatorName} ({OPERATOR_INFO.operatorStatus})
            </p>
            <p className="text-gray-brown mb-1">{OPERATOR_INFO.taxInfo}</p>
            <p className="text-gray-brown text-sm">© 2026 TJ Yoga. Все права защищены</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-light-text">Навигация</h4>
            <ul className="space-y-2">
              {publicLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-gray-brown hover:text-golden-sandy transition-colors"
                    onClick={() => analyticsEvents.ctaClick(`footer_${link.label}`, 'footer_navigation')}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-light-text">Юридическая информация</h4>
            <ul className="space-y-2 mb-4">
              {LEGAL_LINKS.map((doc) => (
                <li key={doc.path}>
                  <Link
                    to={doc.path}
                    className="text-gray-brown hover:text-golden-sandy transition-colors"
                    onClick={() => analyticsEvents.ctaClick(`footer_${doc.type}`, 'footer_legal')}
                  >
                    {doc.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/how-to-buy"
                  className="text-gray-brown hover:text-golden-sandy transition-colors"
                  onClick={() => analyticsEvents.ctaClick('footer_how_to_buy', 'footer_legal')}
                >
                  Как купить
                </Link>
              </li>
            </ul>

            <p className="text-gray-brown">
              Юридические обращения:{' '}
              <a href={`mailto:${OPERATOR_INFO.legalEmail}`} className="text-golden-sandy hover:underline">
                {OPERATOR_INFO.legalEmail}
              </a>
            </p>
            <p className="text-gray-brown">
              Telegram:{' '}
              <a href="https://t.me/starovoitovae" className="text-golden-sandy hover:underline">
                {OPERATOR_INFO.legalTelegram}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
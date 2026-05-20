import React, { useState } from 'react';
import DisclaimerModal from './DisclaimerModal';

const Footer: React.FC = () => {
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);

  return (
    <>
      <footer className="bg-dark-brown text-light-text py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-olive-green">TJ Yoga</h3>
              <p className="text-gray-brown">Классическая Хатха Йога школы Патанджали</p>
            </div>
            <div className="text-center md:text-right">
              <p className="mb-2">Telegram: <a href="https://t.me/starovoitovae" className="text-golden-sandy hover:underline">@starovoitovae</a></p>
              <p className="mb-2">Канал: <a href="https://t.me/TJyoga" className="text-golden-sandy hover:underline">TJ Yoga Channel</a></p>
              <p className="text-gray-brown text-sm mb-2">
                <button
                  onClick={() => setIsDisclaimerOpen(true)}
                  className="text-golden-sandy hover:underline cursor-pointer"
                  aria-label="Открыть отказ от ответственности"
                >
                  Отказ от ответственности
                </button>
              </p>
              <p className="text-gray-brown">© 2026 TJ Yoga. Все права защищены</p>
            </div>
          </div>
        </div>
      </footer>
      <DisclaimerModal 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)} 
      />
    </>
  );
};

export default Footer;
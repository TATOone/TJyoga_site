import React from 'react';

const SkipLinks: React.FC = () => {
  return (
    <>
      {/* Skip Links для доступности */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-terracotta focus:text-light-text focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-olive-green"
        aria-label="Перейти к основному содержимому"
      >
        Перейти к основному содержимому
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-terracotta focus:text-light-text focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-olive-green"
        aria-label="Перейти к навигации"
      >
        Перейти к навигации
      </a>
    </>
  );
};

export default SkipLinks;


import React from 'react';

const SkipLinks: React.FC = () => {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-terracotta-ink focus:text-light-text focus:rounded-md focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green"
      >
        Перейти к основному содержимому
      </a>
      <a
        href="#navigation"
        className="sr-only focus:not-sr-only focus:absolute focus:top-[3.75rem] focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-terracotta-ink focus:text-light-text focus:rounded-md focus:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green"
      >
        Перейти к навигации
      </a>
    </>
  );
};

export default SkipLinks;

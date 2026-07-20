import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  className = '',
}) => {
  return (
    <header className={['mb-6', className].join(' ')}>
      {eyebrow ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-terracotta">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-3xl font-semibold text-dark-brown md:text-4xl">{title}</h1>
      {subtitle ? <p className="mt-2 max-w-2xl text-gray-brown">{subtitle}</p> : null}
    </header>
  );
};

export default SectionHeader;

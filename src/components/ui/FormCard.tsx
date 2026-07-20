import React from 'react';

interface FormCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}

export const FormCard: React.FC<FormCardProps> = ({
  title,
  subtitle,
  children,
  className = '',
  footer,
}) => {
  return (
    <div
      className={[
        'mx-auto w-full max-w-md rounded-card border border-light-sandy bg-light-text p-6 md:p-8 shadow-soft',
        className,
      ].join(' ')}
    >
      {title ? <h2 className="font-display text-2xl font-semibold text-dark-brown">{title}</h2> : null}
      {subtitle ? <p className="mt-2 text-sm text-gray-brown">{subtitle}</p> : null}
      <div className={title || subtitle ? 'mt-6 space-y-4' : 'space-y-4'}>{children}</div>
      {footer ? <div className="mt-6 border-t border-light-sandy pt-4">{footer}</div> : null}
    </div>
  );
};

export default FormCard;

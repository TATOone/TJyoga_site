import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
}

const variantClass: Record<ButtonVariant, string> = {
  primary:
    'bg-terracotta text-light-text hover:bg-golden-sandy disabled:opacity-60 shadow-soft',
  secondary:
    'border border-terracotta text-terracotta bg-transparent hover:bg-cream disabled:opacity-60',
  ghost: 'border border-light-sandy text-dark-brown bg-light-text hover:bg-cream disabled:opacity-60',
  danger: 'bg-danger text-light-text hover:opacity-90 disabled:opacity-60',
};

const sizeClass: Record<ButtonSize, string> = {
  md: 'min-h-touch px-5 text-base',
  lg: 'min-h-touch px-6 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  className = '',
  children,
  disabled,
  type = 'button',
  ...rest
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center rounded-soft font-medium transition-colors duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-offset-2',
        variantClass[variant],
        sizeClass[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading ? 'Загрузка...' : children}
    </button>
  );
};

export default Button;

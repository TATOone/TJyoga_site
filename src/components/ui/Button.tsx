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
    'bg-terracotta-ink text-light-text hover:bg-terracotta-ink-hover disabled:opacity-60 shadow-soft',
  secondary:
    'border border-terracotta text-terracotta-ink bg-transparent hover:bg-cream disabled:opacity-60',
  ghost: 'border border-light-sandy text-dark-brown bg-light-text hover:bg-cream disabled:opacity-60',
  danger: 'bg-danger text-light-text hover:opacity-90 disabled:opacity-60',
};

const sizeClass: Record<ButtonSize, string> = {
  md: 'button-md min-h-touch px-5',
  lg: 'min-h-touch px-6 text-lg font-semibold leading-7',
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
      aria-busy={loading || undefined}
      className={[
        'inline-flex items-center justify-center rounded-soft',
        'transition-[transform,background-color,opacity] duration-300 ease-out-quart',
        'active:enabled:scale-[0.98]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-offset-2',
        'disabled:pointer-events-none',
        variantClass[variant],
        sizeClass[size],
        fullWidth ? 'w-full' : '',
        loading ? 'animate-pulse' : '',
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

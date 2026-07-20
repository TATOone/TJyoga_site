import React from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, id, className = '', type = 'text', ...rest }, ref) => {
    const fieldId = id ?? rest.name ?? label.replace(/\s+/g, '-').toLowerCase();

    return (
      <label className="block space-y-1.5" htmlFor={fieldId}>
        <span className="text-sm font-medium text-dark-brown">{label}</span>
        <input
          ref={ref}
          id={fieldId}
          type={type}
          className={[
            'w-full min-h-touch rounded-soft border bg-light-text px-3 text-dark-brown',
            'placeholder:text-gray-brown/70 transition-colors',
            error
              ? 'border-danger focus:border-danger'
              : 'border-light-sandy focus:border-olive-green',
            className,
          ].join(' ')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...rest}
        />
        {hint && !error ? (
          <span id={`${fieldId}-hint`} className="text-xs text-gray-brown">
            {hint}
          </span>
        ) : null}
        {error ? (
          <span id={`${fieldId}-error`} className="text-sm text-danger" role="alert">
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;

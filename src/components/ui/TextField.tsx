import React from 'react';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  hint?: string;
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, id, className = '', type = 'text', disabled, ...rest }, ref) => {
    const fieldId = id ?? rest.name ?? label.replace(/\s+/g, '-').toLowerCase();

    return (
      <label className="block space-y-2" htmlFor={fieldId}>
        <span className="title-4 text-sm font-medium leading-5 text-dark-brown">{label}</span>
        <input
          ref={ref}
          id={fieldId}
          type={type}
          disabled={disabled}
          className={[
            'w-full min-h-touch rounded-lg border bg-light-text px-3 text-dark-brown body-3',
            'placeholder:text-gray-brown/70 transition-[border-color,box-shadow] duration-300 ease-out-quart',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-olive-green focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed disabled:bg-cream disabled:opacity-60',
            error
              ? 'border-danger focus:border-danger'
              : 'border-light-sandy focus:border-olive-ink',
            className,
          ].join(' ')}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
          {...rest}
        />
        {hint && !error ? (
          <span id={`${fieldId}-hint`} className="caption-2 text-gray-brown">
            {hint}
          </span>
        ) : null}
        {error ? (
          <span id={`${fieldId}-error`} className="body-6 text-danger" role="alert">
            {error}
          </span>
        ) : null}
      </label>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;

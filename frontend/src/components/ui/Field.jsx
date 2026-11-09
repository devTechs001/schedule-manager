import React from 'react';

/**
 * Small form primitives used by the newer pages so inputs look identical
 * everywhere (Select / Textarea / Field wrapper).
 */
export const Field = ({ label, hint, error, htmlFor, required, children, className = '' }) => (
  <div className={className}>
    {label && (
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
    )}
    {children}
    {error ? (
      <p className="error-text" role="alert">{error}</p>
    ) : (
      hint && <p className="hint">{hint}</p>
    )}
  </div>
);

export const Select = React.forwardRef(({ className = '', children, error, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={`input appearance-none pr-9 ${error ? 'input-error' : ''} ${className}`}
      {...props}
    >
      {children}
    </select>
    <svg
      className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-content-subtle"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden="true"
    >
      <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
));
Select.displayName = 'Select';

export const Textarea = React.forwardRef(({ className = '', error, rows = 4, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={`input resize-y leading-relaxed ${error ? 'input-error' : ''} ${className}`}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export default Field;

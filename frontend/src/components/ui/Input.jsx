import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon,
      iconRight,
      type = 'text',
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const reactId = id || props.name;
    const describedBy = error ? `${reactId}-error` : helperText ? `${reactId}-hint` : undefined;

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label htmlFor={reactId} className="label">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-content-subtle">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={reactId}
            type={type}
            aria-invalid={Boolean(error) || undefined}
            aria-describedby={describedBy}
            className={`input ${error ? 'input-error' : ''} ${icon ? 'pl-10' : ''} ${
              iconRight ? 'pr-10' : ''
            } ${className}`}
            {...props}
          />
          {iconRight && (
            <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-content-subtle">
              {iconRight}
            </span>
          )}
        </div>
        {error && (
          <p id={`${reactId}-error`} className="error-text" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${reactId}-hint`} className="hint">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

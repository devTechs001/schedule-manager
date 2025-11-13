import React, { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  type = 'text',
  className = '',
  containerClassName = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400">{icon}</span>
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`
            w-full px-4 py-2.5 
            ${icon ? 'pl-10' : ''}
            bg-white dark:bg-gray-800 
            border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-primary-500'}
            rounded-lg 
            focus:ring-2 focus:border-transparent 
            transition-all duration-200
            text-gray-900 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
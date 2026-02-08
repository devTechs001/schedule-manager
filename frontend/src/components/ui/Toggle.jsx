import React from 'react';

const Toggle = ({
  checked = false,
  onChange,
  disabled = false,
  size = 'md',
  label = '',
  description = '',
  color = 'primary',
}) => {
  const sizes = {
    sm: { toggle: 'w-8 h-4', dot: 'w-3 h-3', translate: 'translate-x-4' },
    md: { toggle: 'w-11 h-6', dot: 'w-5 h-5', translate: 'translate-x-5' },
    lg: { toggle: 'w-14 h-7', dot: 'w-6 h-6', translate: 'translate-x-7' },
  };

  const colors = {
    primary: 'bg-primary-600',
    green: 'bg-green-600',
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    purple: 'bg-purple-600',
  };

  const { toggle, dot, translate } = sizes[size];
  const activeColor = colors[color];

  return (
    <label className={`flex items-start gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`
          relative inline-flex shrink-0 ${toggle} rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 
          focus:ring-offset-2 focus:ring-primary-500
          ${checked ? activeColor : 'bg-gray-200 dark:bg-gray-700'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block ${dot} rounded-full bg-white shadow-lg 
            ring-0 transition-transform duration-200 ease-in-out
            ${checked ? translate : 'translate-x-0'}
          `}
        />
      </button>
      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span className="text-sm font-medium text-gray-900 dark:text-white">{label}</span>
          )}
          {description && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{description}</span>
          )}
        </div>
      )}
    </label>
  );
};

export default Toggle;


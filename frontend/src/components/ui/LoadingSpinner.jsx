import React from 'react';

const LoadingSpinner = ({ size = 'md', className = '', text = '' }) => {
  const sizes = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
          ${sizes[size]}
          border-4 border-primary-200 dark:border-primary-900
          border-t-primary-600 dark:border-t-primary-400
          rounded-full animate-spin
        `}
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
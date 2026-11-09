import React from 'react';

const sizes = {
  xs: 'h-3 w-3 border-2',
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
  xl: 'h-16 w-16 border-4',
};

const LoadingSpinner = ({ size = 'md', className = '', text = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
    <div
      className={`${sizes[size] || sizes.md} animate-spin rounded-full border-primary-200 border-t-primary-600 dark:border-primary-500/25 dark:border-t-primary-400`}
      aria-hidden="true"
    />
    {text && <p className="text-sm text-content-muted">{text}</p>}
    <span className="sr-only">{text || 'Loading'}</span>
  </div>
);

export default LoadingSpinner;

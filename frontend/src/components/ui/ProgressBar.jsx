import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  size = 'md',
  color = 'primary',
  showLabel = true,
  labelPosition = 'right',
  animated = false,
  striped = false,
  indeterminate = false,
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6',
  };

  const colors = {
    primary: 'bg-primary-600',
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    gradient: 'bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500',
  };

  const bgColors = {
    primary: 'bg-primary-100 dark:bg-primary-900/30',
    green: 'bg-green-100 dark:bg-green-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
    red: 'bg-red-100 dark:bg-red-900/30',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/30',
    gradient: 'bg-gray-200 dark:bg-gray-700',
  };

  const Label = () => (
    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
      {Math.round(percentage)}%
    </span>
  );

  return (
    <div className={`w-full ${className}`}>
      {showLabel && labelPosition === 'top' && (
        <div className="flex justify-between mb-1">
          <Label />
        </div>
      )}
      <div className="flex items-center gap-3">
        <div
          className={`
            flex-1 ${sizes[size]} ${bgColors[color]} rounded-full overflow-hidden
          `}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        >
          <div
            className={`
              h-full ${colors[color]} rounded-full transition-all duration-300 ease-out
              ${striped ? 'bg-stripes' : ''}
              ${animated || indeterminate ? 'animate-pulse' : ''}
              ${indeterminate ? 'w-1/3 animate-indeterminate' : ''}
            `}
            style={indeterminate ? {} : { width: `${percentage}%` }}
          />
        </div>
        {showLabel && labelPosition === 'right' && <Label />}
      </div>
      {showLabel && labelPosition === 'bottom' && (
        <div className="flex justify-between mt-1">
          <Label />
        </div>
      )}
    </div>
  );
};

// Multi-segment progress bar
export const MultiProgressBar = ({ segments = [], size = 'md', className = '' }) => {
  const sizes = {
    xs: 'h-1',
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
    xl: 'h-6',
  };

  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <div
      className={`w-full ${sizes[size]} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex ${className}`}
    >
      {segments.map((segment, index) => (
        <div
          key={index}
          className={`h-full ${segment.color || 'bg-primary-600'} transition-all duration-300`}
          style={{ width: `${(segment.value / total) * 100}%` }}
          title={segment.label}
        />
      ))}
    </div>
  );
};

// Circular progress
export const CircularProgress = ({ value = 0, size = 80, strokeWidth = 8, color = 'primary' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const colors = {
    primary: 'text-primary-600',
    green: 'text-green-500',
    blue: 'text-blue-500',
    red: 'text-red-500',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`${colors[color]} transition-all duration-300`}
        />
      </svg>
      <span className="absolute text-sm font-bold text-gray-900 dark:text-white">
        {Math.round(value)}%
      </span>
    </div>
  );
};

export default ProgressBar;


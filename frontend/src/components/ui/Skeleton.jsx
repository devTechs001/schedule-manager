import React from 'react';

const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
  animation = 'pulse',
  count = 1,
}) => {
  const animations = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const variants = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    rounded: 'rounded-xl',
  };

  const baseClasses = `bg-gray-200 dark:bg-gray-700 ${animations[animation]} ${variants[variant]}`;

  const style = {
    width: width || (variant === 'circular' ? height : '100%'),
    height: height || (variant === 'text' ? '1rem' : 'auto'),
  };

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`${baseClasses} ${className}`} style={style} />
        ))}
      </div>
    );
  }

  return <div className={`${baseClasses} ${className}`} style={style} />;
};

// Pre-built skeleton patterns
export const SkeletonCard = ({ className = '' }) => (
  <div className={`p-4 bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
    <div className="flex items-center gap-4 mb-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton width="60%" />
        <Skeleton width="40%" />
      </div>
    </div>
    <Skeleton count={3} className="mb-2" />
    <div className="flex gap-2 mt-4">
      <Skeleton width={80} height={32} variant="rounded" />
      <Skeleton width={80} height={32} variant="rounded" />
    </div>
  </div>
);

export const SkeletonList = ({ items = 5, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton width="70%" className="mb-2" />
          <Skeleton width="50%" height={12} />
        </div>
        <Skeleton width={60} height={24} variant="rounded" />
      </div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}>
    <div className="grid gap-4 p-4 border-b border-gray-200 dark:border-gray-700" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} height={20} />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, rowIdx) => (
      <div
        key={rowIdx}
        className="grid gap-4 p-4 border-b border-gray-100 dark:border-gray-700"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIdx) => (
          <Skeleton key={colIdx} height={16} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 32, md: 48, lg: 64, xl: 96 };
  return <Skeleton variant="circular" width={sizes[size]} height={sizes[size]} className={className} />;
};

export const SkeletonButton = ({ width = 100, className = '' }) => (
  <Skeleton width={width} height={40} variant="rounded" className={className} />
);

export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} />
    ))}
  </div>
);

export default Skeleton;


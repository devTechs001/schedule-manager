import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({
  children,
  content,
  position = 'top',
  delay = 200,
  disabled = false,
  arrow = true,
  maxWidth = 200,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);

  const positions = {
    top: { x: 'center', y: 'top', arrow: 'bottom' },
    bottom: { x: 'center', y: 'bottom', arrow: 'top' },
    left: { x: 'left', y: 'center', arrow: 'right' },
    right: { x: 'right', y: 'center', arrow: 'left' },
  };

  const arrowClasses = {
    top: 'left-1/2 -translate-x-1/2 -bottom-1 border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'left-1/2 -translate-x-1/2 -top-1 border-l-transparent border-r-transparent border-t-transparent',
    left: 'top-1/2 -translate-y-1/2 -right-1 border-t-transparent border-b-transparent border-r-transparent',
    right: 'top-1/2 -translate-y-1/2 -left-1 border-t-transparent border-b-transparent border-l-transparent',
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const showTooltip = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (!content) return children;

  return (
    <div
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`
            absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 dark:bg-gray-700
            rounded-lg shadow-lg whitespace-normal pointer-events-none
            animate-fade-in ${positionClasses[position]}
          `}
          style={{ maxWidth }}
        >
          {content}
          {arrow && (
            <div
              className={`
                absolute w-0 h-0 border-4 border-gray-900 dark:border-gray-700
                ${arrowClasses[position]}
              `}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Tooltip.Provider for global tooltip management
export const TooltipProvider = ({ children }) => {
  return <>{children}</>;
};

export default Tooltip;


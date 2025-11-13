import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  hoverable = false,
  className = '',
  bodyClassName = '',
  onClick,
}) => {
  const CardWrapper = hoverable ? motion.div : 'div';
  const hoverProps = hoverable ? {
    whileHover: { scale: 1.02, y: -4 },
    transition: { duration: 0.2 }
  } : {};

  return (
    <CardWrapper
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg shadow-md 
        border border-gray-200 dark:border-gray-700 
        overflow-hidden
        transition-all duration-200
        ${hoverable ? 'cursor-pointer hover:shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
      {...hoverProps}
    >
      {(title || subtitle) && (
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>

      {footer && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </CardWrapper>
  );
};

export default Card;
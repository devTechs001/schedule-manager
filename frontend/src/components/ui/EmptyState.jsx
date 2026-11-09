import React from 'react';
import { Link } from 'react-router-dom';

/**
 * EmptyState — used across pages so "nothing here" never looks broken.
 */
const EmptyState = ({
  icon = null,
  title = 'Nothing here yet',
  description = '',
  action = null,
  actionLabel,
  actionTo,
  className = '',
  compact = false,
}) => (
  <div className={`empty-state ${compact ? 'py-8' : ''} ${className}`}>
    {icon && (
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-2xl text-primary-500 dark:bg-primary-500/10 dark:text-primary-300">
        {icon}
      </div>
    )}
    <h3 className="text-base font-semibold text-content">{title}</h3>
    {description && <p className="max-w-md text-sm text-content-muted">{description}</p>}
    {action}
    {!action && actionLabel && actionTo && (
      <Link to={actionTo} className="btn btn-primary btn-sm mt-1">
        {actionLabel}
      </Link>
    )}
  </div>
);

export default EmptyState;

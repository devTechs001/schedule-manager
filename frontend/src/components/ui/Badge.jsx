import React from 'react';

const VARIANTS = {
  primary: 'badge-accent',
  secondary: 'badge-neutral',
  neutral: 'badge-neutral',
  success: 'badge-success',
  danger: 'badge-danger',
  warning: 'badge-warning',
  info: 'badge-accent',
  outline: 'border border-line text-content-muted',
};

const Badge = ({ children, variant = 'primary', icon, className = '', dot = false }) => (
  <span className={`badge ${VARIANTS[variant] || VARIANTS.primary} ${className}`}>
    {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
    {icon && <span className="text-[0.7em]">{icon}</span>}
    {children}
  </span>
);

export default Badge;

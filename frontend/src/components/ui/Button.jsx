import React from 'react';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  danger: 'btn-danger',
  warning: 'btn bg-amber-500 text-white hover:bg-amber-600',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  gradient: 'btn-gradient',
  link: 'text-primary-600 hover:text-primary-700 font-semibold underline-offset-4 hover:underline',
};

const SIZES = {
  xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: '',
  lg: 'px-6 py-3 text-base rounded-2xl',
  xl: 'px-8 py-4 text-lg rounded-2xl',
};

const Spinner = () => (
  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const base = variant === 'link' ? 'inline-flex items-center gap-1.5 transition-colors' : 'btn';
  const classes = [
    base,
    VARIANTS[variant] || VARIANTS.primary,
    SIZES[size] || '',
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={classes}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Spinner /> : icon ? <span className="shrink-0">{icon}</span> : null}
      {children}
      {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
};

export default Button;

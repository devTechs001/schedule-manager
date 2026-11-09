import React from 'react';
import { Link } from 'react-router-dom';

const TONES = {
  accent: 'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300',
  violet: 'bg-secondary-50 text-secondary-600 dark:bg-secondary-500/15 dark:text-secondary-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300',
  sky: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  slate: 'bg-gray-100 text-content-muted dark:bg-white/10',
};

const StatCard = ({
  label,
  value,
  hint,
  icon,
  tone = 'accent',
  trend,
  to,
  onClick,
  className = '',
}) => {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">
            {label}
          </p>
          <p className="mt-2 font-display text-3xl font-bold leading-none text-content">
            {value ?? '—'}
          </p>
          {hint && <p className="mt-2 truncate text-xs text-content-muted">{hint}</p>}
        </div>
        {icon && <div className={`stat-icon ${TONES[tone] || TONES.accent}`}>{icon}</div>}
      </div>
      {typeof trend === 'number' && (
        <div className="mt-4 flex items-center gap-1.5 text-xs font-medium">
          <span className={trend >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
          <span className="text-content-subtle">vs last week</span>
        </div>
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`stat-card group block ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={`stat-card ${className}`} onClick={onClick} role={onClick ? 'button' : undefined}>
      {content}
    </div>
  );
};

export default StatCard;

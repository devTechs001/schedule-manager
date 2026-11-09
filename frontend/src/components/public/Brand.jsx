import React from 'react';
import { Link } from 'react-router-dom';

export const LogoMark = ({ size = 36, className = '' }) => (
  <span
    className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[0.9rem] bg-accent-gradient text-white shadow-glow ${className}`}
    style={{ width: size, height: size }}
    aria-hidden="true"
  >
    <svg viewBox="0 0 24 24" width={size * 0.58} height={size * 0.58} fill="none">
      <rect x="3" y="4.5" width="18" height="16" rx="4" stroke="currentColor" strokeWidth="1.7" opacity="0.9" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.7" opacity="0.9" />
      <path d="M8 2.8v3.4M16 2.8v3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M7.6 13.4l2.1 2.1 4.7-4.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
);

const Brand = ({ to = '/', size = 36, showText = true, subtitle = null, className = '' }) => (
  <Link to={to} className={`group inline-flex items-center gap-2.5 ${className}`}>
    <LogoMark size={size} />
    {showText && (
      <span className="leading-tight">
        <span className="block font-display text-[1.05rem] font-bold tracking-tight text-content">
          Sched<span className="gradient-text">AI</span>
        </span>
        {subtitle && <span className="block text-[0.68rem] font-medium text-content-subtle">{subtitle}</span>}
      </span>
    )}
  </Link>
);

export default Brand;

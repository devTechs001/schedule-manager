import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheck, FaArrowLeft } from 'react-icons/fa';
import Brand from '@components/public/Brand';
import ThemeMenu from '@components/layout/ThemeMenu';

/**
 * Shared split-screen shell for Login / Register / Biometric pages.
 */
const AuthShell = ({ children, title, subtitle, footer, highlights = [] }) => (
  <div className="app-shell grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
    {/* Left: brand panel (desktop) */}
    <aside className="relative hidden overflow-hidden bg-accent-gradient p-10 text-white lg:flex lg:flex-col">
      <div className="pointer-events-none absolute inset-0 opacity-30" aria-hidden="true">
        <div className="absolute -left-20 -top-24 h-80 w-80 rounded-full bg-white/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-black/20 blur-3xl" />
      </div>

      <div className="relative">
        <Link to="/" className="inline-flex items-center gap-2.5 text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
              <rect x="3" y="4.5" width="18" height="16" rx="4" stroke="currentColor" strokeWidth="1.7" />
              <path d="M3 9h18M8 2.8v3.4M16 2.8v3.4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M7.6 13.4l2.1 2.1 4.7-4.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold">SchedAI</span>
        </Link>
      </div>

      <div className="relative my-auto max-w-md">
        <h2 className="text-3xl font-bold leading-tight">
          Stop juggling tabs.
          <br /> Start finishing days.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/80">
          Tasks, calendar and email in one calm plan — with an AI that does the boring sorting so
          you can do the real work.
        </p>

        <ul className="mt-8 space-y-3">
          {[
            'AI prioritises your list every morning',
            'Calendar conflicts resolved in one tap',
            'Works offline, installs like an app',
            'Five themes, six accents, dark mode',
          ].map((item) => (
            <li key={item} className="flex items-center gap-3 text-sm text-white/90">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                <FaCheck size={8} />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-white/60">
        © {new Date().getFullYear()} SchedAI · Built for people who hate busywork
      </p>
    </aside>

    {/* Right: form */}
    <main className="flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <Link to="/" className="btn btn-ghost btn-sm -ml-2">
          <FaArrowLeft size={10} /> Home
        </Link>
        <ThemeMenu compact />
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-7 lg:hidden">
            <Brand size={40} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-2 text-sm text-content-muted">{subtitle}</p>}

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-6">{footer}</div>}

          {highlights.length > 0 && (
            <ul className="mt-8 grid gap-2 border-t border-line pt-5 text-xs text-content-muted sm:grid-cols-2">
              {highlights.map((highlight) => (
                <li key={highlight} className="flex items-center gap-2">
                  <FaCheck className="shrink-0 text-emerald-500" size={9} /> {highlight}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  </div>
);

export default AuthShell;

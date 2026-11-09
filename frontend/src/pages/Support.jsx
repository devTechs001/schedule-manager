import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaBookOpen,
  FaEnvelope,
  FaQuestionCircle,
  FaSearch,
  FaCheckCircle,
  FaChevronDown,
} from 'react-icons/fa';
import Brand from '@components/public/Brand';
import { useTheme } from '@contexts/ThemeContext';

const FAQS = [
  {
    q: 'Is there a demo I can try without signing up?',
    a: 'Yes. Any “Try the live demo” button starts a sandbox session with sample tasks, events and email. If the server has no database available, the app falls back to a local sandbox stored in your browser.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Your account data lives in the application database. Changes are also cached in your browser so the app keeps working offline and syncs back when you reconnect.',
  },
  {
    q: 'How do I get my emails into the inbox?',
    a: 'Open Settings → Integrations to connect a provider. Until then the inbox runs against local sample data so you can explore every feature.',
  },
  {
    q: 'Can I change how the app looks?',
    a: 'Five themes, six accent colours, light/dark mode, compact density and reduced motion are all available from the theme menu in the top bar, and your choice is remembered.',
  },
  {
    q: 'Why do some AI features show as unavailable?',
    a: 'AI features need a configured model provider. When one is missing the app degrades gracefully rather than failing — the rest of the workspace keeps working.',
  },
  {
    q: 'How do I delete my account?',
    a: 'Send us a message below from the email address on the account and we will remove it, including all associated tasks, events, emails and contacts.',
  },
];

const CHANNELS = [
  {
    icon: FaEnvelope,
    title: 'Email support',
    body: 'Best for account, billing or data questions. We reply within one business day.',
    action: 'mailto:hello@schedai.app',
    actionLabel: 'hello@schedai.app',
  },
  {
    icon: FaBookOpen,
    title: 'Feature tour',
    body: 'A guided walkthrough of tasks, calendar, planner, focus timer and email.',
    action: '/tour',
    actionLabel: 'Start the tour',
    internal: true,
  },
  {
    icon: FaQuestionCircle,
    title: 'Send a message',
    body: 'Use the contact form for bugs, feedback or feature requests.',
    action: '/contact',
    actionLabel: 'Open contact form',
    internal: true,
  },
];

const Support = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    document.title = 'Support — SchedAI';
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return FAQS;
    return FAQS.filter(
      (item) =>
        item.q.toLowerCase().includes(term) || item.a.toLowerCase().includes(term)
    );
  }, [query]);

  return (
    <div className="app-shell min-h-screen">
      <header className="border-b border-line bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Brand to="/" size={32} subtitle={theme === 'dark' ? null : 'Support'} />
          <Link to="/" className="btn btn-ghost btn-sm">
            <FaArrowLeft size={9} /> Back to site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-600">Support</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-content sm:text-4xl">
            How can we help?
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm text-content-muted">
            Search the common questions, or reach a human — whichever is faster.
          </p>

          <div className="relative mx-auto mt-6 max-w-md">
            <FaSearch
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-content-subtle"
              size={12}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search help topics…"
              aria-label="Search help topics"
              className="input py-2.5 pl-11 text-sm"
            />
          </div>
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {CHANNELS.map((channel) => {
            const Inner = (
              <>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                  <channel.icon size={13} />
                </span>
                <p className="mt-3 text-sm font-semibold text-content">{channel.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-content-muted">{channel.body}</p>
                <span className="mt-3 block text-xs font-semibold text-primary-600">
                  {channel.actionLabel} →
                </span>
              </>
            );

            return channel.internal ? (
              <Link
                key={channel.title}
                to={channel.action}
                className="card p-4 transition-shadow hover:shadow-lift"
              >
                {Inner}
              </Link>
            ) : (
              <a
                key={channel.title}
                href={channel.action}
                className="card p-4 transition-shadow hover:shadow-lift"
              >
                {Inner}
              </a>
            );
          })}
        </div>

        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-content-subtle">
            Frequent questions
          </h2>

          {filtered.length === 0 ? (
            <div className="card mt-4 p-8 text-center">
              <p className="text-sm font-medium text-content">No help topic matches “{query}”.</p>
              <p className="mt-1 text-xs text-content-muted">
                Try a shorter term, or email{' '}
                <a href="mailto:hello@schedai.app" className="link">
                  hello@schedai.app
                </a>
                .
              </p>
            </div>
          ) : (
            <ul className="card mt-4 divide-y divide-line overflow-hidden">
              {filtered.map((item, index) => {
                const isOpen = open === index;
                return (
                  <li key={item.q}>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-left hover:bg-surface-sunken"
                    >
                      <span className="text-sm font-medium text-content">{item.q}</span>
                      <FaChevronDown
                        size={10}
                        className={`shrink-0 text-content-subtle transition-transform ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <p className="animate-fade-in px-4 pb-4 text-xs leading-relaxed text-content-muted">
                        {item.a}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="mt-10 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
          <FaCheckCircle size={11} />
          Check service availability on the{' '}
          <Link to="/status" className="font-semibold underline underline-offset-2">
            status page
          </Link>
          .
        </div>
      </main>
    </div>
  );
};

export default Support;

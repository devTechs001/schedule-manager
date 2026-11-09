import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSyncAlt,
  FaClock,
} from 'react-icons/fa';
import Brand from '@components/public/Brand';

const ENDPOINT = `${(import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')}/health`;

/**
 * Status page. Reads the live `/health` endpoint rather than inventing uptime
 * numbers, so what it shows is what the API actually reports.
 */
const Status = () => {
  const [state, setState] = useState({ phase: 'loading', data: null, error: null, checkedAt: null });

  const check = useCallback(async () => {
    setState((prev) => ({ ...prev, phase: 'loading', error: null }));
    try {
      // The health route is mounted at the API root, not under /api.
      const response = await fetch(ENDPOINT.replace('/api/health', '/health'), {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setState({ phase: 'ready', data, error: null, checkedAt: new Date() });
    } catch (error) {
      setState({ phase: 'error', data: null, error: error.message, checkedAt: new Date() });
    }
  }, []);

  useEffect(() => {
    document.title = 'Status — SchedAI';
    check();
    const id = window.setInterval(check, 30000);
    return () => window.clearInterval(id);
  }, [check]);

  const dbOk = state.data?.database === 'connected';
  const apiOk = state.phase === 'ready';

  const services = [
    {
      name: 'Web application',
      detail: 'The page you are reading. Served as a static bundle with a service worker.',
      ok: true,
    },
    {
      name: 'API',
      detail: apiOk ? `Responding · ${state.data?.environment || 'unknown'} environment` : 'No response from the API',
      ok: apiOk,
    },
    {
      name: 'Database',
      detail: dbOk
        ? 'Connected — accounts, tasks and events persist.'
        : 'Not connected — the app runs in local sandbox mode and data stays in this browser.',
      ok: dbOk,
      warn: !dbOk,
    },
  ];

  const uptime = state.data?.uptime
    ? `${Math.floor(state.data.uptime / 3600)}h ${Math.floor((state.data.uptime % 3600) / 60)}m`
    : null;

  return (
    <div className="app-shell min-h-screen">
      <header className="border-b border-line bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Brand to="/" size={32} subtitle="Status" />
          <Link to="/support" className="btn btn-ghost btn-sm">
            <FaArrowLeft size={9} /> Support
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-content">
              System status
            </h1>
            <p className="mt-1 text-sm text-content-muted">
              Live, unedited checks — refreshed every 30 seconds.
            </p>
          </div>
          <button
            type="button"
            onClick={check}
            className="btn btn-outline btn-sm"
            disabled={state.phase === 'loading'}
          >
            <FaSyncAlt size={9} className={state.phase === 'loading' ? 'animate-spin' : ''} />
            {state.phase === 'loading' ? 'Checking…' : 'Refresh'}
          </button>
        </div>

        <div
          className={[
            'mt-6 flex items-center gap-3 rounded-2xl border px-4 py-4',
            state.phase === 'loading'
              ? 'border-line bg-surface-sunken'
              : apiOk
                ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/25 dark:bg-emerald-500/10'
                : 'border-rose-200 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10',
          ].join(' ')}
        >
          {state.phase === 'loading' ? (
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-content-subtle" />
          ) : apiOk ? (
            <FaCheckCircle className="text-emerald-600" size={15} />
          ) : (
            <FaExclamationTriangle className="text-rose-600" size={15} />
          )}
          <div>
            <p className="text-sm font-semibold text-content">
              {state.phase === 'loading'
                ? 'Running checks…'
                : apiOk
                  ? 'All core services responding'
                  : 'The API is not reachable right now'}
            </p>
            <p className="mt-0.5 text-xs text-content-muted">
              {state.error
                ? `Last check failed: ${state.error}`
                : apiOk
                  ? 'The application works with or without a database — offline mode takes over automatically.'
                  : 'The page still loads from cache; changes save locally until the API returns.'}
            </p>
          </div>
        </div>

        <ul className="card mt-4 divide-y divide-line overflow-hidden">
          {services.map((service) => (
            <li key={service.name} className="flex items-start gap-3 px-4 py-4">
              <span
                className={[
                  'mt-1 h-2 w-2 shrink-0 rounded-full',
                  service.ok ? 'bg-emerald-500' : service.warn ? 'bg-amber-500' : 'bg-rose-500',
                ].join(' ')}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-content">{service.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-content-muted">{service.detail}</p>
              </div>
              <span
                className={`badge shrink-0 ${service.ok ? 'badge-success' : service.warn ? 'badge-warning' : 'badge-danger'}`}
              >
                {service.ok ? 'operational' : service.warn ? 'degraded' : 'down'}
              </span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ['Environment', state.data?.environment || '—'],
            ['Uptime', uptime || '—'],
            [
              'Last check',
              state.checkedAt
                ? state.checkedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : '—',
            ],
          ].map(([label, value]) => (
            <div key={label} className="card px-4 py-3">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">
                {label}
              </dt>
              <dd className="mt-1 text-sm font-medium capitalize text-content">{value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 flex items-center gap-1.5 text-xs text-content-subtle">
          <FaClock size={9} />
          Something wrong that this page does not show?{' '}
          <Link to="/contact" className="link font-semibold">
            Tell us
          </Link>
          .
        </p>
      </main>
    </div>
  );
};

export default Status;

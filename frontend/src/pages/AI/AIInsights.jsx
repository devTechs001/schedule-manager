import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaRobot,
  FaLightbulb,
  FaBrain,
  FaExclamationTriangle,
  FaSync,
  FaCheckCircle,
} from 'react-icons/fa';
import aiAPI from '@services/api/aiAPI';
import EmptyState from '@components/ui/EmptyState';
import Skeleton from '@components/ui/Skeleton';
import AISuggestions from '@components/ai/AISuggestions';

/**
 * AI insights.
 *
 * Wired to GET /api/ai/insights, which computes observations from the signed-in
 * user's real tasks and events. This page previously ran
 * `setInsights(sampleInsights)` on mount, so every visitor was told they were
 * "most productive between 9 AM and 11 AM" — a claim invented in the browser.
 */

const TONE = {
  productivity: { icon: FaBrain, tone: 'text-primary-600 dark:text-primary-300', bg: 'bg-primary-50 dark:bg-primary-500/15' },
  time: { icon: FaLightbulb, tone: 'text-amber-600 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-400/15' },
  suggestion: { icon: FaLightbulb, tone: 'text-sky-600 dark:text-sky-300', bg: 'bg-sky-50 dark:bg-sky-400/15' },
  warning: { icon: FaExclamationTriangle, tone: 'text-rose-600 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-400/15' },
};

const AIInsightsPage = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState(null);

  /*
   * Suggestions are a separate endpoint (/ai/suggestions) that reasons about
   * open tasks. It is loaded lazily — if the AI provider is not configured it
   * returns [] and we simply do not render the section, rather than blocking
   * the page on an optional feature.
   */
  const loadSuggestions = React.useCallback(async () => {
    setSuggestionsLoading(true);
    try {
      const data = await aiAPI.getSuggestions('Improve focus this week');
      const list = Array.isArray(data) ? data : [];
      setSuggestions(list.map((item, index) => ({ ...item, _id: item._id || `suggestion-${index}` })));
      setSuggestionsError(null);
    } catch (err) {
      setSuggestions([]);
      setSuggestionsError(
        err?.status === 503
          ? 'Suggestion drafting needs an AI provider — the insights above do not.'
          : err?.message || 'Could not load suggestions.'
      );
    } finally {
      setSuggestionsLoading(false);
    }
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await aiAPI.getInsights();
      const list = Array.isArray(data) ? data : Array.isArray(data?.insights) ? data.insights : [];
      setInsights(list);
      setError(null);
    } catch (err) {
      setInsights([]);
      setError(
        err.status === 503
          ? 'Insights need a database connection. Your tasks are safe; analysis resumes once it is reachable.'
          : err.message || 'Could not load insights.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'AI insights — SchedAI';
    load();
    loadSuggestions();
  }, [load, loadSuggestions]);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
            <FaRobot size={17} />
          </span>
          <div>
            <h1 className="page-title">AI insights</h1>
            <p className="page-subtitle">Observations drawn from your own tasks and calendar.</p>
          </div>
        </div>
        <button type="button" onClick={load} className="btn btn-outline btn-sm self-start">
          <FaSync size={9} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="card space-y-2 p-4">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="100%" />
              <Skeleton variant="text" width="70%" />
            </div>
          ))}
        </div>
      )}


      {!loading && error && (
        <div className="card flex flex-col items-center gap-3 px-4 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-400/15 dark:text-amber-300">
            <FaExclamationTriangle size={16} />
          </span>
          <p className="text-sm font-semibold text-content">Insights are unavailable</p>
          <p className="max-w-md text-xs leading-relaxed text-content-muted">{error}</p>
          <button type="button" onClick={load} className="btn btn-outline btn-sm mt-1">
            <FaSync size={9} /> Try again
          </button>
        </div>
      )}

      {!loading && !error && insights.length === 0 && (
        <EmptyState
          icon={<FaCheckCircle size={20} />}
          title="Nothing needs your attention"
          description="No insights right now. Add tasks and events — patterns worth flagging will appear here."
          action={
            <Link to="/tasks" className="btn btn-primary btn-sm">
              Go to tasks
            </Link>
          }
        />
      )}

      {!loading && !error && insights.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {insights.map((insight, index) => {
            const style = TONE[insight.type] || TONE.suggestion;
            const Icon = style.icon;
            return (
              <article key={insight.id || index} className="card flex gap-3 p-4">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.bg} ${style.tone}`}>
                  <Icon size={13} />
                </span>
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-content">{insight.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-content-muted">
                    {insight.description}
                  </p>
                  {insight.action && (
                    <span className="mt-2 inline-block text-[0.65rem] font-semibold text-primary-600 dark:text-primary-300">
                      {insight.action}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-content">Suggested next steps</h2>
          <button
            type="button"
            onClick={loadSuggestions}
            disabled={suggestionsLoading}
            className="text-xs font-semibold text-primary-600 hover:underline disabled:opacity-50 dark:text-primary-300"
          >
            {suggestionsLoading ? 'Drafting…' : 'Refresh suggestions'}
          </button>
        </div>

        {suggestionsError ? (
          <p className="rounded-xl border border-line bg-surface-raised p-4 text-xs text-content-muted">
            {suggestionsError}
          </p>
        ) : (
          <AISuggestions
            suggestions={suggestions}
            onAccept={(suggestion) => {
              setSuggestions((current) => current.filter((item) => item._id !== suggestion._id));
            }}
            onReject={(id) => {
              setSuggestions((current) => current.filter((item) => item._id !== id));
            }}
          />
        )}
      </section>
    </div>
  );
};

export default AIInsightsPage;

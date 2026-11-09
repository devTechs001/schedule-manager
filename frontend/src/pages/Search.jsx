import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FaSearch,
  FaTasks,
  FaCalendarAlt,
  FaEnvelope,
  FaUsers,
  FaTimes,
  FaArrowRight,
  FaLightbulb,
} from 'react-icons/fa';
import { format, isValid } from 'date-fns';
import { useTasks } from '@hooks/useTasks';
import { useSchedule } from '@hooks/useSchedule';
import { useEmails } from '@hooks/useEmails';
import { useContacts } from '@hooks/useContacts';
import EmptyState from '@components/ui/EmptyState';

const GROUPS = [
  { id: 'tasks', label: 'Tasks', icon: FaTasks, to: '/tasks', tone: 'text-primary-600 bg-primary-50 dark:bg-primary-500/15 dark:text-primary-300' },
  { id: 'events', label: 'Events', icon: FaCalendarAlt, to: '/schedule', tone: 'text-amber-600 bg-amber-50 dark:bg-amber-500/15 dark:text-amber-300' },
  { id: 'emails', label: 'Emails', icon: FaEnvelope, to: '/emails', tone: 'text-secondary-600 bg-secondary-50 dark:bg-secondary-500/15 dark:text-secondary-300' },
  { id: 'contacts', label: 'Contacts', icon: FaUsers, to: '/contacts', tone: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/15 dark:text-emerald-300' },
];

const safeDate = (value, pattern = 'MMM d') => {
  if (!value) return '';
  const date = new Date(value);
  return isValid(date) ? format(date, pattern) : '';
};

const matches = (haystack, needle) =>
  String(haystack || '').toLowerCase().includes(needle.toLowerCase());

const Search = () => {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const [query, setQuery] = useState(params.get('q') || '');
  const [only, setOnly] = useState('all');

  const { tasks } = useTasks();
  const { events } = useSchedule();
  const { emails } = useEmails();
  const { contacts } = useContacts();

  useEffect(() => {
    document.title = 'Search — SchedAI';
  }, []);

  // Debounce URL sync so reloads/shares keep the query
  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = new URLSearchParams(params);
      if (query) next.set('q', query);
      else next.delete('q');
      setParams(next, { replace: true });
    }, 400);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const results = useMemo(() => {
    const term = query.trim();
    if (term.length < 2) {
      return { tasks: [], events: [], emails: [], contacts: [], total: 0 };
    }

    const taskHits = (Array.isArray(tasks) ? tasks : [])
      .filter((task) => matches(task.title, term) || matches(task.description, term))
      .slice(0, 8)
      .map((task) => ({
        id: task._id,
        title: task.title,
        meta: [task.status, safeDate(task.dueDate)].filter(Boolean).join(' · '),
        to: '/tasks',
      }));

    const eventHits = (Array.isArray(events) ? events : [])
      .filter((event) => matches(event.title, term) || matches(event.description, term) || matches(event.location, term))
      .slice(0, 8)
      .map((event) => ({
        id: event._id,
        title: event.title,
        meta: [safeDate(event.start, 'EEE, MMM d · h:mm a'), event.location].filter(Boolean).join(' · '),
        to: '/schedule',
      }));

    const emailHits = (Array.isArray(emails) ? emails : [])
      .filter((email) => matches(email.subject, term) || matches(email.from, term) || matches(email.body, term))
      .slice(0, 8)
      .map((email) => ({
        id: email._id,
        title: email.subject || '(no subject)',
        meta: email.from,
        to: '/emails',
      }));

    const contactHits = (Array.isArray(contacts) ? contacts : [])
      .filter(
        (contact) =>
          matches(contact.name, term) || matches(contact.email, term) || matches(contact.company, term)
      )
      .slice(0, 8)
      .map((contact) => ({
        id: contact._id,
        title: contact.name,
        meta: [contact.company, contact.email].filter(Boolean).join(' · '),
        to: '/contacts',
      }));

    return {
      tasks: taskHits,
      events: eventHits,
      emails: emailHits,
      contacts: contactHits,
      total: taskHits.length + eventHits.length + emailHits.length + contactHits.length,
    };
  }, [query, tasks, events, emails, contacts]);

  const visibleGroups = GROUPS.filter((group) => only === 'all' || group.id === only);

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Search</h1>
          <p className="page-subtitle">One box across tasks, events, email and contacts.</p>
        </div>
      </div>

      <div className="card p-4">
        <div className="relative">
          <FaSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-content-subtle" size={13} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search anything — a project, person, subject or place…"
            className="input py-3 pl-11 pr-11 text-sm"
            autoFocus
            aria-label="Search everything"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-content-subtle hover:bg-gray-100 dark:hover:bg-white/5"
              aria-label="Clear search"
            >
              <FaTimes size={11} />
            </button>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setOnly('all')}
            className={`chip ${only === 'all' ? 'chip-active' : ''}`}
          >
            Everything
            {results.total > 0 && <span className="ml-1 opacity-70">{results.total}</span>}
          </button>
          {GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              onClick={() => setOnly(group.id)}
              className={`chip ${only === group.id ? 'chip-active' : ''}`}
            >
              <group.icon size={9} /> {group.label}
              {results[group.id].length > 0 && (
                <span className="ml-1 opacity-70">{results[group.id].length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {query.trim().length < 2 && (
        <EmptyState
          icon={<FaLightbulb />}
          title="Start typing to search everything"
          description="Try a client name, a subject line, or a place. Results update as you type."
        />
      )}

      {query.trim().length >= 2 && results.total === 0 && (
        <EmptyState
          icon={<FaSearch />}
          title={`No matches for “${query.trim()}”`}
          description="Check the spelling or try a shorter, broader term."
        />
      )}

      {visibleGroups.map((group) => {
        const hits = results[group.id];
        if (hits.length === 0) return null;
        return (
          <div key={group.id} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-content">
                <span className={`flex h-6 w-6 items-center justify-center rounded-lg ${group.tone}`}>
                  <group.icon size={10} />
                </span>
                {group.label}
                <span className="text-xs font-normal text-content-subtle">{hits.length}</span>
              </p>
              <button
                type="button"
                onClick={() => navigate(group.to)}
                className="btn btn-ghost btn-sm"
              >
                Open <FaArrowRight size={8} />
              </button>
            </div>
            <ul className="divide-y divide-line">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <button
                    type="button"
                    onClick={() => navigate(hit.to)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-sunken"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-content">{hit.title}</span>
                      {hit.meta && (
                        <span className="block truncate text-xs capitalize text-content-subtle">{hit.meta}</span>
                      )}
                    </span>
                    <FaArrowRight size={9} className="shrink-0 text-content-subtle" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
};

export default Search;

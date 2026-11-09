import React, { useMemo, useState } from 'react';
import { FaInbox, FaStar, FaRegStar, FaSearch, FaPaperclip } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import EmptyState from '@components/ui/EmptyState';

const safeText = (value) => (typeof value === 'string' ? value : '');

const EmailInbox = ({ emails = [], onSelectEmail, selectedEmail, onToggleStar, loading = false }) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const list = Array.isArray(emails) ? emails : [];
    const term = query.trim().toLowerCase();
    if (!term) return list;
    return list.filter(
      (email) =>
        safeText(email.subject).toLowerCase().includes(term) ||
        safeText(email.from).toLowerCase().includes(term)
    );
  }, [emails, query]);

  return (
    <div className="card flex h-full min-h-[28rem] flex-col overflow-hidden">
      <div className="border-b border-line p-3">
        <div className="relative">
          <FaSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search this folder…"
            className="input pl-9 text-xs"
            aria-label="Search emails"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && filtered.length === 0 && (
          <div className="space-y-2 p-3">
            {[0, 1, 2, 3].map((index) => (
              <div key={index} className="skeleton h-16 w-full" />
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-4">
            <EmptyState
              compact
              icon={<FaInbox />}
              title={query ? 'No emails match' : 'Folder is empty'}
              description={query ? 'Try a different search term.' : 'Nothing here for the selected filter yet.'}
            />
          </div>
        )}

        <ul className="divide-y divide-line">
          {filtered.map((email) => {
            const isSelected = selectedEmail?._id && selectedEmail._id === email._id;
            return (
              <li key={email._id}>
                <div
                  className={`flex cursor-pointer items-start gap-2.5 px-3.5 py-3 transition-colors ${
                    isSelected ? 'bg-primary-50/70 dark:bg-primary-500/10' : 'hover:bg-surface-sunken'
                  }`}
                  onClick={() => onSelectEmail?.(email)}
                >
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onToggleStar?.(email._id);
                    }}
                    aria-label={email.starred ? 'Unstar' : 'Star'}
                    className={`mt-0.5 shrink-0 transition-colors ${
                      email.starred ? 'text-amber-400' : 'text-content-subtle hover:text-amber-400'
                    }`}
                  >
                    {email.starred ? <FaStar size={11} /> : <FaRegStar size={11} />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={`truncate text-xs ${
                          email.read ? 'font-medium text-content-muted' : 'font-bold text-content'
                        }`}
                      >
                        {email.from || 'Unknown sender'}
                      </p>
                      <span className="shrink-0 text-[0.6rem] text-content-subtle">
                        {email.createdAt
                          ? formatDistanceToNow(new Date(email.createdAt), { addSuffix: true })
                          : ''}
                      </span>
                    </div>
                    <p
                      className={`mt-0.5 truncate text-xs ${
                        email.read ? 'text-content-muted' : 'font-semibold text-content'
                      }`}
                    >
                      {email.subject || '(no subject)'}
                    </p>
                    <p className="mt-0.5 truncate text-[0.68rem] text-content-subtle">
                      {safeText(email.body).slice(0, 90)}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      {!email.read && <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />}
                      {Array.isArray(email.attachments) && email.attachments.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[0.6rem] text-content-subtle">
                          <FaPaperclip size={7} /> {email.attachments.length}
                        </span>
                      )}
                      {Array.isArray(email.labels) &&
                        email.labels.slice(0, 2).map((label) => (
                          <span
                            key={label}
                            className="rounded bg-surface-sunken px-1.5 py-0.5 text-[0.58rem] font-medium text-content-subtle"
                          >
                            {label}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default EmailInbox;

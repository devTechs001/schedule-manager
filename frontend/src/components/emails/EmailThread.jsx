import React from 'react';
import { FaStar, FaRegStar, FaReply, FaTrash, FaPaperclip, FaEnvelopeOpenText } from 'react-icons/fa';
import { format, isValid } from 'date-fns';
import EmptyState from '@components/ui/EmptyState';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return isValid(date) ? format(date, 'PPp') : '';
};

const EmailThread = ({ email, onReply, onDelete, onToggleStar }) => {
  if (!email) {
    return (
      <div className="card flex h-full min-h-[28rem] items-center justify-center">
        <EmptyState
          icon={<FaEnvelopeOpenText />}
          title="Select an email"
          description="Pick a message on the left to read it here."
        />
      </div>
    );
  }

  return (
    <div className="card flex h-full min-h-[28rem] flex-col overflow-hidden">
      <div className="border-b border-line p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-snug text-content sm:text-lg">
              {email.subject || '(no subject)'}
            </h2>
            <p className="mt-1.5 truncate text-xs text-content-muted">
              From <span className="font-semibold text-content">{email.from || 'Unknown sender'}</span>
              {Array.isArray(email.to) && email.to.length > 0 && (
                <span className="text-content-subtle"> · to {email.to.join(', ')}</span>
              )}
            </p>
            <p className="mt-0.5 text-[0.68rem] text-content-subtle">{formatDate(email.createdAt || email.date)}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onToggleStar?.(email._id)}
              className={`btn btn-ghost btn-icon ${email.starred ? 'text-amber-400' : ''}`}
              aria-label={email.starred ? 'Unstar email' : 'Star email'}
            >
              {email.starred ? <FaStar size={13} /> : <FaRegStar size={13} />}
            </button>
            <button type="button" onClick={() => onReply?.(email)} className="btn btn-ghost btn-icon" aria-label="Reply">
              <FaReply size={13} />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(email._id)}
              className="btn btn-ghost btn-icon text-rose-500"
              aria-label="Delete email"
            >
              <FaTrash size={13} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-5">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-content-muted">
          {email.body || '(This message has no content.)'}
        </div>

        {Array.isArray(email.attachments) && email.attachments.length > 0 && (
          <div className="mt-5 border-t border-line pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-content-subtle">
              Attachments
            </p>
            <div className="flex flex-wrap gap-2">
              {email.attachments.map((attachment) => (
                <a
                  key={attachment.url || attachment.filename}
                  href={attachment.url || '#'}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-2 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs text-content-muted hover:border-primary-300"
                >
                  <FaPaperclip size={9} /> {attachment.filename || 'attachment'}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-t border-line bg-surface-sunken/60 p-3">
        <button type="button" onClick={() => onReply?.(email)} className="btn btn-primary btn-sm">
          <FaReply size={10} /> Reply
        </button>
        <button
          type="button"
          onClick={() => onDelete?.(email._id)}
          className="btn btn-outline btn-sm text-rose-500"
        >
          <FaTrash size={10} /> Delete
        </button>
      </div>
    </div>
  );
};

export default EmailThread;

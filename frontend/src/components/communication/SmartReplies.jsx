import React, { useState } from 'react';
import { FaMagic, FaPaperPlane, FaEdit, FaRedo, FaExclamationTriangle } from 'react-icons/fa';
import aiAPI from '@services/api/aiAPI';

/**
 * Draft replies to an incoming message.
 *
 * The suggestions come from `POST /ai/replies`, which drafts from the actual
 * message text. When no AI provider is configured the endpoint fails and we
 * surface that — the composer still works, the user just has to write their
 * own reply. Previously this component showed three fixed strings regardless
 * of the message.
 */
const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'brief', label: 'Brief' },
  { value: 'detailed', label: 'Detailed' },
];

const SmartReplies = ({ originalMessage = '', onSend, onEdit }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [customReply, setCustomReply] = useState('');
  const [tone, setTone] = useState('professional');
  const [error, setError] = useState('');
  const [hasGenerated, setHasGenerated] = useState(false);

  const messageText = String(originalMessage || '').trim();

  const generateReplies = async () => {
    if (!messageText || isGenerating) return;

    setIsGenerating(true);
    setError('');

    try {
      const replies = await aiAPI.draftReplies(messageText, tone, 3);
      const list = Array.isArray(replies) ? replies.filter((r) => r && r.text) : [];
      setSuggestions(list);
      setSelectedReply(null);
      setHasGenerated(true);
    } catch (err) {
      setSuggestions([]);
      setError(
        err?.status === 503
          ? 'Reply drafting is unavailable: the server has no AI provider configured.'
          : err?.message || 'Could not draft replies. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSend = () => {
    const text = selectedReply != null
      ? suggestions.find((s) => s.id === selectedReply)?.text
      : customReply.trim();

    if (text) onSend?.(text);
  };

  const handleEdit = (text) => {
    setCustomReply(text);
    setSelectedReply(null);
    onEdit?.(text);
  };

  return (
    <div className="card p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <FaMagic className="text-primary-600" />
          <h3 className="font-semibold text-content">Smart replies</h3>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <span className="sr-only">Tone</span>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="input w-auto"
            aria-label="Reply tone"
          >
            {TONES.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {!messageText && (
        <p className="mb-4 rounded-lg bg-surface-sunken p-3 text-sm text-content-muted">
          Select a message to draft replies for it.
        </p>
      )}

      <button
        type="button"
        onClick={generateReplies}
        disabled={!messageText || isGenerating}
        className="btn btn-primary w-full justify-center disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <FaMagic className="animate-pulse" /> Drafting…
          </>
        ) : (
          <>
            <FaMagic /> {hasGenerated ? 'Draft again' : 'Draft replies'}
          </>
        )}
      </button>

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {hasGenerated && !error && suggestions.length === 0 && (
        <p className="mt-4 text-sm text-content-subtle">
          No drafts came back for this message. Try a different tone, or write your own reply below.
        </p>
      )}

      {suggestions.length > 0 && (
        <div className="mt-4 space-y-3">
          {suggestions.map((suggestion) => {
            const isSelected = selectedReply === suggestion.id;
            return (
              <div
                key={suggestion.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => setSelectedReply(suggestion.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedReply(suggestion.id);
                  }
                }}
                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-line hover:border-primary-300'
                }`}
              >
                <p className="mb-2 text-content">{suggestion.text}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs capitalize text-content-muted">{suggestion.tone}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(suggestion.text);
                    }}
                    className="p-1 text-content-subtle hover:text-primary-600"
                    aria-label="Edit this draft"
                  >
                    <FaEdit />
                  </button>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={generateReplies}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 py-2 text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            <FaRedo /> Regenerate
          </button>
        </div>
      )}

      <div className="mt-4">
        <label htmlFor="smart-reply-custom" className="mb-1 block text-sm text-content-muted">
          Or write your own reply
        </label>
        <textarea
          id="smart-reply-custom"
          value={customReply}
          onChange={(e) => {
            setCustomReply(e.target.value);
            setSelectedReply(null);
          }}
          placeholder="Type your reply…"
          rows={3}
          className="input min-h-[7rem] resize-y"
        />
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={selectedReply == null && !customReply.trim()}
        className="btn btn-primary mt-4 w-full justify-center disabled:opacity-50"
      >
        <FaPaperPlane /> Send reply
      </button>
    </div>
  );
};

export default SmartReplies;

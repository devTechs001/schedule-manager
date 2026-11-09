import React, { useEffect, useRef, useState } from 'react';
import {
  FaPlus,
  FaThumbtack,
  FaTrash,
  FaCheck,
  FaTimes,
  FaStickyNote,
} from 'react-icons/fa';
import { useNotes, NOTE_COLORS } from '@hooks/useNotes';

/**
 * Quick notes.
 *
 * A scratchpad for things that are not yet tasks. Deliberately local-first and
 * instant: no save button, no spinner, no network. Everything persists to
 * localStorage and survives a refresh.
 */

const COLOR_STYLES = {
  amber: 'border-amber-300/60 bg-amber-50 dark:border-amber-400/25 dark:bg-amber-400/10',
  emerald: 'border-emerald-300/60 bg-emerald-50 dark:border-emerald-400/25 dark:bg-emerald-400/10',
  sky: 'border-sky-300/60 bg-sky-50 dark:border-sky-400/25 dark:bg-sky-400/10',
  rose: 'border-rose-300/60 bg-rose-50 dark:border-rose-400/25 dark:bg-rose-400/10',
  violet: 'border-violet-300/60 bg-violet-50 dark:border-violet-400/25 dark:bg-violet-400/10',
  slate: 'border-line bg-surface-sunken',
};

const SWATCH = {
  amber: 'bg-amber-400',
  emerald: 'bg-emerald-400',
  sky: 'bg-sky-400',
  rose: 'bg-rose-400',
  violet: 'bg-violet-400',
  slate: 'bg-neutral-400',
};

const NoteCard = ({ note, onUpdate, onRemove, onTogglePin }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note.text);
  const ref = useRef(null);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
      ref.current?.setSelectionRange(draft.length, draft.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  const commit = () => {
    const next = draft.trim();
    if (next && next !== note.text) onUpdate(note.id, { text: next });
    else setDraft(note.text);
    setEditing(false);
  };

  return (
    <li
      className={`group relative flex flex-col rounded-2xl border p-3 transition-shadow hover:shadow-soft ${COLOR_STYLES[note.color] || COLOR_STYLES.amber}`}
    >
      {editing ? (
        <>
          <textarea
            ref={ref}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setDraft(note.text);
                setEditing(false);
              }
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) commit();
            }}
            rows={4}
            className="w-full resize-none rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-content outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
            aria-label="Note text"
          />
          <div className="mt-2 flex gap-1.5">
            <button type="button" onClick={commit} className="btn btn-primary btn-sm">
              <FaCheck size={9} /> Save
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(note.text);
                setEditing(false);
              }}
              className="btn btn-ghost btn-sm"
            >
              <FaTimes size={9} />
            </button>
          </div>
        </>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex-1 whitespace-pre-wrap break-words text-left text-sm leading-relaxed text-content"
          >
            {note.text}
          </button>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex gap-1" role="group" aria-label="Note colour">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onUpdate(note.id, { color })}
                  className={`h-3.5 w-3.5 rounded-full ${SWATCH[color]} ${
                    note.color === color ? 'ring-2 ring-content/40 ring-offset-1 ring-offset-transparent' : 'opacity-50 hover:opacity-100'
                  }`}
                  aria-label={`Colour: ${color}`}
                  aria-pressed={note.color === color}
                />
              ))}
            </div>

            <div className="flex shrink-0 gap-0.5">
              <button
                type="button"
                onClick={() => onTogglePin(note.id)}
                className={`rounded-lg p-1.5 transition-colors ${
                  note.pinned
                    ? 'text-primary-600 dark:text-primary-300'
                    : 'text-content-subtle hover:bg-white/50 dark:hover:bg-white/5'
                }`}
                aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                aria-pressed={note.pinned}
              >
                <FaThumbtack size={9} />
              </button>
              <button
                type="button"
                onClick={() => onRemove(note.id)}
                className="rounded-lg p-1.5 text-content-subtle transition-colors hover:bg-rose-100/60 hover:text-rose-600 dark:hover:bg-rose-500/10"
                aria-label="Delete note"
              >
                <FaTrash size={9} />
              </button>
            </div>
          </div>
        </>
      )}
    </li>
  );
};

const Notes = () => {
  const { notes, addNote, updateNote, removeNote, togglePin, clearAll } = useNotes();
  const [text, setText] = useState('');
  const [color, setColor] = useState('amber');
  const textRef = useRef(null);

  useEffect(() => {
    document.title = 'Notes — SchedAI';
  }, []);

  // Cmd/Ctrl+Enter from the composer, or plain Enter (it's a single line).
  const submit = () => {
    if (!text.trim()) return;
    addNote(text, color);
    setText('');
    textRef.current?.focus();
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Notes</h1>
          <p className="page-subtitle">
            A scratchpad for anything that isn&apos;t a task yet. Saved on this device.
          </p>
        </div>
        {notes.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Delete all notes? This cannot be undone.')) clearAll();
            }}
            className="btn btn-ghost btn-sm self-start text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
          >
            <FaTrash size={9} /> Clear all
          </button>
        )}
      </div>

      {/* Composer */}
      <div className="card p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            ref={textRef}
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Jot something down…"
            maxLength={500}
            className="w-full min-w-0 flex-1 rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-content outline-none placeholder:text-content-subtle focus:border-primary-400 focus:ring-2 focus:ring-primary-500/20"
            aria-label="New note"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!text.trim()}
            className="btn btn-primary shrink-0 justify-center disabled:opacity-50"
          >
            <FaPlus size={10} /> Add note
          </button>
        </div>

        <div className="mt-2.5 flex items-center gap-1.5" role="group" aria-label="Colour for the new note">
          {NOTE_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setColor(option)}
              className={`h-4 w-4 rounded-full ${SWATCH[option]} transition-transform ${
                color === option
                  ? 'ring-2 ring-content/40 ring-offset-1 ring-offset-transparent scale-110'
                  : 'opacity-50 hover:opacity-100'
              }`}
              aria-label={`Colour: ${option}`}
              aria-pressed={color === option}
            />
          ))}
        </div>
      </div>

      {/* Notes */}
      {notes.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 px-4 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
            <FaStickyNote size={16} />
          </span>
          <p className="text-sm font-semibold text-content">No notes yet</p>
          <p className="max-w-xs text-xs text-content-muted">
            Type above and press Enter. Notes stay on this device and are here when you come back.
          </p>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={updateNote}
              onRemove={removeNote}
              onTogglePin={togglePin}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notes;

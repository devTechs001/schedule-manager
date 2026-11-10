import React, { useEffect, useRef, useState } from 'react';
import { FaStickyNote, FaPlus, FaTrash, FaEdit, FaPalette, FaCheck, FaTimes, FaThumbtack } from 'react-icons/fa';
import { useNotes, NOTE_COLORS } from '@hooks/useNotes';

/**
 * Scratchpad widget.
 *
 * Rewritten on top of useNotes so it shares one store with the Notes page:
 * a note jotted here shows up there, pinned state included. The previous
 * version kept a private array seeded from a prop and used a different field
 * name (`content`, colours 'yellow'/'green') than the shared store (`text`,
 * 'amber'/'emerald'), so the two screens could never agree.
 */
const TONE = {
  amber: 'bg-amber-50 border-amber-200 dark:bg-amber-400/10 dark:border-amber-500/30',
  emerald: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-400/10 dark:border-emerald-500/30',
  sky: 'bg-sky-50 border-sky-200 dark:bg-sky-400/10 dark:border-sky-500/30',
  rose: 'bg-rose-50 border-rose-200 dark:bg-rose-400/10 dark:border-rose-500/30',
  violet: 'bg-violet-50 border-violet-200 dark:bg-violet-400/10 dark:border-violet-500/30',
  slate: 'bg-surface-sunken border-line',
};

const QuickNote = ({ limit = 4, compact = false }) => {
  const { notes, ready, addNote, updateNote, removeNote, togglePin } = useNotes();
  const [draft, setDraft] = useState('');
  const [colour, setColour] = useState('amber');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showColourPicker, setShowColourPicker] = useState(false);
  const inputRef = useRef(null);

  // Give the field focus when the widget mounts empty, so a fresh dashboard
  // does not need a click before the first note.
  useEffect(() => {
    if (ready && notes.length === 0) inputRef.current?.focus();
  }, [ready, notes.length]);

  const handleAdd = () => {
    const created = addNote(draft, colour);
    if (!created) return;
    setDraft('');
    setColour('amber');
  };

  const commitEdit = (id) => {
    const text = editingText.trim();
    if (text) updateNote(id, { text });
    setEditingId(null);
    setEditingText('');
  };

  const visible = notes.slice(0, limit);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FaStickyNote className="text-amber-500" />
          <h3 className="text-sm font-semibold text-content">Quick note</h3>
        </div>
        {notes.length > limit && (
          <span className="text-[0.65rem] text-content-subtle">+{notes.length - limit} more in Notes</span>
        )}
      </div>

      <div className="flex gap-1.5">
        <input
          ref={inputRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder={compact ? 'Jot something down…' : 'Write a note and press Enter…'}
          className="input flex-1 text-xs"
          aria-label="New note"
        />
        <button
          type="button"
          onClick={() => setShowColourPicker((open) => !open)}
          className="rounded-lg px-2 text-content-subtle hover:bg-surface-sunken hover:text-content"
          aria-label="Choose note colour"
          aria-expanded={showColourPicker}
        >
          <FaPalette size={11} />
        </button>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!draft.trim()}
          className="btn btn-primary btn-sm disabled:opacity-50"
          aria-label="Add note"
        >
          <FaPlus size={9} />
        </button>
      </div>

      {showColourPicker && (
        <div className="mt-2 flex gap-1.5" role="group" aria-label="Note colour">
          {NOTE_COLORS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setColour(option);
                setShowColourPicker(false);
              }}
              className={`h-5 w-5 rounded-full border ${TONE[option]} ${
                colour === option ? 'ring-2 ring-primary-500 ring-offset-1' : ''
              }`}
              aria-label={option}
              aria-pressed={colour === option}
            />
          ))}
        </div>
      )}

      <div className="mt-3 space-y-1.5">
        {!ready ? (
          <p className="py-3 text-center text-[0.7rem] text-content-subtle">Loading notes…</p>
        ) : visible.length === 0 ? (
          <p className="py-3 text-center text-[0.7rem] text-content-subtle">
            No notes yet — the first one goes here.
          </p>
        ) : (
          visible.map((note) => (
            <div
              key={note.id}
              className={`group rounded-lg border px-2.5 py-2 ${TONE[note.color] || TONE.slate}`}
            >
              {editingId === note.id ? (
                <div className="flex gap-1">
                  <input
                    value={editingText}
                    onChange={(event) => setEditingText(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') commitEdit(note.id);
                      if (event.key === 'Escape') setEditingId(null);
                    }}
                    className="input flex-1 py-1 text-xs"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => commitEdit(note.id)}
                    className="p-1 text-emerald-600"
                    aria-label="Save note"
                  >
                    <FaCheck size={10} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="p-1 text-content-subtle"
                    aria-label="Cancel edit"
                  >
                    <FaTimes size={10} />
                  </button>
                </div>
              ) : (
                <div className="flex items-start gap-2">
                  <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-xs leading-relaxed text-content">
                    {note.text}
                  </p>
                  <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => togglePin(note.id)}
                      className={`p-0.5 ${note.pinned ? 'text-primary-600' : 'text-content-subtle hover:text-content'}`}
                      aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
                      aria-pressed={note.pinned}
                    >
                      <FaThumbtack size={9} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(note.id);
                        setEditingText(note.text);
                      }}
                      className="p-0.5 text-content-subtle hover:text-content"
                      aria-label="Edit note"
                    >
                      <FaEdit size={9} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeNote(note.id)}
                      className="p-0.5 text-content-subtle hover:text-rose-500"
                      aria-label="Delete note"
                    >
                      <FaTrash size={9} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuickNote;

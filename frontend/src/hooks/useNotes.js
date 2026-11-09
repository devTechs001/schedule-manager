import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useNotes — small persistent scratchpad.
 *
 * Notes are the lightest-weight thing in the app, so they live in localStorage
 * rather than round-tripping to the API. Writes are synchronous and survive a
 * refresh; there is no backend dependency and therefore no "empty because the
 * server is down" mode.
 *
 * Shape: { id, text, color, pinned, createdAt, updatedAt }
 */

const STORAGE_KEY = 'schedai:notes';
export const NOTE_COLORS = ['amber', 'emerald', 'sky', 'rose', 'violet', 'slate'];

const makeId = () =>
  `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const read = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Defensive: one bad record must not blank the whole scratchpad.
    return parsed
      .filter((note) => note && typeof note === 'object' && typeof note.text === 'string')
      .map((note) => ({
        id: note.id || makeId(),
        text: note.text,
        color: NOTE_COLORS.includes(note.color) ? note.color : 'amber',
        pinned: Boolean(note.pinned),
        createdAt: note.createdAt || new Date().toISOString(),
        updatedAt: note.updatedAt || note.createdAt || new Date().toISOString(),
      }));
  } catch {
    return [];
  }
};

const write = (notes) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    /* storage full or blocked — the in-memory copy still works this session */
  }
  return notes;
};

/** Pinned first, then newest. */
const sortNotes = (notes) =>
  [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

export const useNotes = () => {
  const [notes, setNotes] = useState(read);
  const [ready, setReady] = useState(false);
  const firstRun = useRef(true);

  useEffect(() => {
    // Skip the initial write: it would rewrite what we just read.
    if (firstRun.current) {
      firstRun.current = false;
      setReady(true);
      return;
    }
    write(notes);
  }, [notes]);

  // Keep two tabs in sync.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY) return;
      setNotes(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addNote = useCallback((text, color = 'amber') => {
    const trimmed = String(text || '').trim();
    if (!trimmed) return null;
    const note = {
      id: makeId(),
      text: trimmed,
      color: NOTE_COLORS.includes(color) ? color : 'amber',
      pinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((current) => sortNotes([note, ...current]));
    return note;
  }, []);

  const updateNote = useCallback((id, patch) => {
    setNotes((current) =>
      sortNotes(
        current.map((note) =>
          note.id === id ? { ...note, ...patch, updatedAt: new Date().toISOString() } : note
        )
      )
    );
  }, []);

  const removeNote = useCallback((id) => {
    setNotes((current) => current.filter((note) => note.id !== id));
  }, []);

  const togglePin = useCallback((id) => {
    setNotes((current) =>
      sortNotes(current.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)))
    );
  }, []);

  const clearAll = useCallback(() => setNotes([]), []);

  return { notes, ready, addNote, updateNote, removeNote, togglePin, clearAll };
};

export default useNotes;

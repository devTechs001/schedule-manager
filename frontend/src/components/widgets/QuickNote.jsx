import React, { useState, useRef, useEffect } from 'react';
import { FaStickyNote, FaPlus, FaTrash, FaEdit, FaPalette, FaCheck, FaTimes, FaThumbtack } from 'react-icons/fa';

const QuickNote = ({ 
  notes: initialNotes = [], 
  onSave, 
  onDelete,
  compact = false,
}) => {
  const [notes, setNotes] = useState(initialNotes.length > 0 ? initialNotes : [
    { id: 1, content: 'Remember to call John about the project', color: 'yellow', pinned: true, createdAt: new Date() },
    { id: 2, content: 'Buy groceries on the way home', color: 'green', pinned: false, createdAt: new Date() },
    { id: 3, content: 'Review meeting notes from yesterday', color: 'blue', pinned: false, createdAt: new Date() },
  ]);
  const [editingId, setEditingId] = useState(null);
  const [newNote, setNewNote] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(null);
  const inputRef = useRef(null);

  const colors = ['yellow', 'green', 'blue', 'pink', 'purple', 'orange'];

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note = {
      id: Date.now(),
      content: newNote,
      color: 'yellow',
      pinned: false,
      createdAt: new Date(),
    };
    setNotes([note, ...notes]);
    setNewNote('');
    onSave?.(note);
  };

  const handleDelete = (id) => {
    setNotes(notes.filter(n => n.id !== id));
    onDelete?.(id);
  };

  const handleEdit = (id, content) => {
    setNotes(notes.map(n => n.id === id ? { ...n, content } : n));
    setEditingId(null);
  };

  const handleColorChange = (id, color) => {
    setNotes(notes.map(n => n.id === id ? { ...n, color } : n));
    setShowColorPicker(null);
  };

  const togglePin = (id) => {
    setNotes(notes.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
  };

  const sortedNotes = [...notes].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const colorClasses = {
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300',
    green: 'bg-green-100 dark:bg-green-900/30 border-green-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300',
    pink: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300',
    purple: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300',
    orange: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300',
  };

  if (compact) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <FaStickyNote className="text-yellow-500" />
          <span className="font-medium text-gray-900 dark:text-white">Quick Notes</span>
          <span className="text-xs text-gray-500">({notes.length})</span>
        </div>
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          placeholder="Add a quick note..."
          className="w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:border-gray-600"
        />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaStickyNote className="text-yellow-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Notes</h3>
        </div>
        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-400">
          {notes.length} notes
        </span>
      </div>

      {/* Add Note */}
      <div className="flex gap-2 mb-4">
        <input
          ref={inputRef}
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
          placeholder="Write a quick note..."
          className="flex-1 px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-primary-500"
        />
        <button
          onClick={handleAddNote}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
        >
          <FaPlus />
        </button>
      </div>

      {/* Notes List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {sortedNotes.map((note) => (
          <div
            key={note.id}
            className={`relative p-3 rounded-lg border-l-4 ${colorClasses[note.color]} group`}
          >
            {editingId === note.id ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  defaultValue={note.content}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEdit(note.id, e.target.value);
                    if (e.key === 'Escape') setEditingId(null);
                  }}
                  autoFocus
                  className="flex-1 px-2 py-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                />
                <button
                  onClick={(e) => handleEdit(note.id, e.target.previousSibling.value)}
                  className="text-green-500 hover:text-green-600"
                >
                  <FaCheck />
                </button>
                <button onClick={() => setEditingId(null)} className="text-gray-500">
                  <FaTimes />
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <p className="text-sm text-gray-800 dark:text-gray-200 pr-16">{note.content}</p>
                  {note.pinned && <FaThumbtack className="text-gray-400 text-xs" />}
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button onClick={() => togglePin(note.id)} className={`p-1 rounded ${note.pinned ? 'text-primary-500' : 'text-gray-400'} hover:bg-white/50`}>
                    <FaThumbtack className="text-xs" />
                  </button>
                  <button onClick={() => setShowColorPicker(note.id)} className="p-1 text-gray-400 hover:bg-white/50 rounded">
                    <FaPalette className="text-xs" />
                  </button>
                  <button onClick={() => setEditingId(note.id)} className="p-1 text-gray-400 hover:bg-white/50 rounded">
                    <FaEdit className="text-xs" />
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="p-1 text-red-400 hover:bg-white/50 rounded">
                    <FaTrash className="text-xs" />
                  </button>
                </div>
                {showColorPicker === note.id && (
                  <div className="absolute top-8 right-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(note.id, color)}
                        className={`w-6 h-6 rounded-full bg-${color}-400 hover:scale-110 transition-transform`}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickNote;


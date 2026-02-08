import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaUsers, FaSave, FaUndo, FaRedo } from 'react-icons/fa';

const RealTimeEditor = ({ documentId, initialContent = '', collaborators = [], onSave }) => {
  const [content, setContent] = useState(initialContent);
  const [history, setHistory] = useState([initialContent]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [activeUsers, setActiveUsers] = useState(collaborators);

  useEffect(() => {
    // Simulate real-time presence
    const interval = setInterval(() => {
      setActiveUsers(collaborators.map(c => ({
        ...c,
        cursor: Math.floor(Math.random() * content.length),
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, [collaborators, content]);

  const handleChange = useCallback((e) => {
    const newContent = e.target.value;
    setContent(newContent);
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newContent);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setContent(history[historyIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setContent(history[historyIndex + 1]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave?.(content);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FaEdit className="text-primary-600" />
          <span className="font-medium text-gray-900 dark:text-white">Collaborative Editor</span>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Active Collaborators */}
          <div className="flex items-center gap-1">
            <FaUsers className="text-gray-400" />
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 4).map((user, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-primary-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white text-xs"
                  title={user.name}
                >
                  {user.name?.[0] || 'U'}
                </div>
              ))}
              {activeUsers.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs">
                  +{activeUsers.length - 4}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Undo"
            >
              <FaUndo />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Redo"
            >
              <FaRedo />
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
          >
            <FaSave /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <textarea
          value={content}
          onChange={handleChange}
          placeholder="Start typing..."
          className="w-full h-96 p-4 bg-transparent text-gray-900 dark:text-white resize-none focus:outline-none font-mono"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
        <span>{content.length} characters</span>
        {lastSaved && (
          <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
};

export default RealTimeEditor;


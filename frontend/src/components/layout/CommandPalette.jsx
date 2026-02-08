import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTasks, FaCalendarAlt, FaUser, FaCog, FaKeyboard, FaPlus, FaEnvelope, FaMoon, FaSun } from 'react-icons/fa';

const CommandPalette = ({ isOpen, onClose, onCommand }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  const commands = [
    { id: 'new-task', label: 'Create new task', icon: FaPlus, shortcut: 'Ctrl+N', category: 'Tasks' },
    { id: 'search-tasks', label: 'Search tasks', icon: FaTasks, shortcut: 'Ctrl+F', category: 'Tasks' },
    { id: 'new-event', label: 'Create new event', icon: FaCalendarAlt, shortcut: 'Ctrl+E', category: 'Calendar' },
    { id: 'view-calendar', label: 'Open calendar', icon: FaCalendarAlt, shortcut: 'Ctrl+K', category: 'Calendar' },
    { id: 'compose-email', label: 'Compose email', icon: FaEnvelope, shortcut: 'Ctrl+M', category: 'Email' },
    { id: 'view-contacts', label: 'View contacts', icon: FaUser, shortcut: 'Ctrl+U', category: 'Contacts' },
    { id: 'toggle-theme', label: 'Toggle dark mode', icon: FaMoon, shortcut: 'Ctrl+D', category: 'Settings' },
    { id: 'open-settings', label: 'Open settings', icon: FaCog, shortcut: 'Ctrl+,', category: 'Settings' },
    { id: 'keyboard-shortcuts', label: 'Keyboard shortcuts', icon: FaKeyboard, shortcut: '?', category: 'Help' },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  const groupedCommands = filteredCommands.reduce((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = [];
    acc[cmd.category].push(cmd);
    return acc;
  }, {});

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        onCommand?.(filteredCommands[selectedIndex]);
        onClose();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onCommand, onClose]);

  if (!isOpen) return null;

  let flatIndex = 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <FaSearch className="text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
            className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded">ESC</kbd>
        </div>

        {/* Commands List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {Object.keys(groupedCommands).length === 0 ? (
            <p className="text-center text-gray-500 py-8">No commands found</p>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="mb-2">
                <p className="text-xs font-medium text-gray-500 px-3 py-1">{category}</p>
                {cmds.map((cmd) => {
                  const currentIndex = flatIndex++;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => { onCommand?.(cmd); onClose(); }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                        currentIndex === selectedIndex
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <cmd.icon className={currentIndex === selectedIndex ? 'text-primary-600' : 'text-gray-400'} />
                        <span className="text-sm text-gray-900 dark:text-white">{cmd.label}</span>
                      </div>
                      <kbd className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 text-xs rounded">
                        {cmd.shortcut}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span><kbd>↑↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
          </div>
          <span>Press <kbd>Ctrl+K</kbd> to open</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;


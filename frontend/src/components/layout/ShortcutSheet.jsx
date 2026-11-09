import React from 'react';
import Modal from '@components/ui/Modal';

const GROUPS = [
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['⌘', 'K'], label: 'Open search / command palette' },
      { keys: ['/'], label: 'Focus search' },
      { keys: ['G', 'D'], label: 'Go to dashboard' },
      { keys: ['G', 'T'], label: 'Go to tasks' },
      { keys: ['G', 'P'], label: 'Go to planner' },
      { keys: ['G', 'C'], label: 'Go to schedule' },
      { keys: ['G', 'I'], label: 'Go to inbox' },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { keys: ['N'], label: 'New task (on tasks page)' },
      { keys: ['F'], label: 'Start / pause focus timer' },
      { keys: ['T'], label: 'Toggle theme' },
      { keys: ['?'], label: 'Show this cheat sheet' },
      { keys: ['Esc'], label: 'Close dialogs' },
    ],
  },
];

const ShortcutSheet = ({ isOpen, onClose }) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Keyboard shortcuts" subtitle="Move faster without the mouse." size="lg">
    <div className="grid gap-6 sm:grid-cols-2">
      {GROUPS.map((group) => (
        <div key={group.title}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-content-subtle">
            {group.title}
          </p>
          <ul className="space-y-1.5">
            {group.shortcuts.map((shortcut) => (
              <li
                key={shortcut.label}
                className="flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 hover:bg-surface-sunken"
              >
                <span className="text-xs text-content-muted">{shortcut.label}</span>
                <span className="flex shrink-0 items-center gap-1">
                  {shortcut.keys.map((key) => (
                    <kbd key={key} className="kbd">
                      {key}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

    <p className="mt-5 rounded-xl bg-surface-sunken px-3 py-2.5 text-[0.7rem] text-content-muted">
      Tip: shortcut sequences (like <span className="kbd">G</span> then <span className="kbd">T</span>) work
      when you are not typing in a field.
    </p>
  </Modal>
);

export default ShortcutSheet;

import React from 'react';
import { FaInbox, FaStar, FaPaperPlane, FaTrash } from 'react-icons/fa';

const EmailFilters = ({ activeFilter = 'inbox', onFilterChange, counts = {} }) => {
  const filters = [
    { id: 'inbox', label: 'Inbox', icon: FaInbox, count: counts.inbox },
    { id: 'starred', label: 'Starred', icon: FaStar, count: counts.starred },
    { id: 'sent', label: 'Sent', icon: FaPaperPlane, count: counts.sent },
    { id: 'trash', label: 'Trash', icon: FaTrash, count: counts.trash },
  ];

  return (
    <div className="card p-2">
      <div className="flex gap-1 overflow-x-auto scrollbar-none lg:flex-col">
        {filters.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => onFilterChange?.(filter.id)}
            className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors lg:w-full ${
              activeFilter === filter.id
                ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                : 'text-content-muted hover:bg-gray-100 dark:hover:bg-white/5'
            }`}
          >
            <span className="flex items-center gap-2.5">
              <filter.icon size={12} />
              {filter.label}
            </span>
            {typeof filter.count === 'number' && filter.count > 0 && (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[0.62rem] font-bold ${
                  activeFilter === filter.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-content-muted dark:bg-white/10'
                }`}
              >
                {filter.count}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmailFilters;

import React from 'react';
import { FaInbox, FaStar, FaPaperPlane, FaTrash } from 'react-icons/fa';

const EmailFilters = ({ activeFilter, onFilterChange, counts }) => {
  const filters = [
    { id: 'inbox', label: 'Inbox', icon: FaInbox, count: counts.inbox },
    { id: 'starred', label: 'Starred', icon: FaStar, count: counts.starred },
    { id: 'sent', label: 'Sent', icon: FaPaperPlane, count: counts.sent },
    { id: 'trash', label: 'Trash', icon: FaTrash, count: counts.trash },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="space-y-1">
        {filters.map((filter) => (
          <button
            key={filter.id}
            onClick={() => onFilterChange(filter.id)}
            className={`
              w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors
              ${activeFilter === filter.id
                ? 'bg-primary-600 text-white'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }
            `}
          >
            <div className="flex items-center space-x-3">
              <filter.icon size={18} />
              <span className="font-medium">{filter.label}</span>
            </div>
            {filter.count > 0 && (
              <span className={`
                px-2 py-1 text-xs font-semibold rounded-full
                ${activeFilter === filter.id
                  ? 'bg-white text-primary-600'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }
              `}>
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
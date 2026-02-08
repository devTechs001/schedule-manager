import React, { useState } from 'react';
import { FaInbox, FaEnvelope, FaSlack, FaComment, FaStar, FaArchive, FaTrash, FaFilter } from 'react-icons/fa';

const UnifiedInbox = ({ messages = [], onSelect, onArchive, onDelete }) => {
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [filter, setFilter] = useState('all');

  const sources = [
    { id: 'all', label: 'All', icon: FaInbox },
    { id: 'email', label: 'Email', icon: FaEnvelope },
    { id: 'slack', label: 'Slack', icon: FaSlack },
    { id: 'chat', label: 'Chat', icon: FaComment },
  ];

  const filteredMessages = messages.filter(m =>
    filter === 'all' || m.source === filter
  );

  const toggleSelect = (id) => {
    setSelectedMessages(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const getSourceIcon = (source) => {
    const s = sources.find(src => src.id === source);
    return s ? <s.icon /> : <FaEnvelope />;
  };

  const getSourceColor = (source) => {
    switch (source) {
      case 'email': return 'blue';
      case 'slack': return 'purple';
      case 'chat': return 'green';
      default: return 'gray';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FaInbox className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Unified Inbox</h3>
          <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm">
            {filteredMessages.length}
          </span>
        </div>
        {selectedMessages.length > 0 && (
          <div className="flex gap-2">
            <button onClick={() => onArchive?.(selectedMessages)} className="p-2 text-gray-500 hover:text-primary-600">
              <FaArchive />
            </button>
            <button onClick={() => onDelete?.(selectedMessages)} className="p-2 text-gray-500 hover:text-red-600">
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      {/* Source Filters */}
      <div className="flex gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
        {sources.map((source) => (
          <button
            key={source.id}
            onClick={() => setFilter(source.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
              filter === source.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
          >
            <source.icon /> {source.label}
          </button>
        ))}
      </div>

      {/* Messages List */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            No messages in your inbox
          </p>
        ) : (
          filteredMessages.map((message) => (
            <div
              key={message.id}
              onClick={() => onSelect?.(message)}
              className={`flex items-start gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${
                !message.read ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedMessages.includes(message.id)}
                onChange={(e) => { e.stopPropagation(); toggleSelect(message.id); }}
                className="mt-1"
              />
              <div className={`p-2 rounded-lg bg-${getSourceColor(message.source)}-100 dark:bg-${getSourceColor(message.source)}-900/30 text-${getSourceColor(message.source)}-600`}>
                {getSourceIcon(message.source)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-medium ${!message.read ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {message.sender}
                  </span>
                  <span className="text-xs text-gray-500">{message.time}</span>
                </div>
                <h4 className={`text-sm ${!message.read ? 'font-semibold' : ''} text-gray-900 dark:text-white truncate`}>
                  {message.subject}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{message.preview}</p>
              </div>
              <button className="p-1 text-gray-400 hover:text-yellow-500">
                <FaStar className={message.starred ? 'text-yellow-500' : ''} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UnifiedInbox;


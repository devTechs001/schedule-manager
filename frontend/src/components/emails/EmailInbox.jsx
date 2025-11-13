import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaInbox, FaStar, FaPaperclip, FaSearch } from 'react-icons/fa';
import Badge from '@components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';

const EmailInbox = ({ emails, onSelectEmail, selectedEmail }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.from.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto">
        {filteredEmails.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <FaInbox size={48} />
            <p className="mt-4">No emails found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEmails.map((email) => (
              <motion.div
                key={email._id}
                whileHover={{ backgroundColor: 'rgba(99, 102, 241, 0.05)' }}
                onClick={() => onSelectEmail(email)}
                className={`
                  p-4 cursor-pointer transition-colors
                  ${selectedEmail?._id === email._id ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                  ${!email.read ? 'font-semibold' : ''}
                `}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        {email.from}
                      </p>
                      {email.starred && <FaStar className="text-yellow-400" size={12} />}
                      {email.hasAttachment && <FaPaperclip className="text-gray-400" size={12} />}
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white truncate mb-1">
                      {email.subject}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {email.preview}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end space-y-2">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(email.date), { addSuffix: true })}
                    </p>
                    {!email.read && (
                      <Badge variant="primary" size="xs">New</Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailInbox;
import React from 'react';
import { FaStar, FaReply, FaTrash, FaPaperclip } from 'react-icons/fa';
import Button from '@components/ui/Button';
import { format } from 'date-fns';

const EmailThread = ({ email, onReply, onDelete, onToggleStar }) => {
  if (!email) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex items-center justify-center">
        <p className="text-gray-400">Select an email to view</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {email.subject}
            </h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span>From: {email.from}</span>
              <span>•</span>
              <span>{format(new Date(email.date), 'PPpp')}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleStar(email._id)}
            >
              <FaStar className={email.starred ? 'text-yellow-400' : 'text-gray-400'} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              icon={<FaReply />}
              onClick={() => onReply(email)}
            >
              Reply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(email._id)}
            >
              <FaTrash className="text-red-500" />
            </Button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="prose dark:prose-invert max-w-none">
          {email.body}
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <FaPaperclip className="mr-2" />
              Attachments ({email.attachments.length})
            </h4>
            <div className="space-y-2">
              {email.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {attachment.name}
                  </span>
                  <Button variant="ghost" size="sm">
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailThread;
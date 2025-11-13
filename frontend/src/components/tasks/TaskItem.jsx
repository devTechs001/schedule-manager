import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaCheck, FaClock, FaFlag } from 'react-icons/fa';
import Badge from '@components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';

const TaskItem = ({ task, onEdit, onDelete, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColors = {
    low: 'success',
    medium: 'warning',
    high: 'danger',
  };

  const statusColors = {
    todo: 'secondary',
    'in-progress': 'info',
    completed: 'success',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {/* Checkbox */}
          <button
            onClick={() => onToggle(task._id)}
            className={`
              mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all
              ${task.status === 'completed'
                ? 'bg-green-500 border-green-500'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary-500'
              }
            `}
          >
            {task.status === 'completed' && <FaCheck className="text-white" size={12} />}
          </button>

          {/* Task Content */}
          <div className="flex-1 min-w-0">
            <h4
              className={`
                font-medium cursor-pointer
                ${task.status === 'completed'
                  ? 'line-through text-gray-400 dark:text-gray-500'
                  : 'text-gray-900 dark:text-white'
                }
              `}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {task.title}
            </h4>

            {isExpanded && task.description && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2 mt-2">
              <Badge variant={priorityColors[task.priority]} size="sm" icon={<FaFlag size={10} />}>
                {task.priority}
              </Badge>
              <Badge variant={statusColors[task.status]} size="sm">
                {task.status}
              </Badge>
              {task.dueDate && (
                <Badge variant="secondary" size="sm" icon={<FaClock size={10} />}>
                  {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 ml-2">
          <button
            onClick={() => onEdit(task)}
            className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskItem;
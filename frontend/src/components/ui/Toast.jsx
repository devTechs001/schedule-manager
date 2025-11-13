import React from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ type = 'info', message, onClose }) => {
  const types = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-200',
      icon: <FaCheckCircle className="text-green-500" size={20} />,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: <FaExclamationCircle className="text-red-500" size={20} />,
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-800 dark:text-yellow-200',
      icon: <FaExclamationCircle className="text-yellow-500" size={20} />,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <FaInfoCircle className="text-blue-500" size={20} />,
    },
  };

  const config = types[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`
        flex items-center p-4 mb-4 border rounded-lg
        ${config.bg} ${config.border}
      `}
    >
      <div className="flex-shrink-0">{config.icon}</div>
      <div className={`ml-3 text-sm font-medium ${config.text}`}>{message}</div>
      <button
        onClick={onClose}
        className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 ${config.text} hover:bg-white/50 dark:hover:bg-gray-800/50`}
      >
        <FaTimes size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
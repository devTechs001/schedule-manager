import React from 'react';
import { FaSearch, FaFilter } from 'react-icons/fa';
import Input from '@components/ui/Input';

const TaskFilters = ({ filters, onFilterChange }) => {
  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <Input
          placeholder="Search tasks..."
          icon={<FaSearch />}
          value={filters.search}
          onChange={(e) => handleChange('search', e.target.value)}
        />

        {/* Status Filter */}
        <div>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <select
            value={filters.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
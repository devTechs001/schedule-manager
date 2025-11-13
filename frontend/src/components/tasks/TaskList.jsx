import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskItem from './TaskItem';
import TaskFilters from './TaskFilters';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import { FaPlus } from 'react-icons/fa';
import Button from '@components/ui/Button';

const TaskList = ({ tasks, loading, onEdit, onDelete, onToggle, onAdd }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: '',
  });

  const filteredTasks = tasks.filter((task) => {
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesSearch = task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
                         task.description?.toLowerCase().includes(filters.search.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const groupedTasks = {
    todo: filteredTasks.filter(t => t.status === 'todo'),
    'in-progress': filteredTasks.filter(t => t.status === 'in-progress'),
    completed: filteredTasks.filter(t => t.status === 'completed'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading tasks..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <Button
          variant="primary"
          icon={<FaPlus />}
          onClick={onAdd}
        >
          Add Task
        </Button>
      </div>

      {/* Filters */}
      <TaskFilters filters={filters} onFilterChange={setFilters} />

      {/* Task Groups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(groupedTasks).map(([status, taskList]) => (
          <div key={status} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {status.replace('-', ' ')}
              </h3>
              <span className="px-2.5 py-1 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-medium">
                {taskList.length}
              </span>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {taskList.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600"
                  >
                    <p className="text-gray-500 dark:text-gray-400">No tasks</p>
                  </motion.div>
                ) : (
                  taskList.map((task) => (
                    <TaskItem
                      key={task._id}
                      task={task}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onToggle={onToggle}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
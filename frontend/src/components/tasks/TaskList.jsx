import React from 'react';
import { FaTasks, FaPlus } from 'react-icons/fa';
import TaskItem from './TaskItem';
import EmptyState from '@components/ui/EmptyState';
import LoadingSpinner from '@components/ui/LoadingSpinner';

const TaskList = ({ tasks = [], loading = false, onEdit, onDelete, onToggle, onAdd, emptyAction }) => {
  const list = Array.isArray(tasks) ? tasks : [];

  if (loading && list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16">
        <LoadingSpinner size="md" />
        <p className="text-sm text-content-muted">Loading your tasks…</p>
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <EmptyState
        icon={<FaTasks />}
        title="No tasks yet"
        description="Capture the first thing on your mind — the AI will help you prioritise it."
        action={
          onAdd && (
            <button type="button" onClick={onAdd} className="btn btn-primary btn-sm mt-1">
              <FaPlus size={10} /> Add your first task
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="space-y-2">
      {list.map((task) => (
        <TaskItem
          key={task._id || task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
      {emptyAction}
    </div>
  );
};

export default TaskList;

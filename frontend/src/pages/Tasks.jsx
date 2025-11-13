import React, { useState } from 'react';
import { useTasks } from '@hooks/useTasks';
import TaskList from '@components/tasks/TaskList';
import TaskForm from '@components/tasks/TaskForm';
import Modal from '@components/ui/Modal';
import { FaCalendar, FaList } from 'react-icons/fa';
import TaskCalendar from '@components/tasks/TaskCalendar';

const Tasks = () => {
  const { tasks, loading, createTask, updateTask, deleteTask, toggleTask } = useTasks();
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'

  const handleAddTask = () => {
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleSubmit = async (taskData) => {
    try {
      if (selectedTask) {
        await updateTask(selectedTask._id, taskData);
      } else {
        await createTask(taskData);
      }
      setShowModal(false);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to save task:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your tasks and to-dos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <FaList size={20} />
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-lg ${
              viewMode === 'calendar'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <FaCalendar size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'list' ? (
        <TaskList
          tasks={tasks}
          loading={loading}
          onAdd={handleAddTask}
          onEdit={handleEditTask}
          onDelete={handleDelete}
          onToggle={toggleTask}
        />
      ) : (
        <TaskCalendar
          tasks={tasks}
          onSelectTask={handleEditTask}
          onSelectSlot={handleAddTask}
        />
      )}

      {/* Task Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTask(null);
        }}
        title={selectedTask ? 'Edit Task' : 'Create New Task'}
        size="lg"
      >
        <TaskForm
          task={selectedTask}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedTask(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Tasks;
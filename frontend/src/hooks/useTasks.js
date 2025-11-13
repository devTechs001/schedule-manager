import { useState, useEffect, useCallback } from 'react';
import tasksAPI from '@services/api/tasksAPI';
import { useOffline } from './useOffline';
import toast from 'react-hot-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOnline, queueAction } = useOffline();

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tasksAPI.getAll();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (taskData) => {
    try {
      if (!isOnline) {
        queueAction('createTask', taskData);
        toast.success('Task queued for creation when online');
        return;
      }
      const newTask = await tasksAPI.create(taskData);
      setTasks(prev => [...prev, newTask]);
      toast.success('Task created successfully');
      return newTask;
    } catch (err) {
      toast.error('Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id, updates) => {
    try {
      if (!isOnline) {
        queueAction('updateTask', { id, updates });
        toast.success('Task update queued');
        return;
      }
      const updatedTask = await tasksAPI.update(id, updates);
      setTasks(prev => prev.map(task => task._id === id ? updatedTask : task));
      toast.success('Task updated successfully');
      return updatedTask;
    } catch (err) {
      toast.error('Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (id) => {
    try {
      if (!isOnline) {
        queueAction('deleteTask', id);
        toast.success('Task deletion queued');
        return;
      }
      await tasksAPI.delete(id);
      setTasks(prev => prev.filter(task => task._id !== id));
      toast.success('Task deleted successfully');
    } catch (err) {
      toast.error('Failed to delete task');
      throw err;
    }
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t._id === id);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    await updateTask(id, { status: newStatus });
  };

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    refreshTasks: fetchTasks,
  };
};
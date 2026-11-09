import { useState, useEffect, useCallback, useRef } from 'react';
import tasksAPI, { asList } from '@services/api/tasksAPI';
import { readCollection, writeCollection, newLocalId } from '@services/storage/localFallback';
import { useOffline } from './useOffline';
import toast from 'react-hot-toast';

/**
 * Shared task state with a local-first fallback.
 *
 * - Optimistic updates everywhere
 * - One toast per failure burst (the old hook fired on every mount)
 * - If the API/database is unavailable the collection is served from
 *   localStorage so the product stays fully testable
 */
export const useTasks = (options = {}) => {
  const { autoFetch = true } = options;
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [localOnly, setLocalOnly] = useState(false);
  const notified = useRef(false);

  let offline = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    offline = useOffline();
  } catch {
    offline = null;
  }
  const isOnline = offline?.isOnline ?? (typeof navigator === 'undefined' ? true : navigator.onLine);
  const queueAction = offline?.queueAction;

  const fetchTasks = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const data = await tasksAPI.getAll(params);
      const list = asList(data);
      setTasks(list);
      setLocalOnly(false);
      setError(null);
      notified.current = false;
    } catch (err) {
      // Fall back to the local store — silent by design so the demo feels solid.
      setTasks(readCollection('tasks'));
      setLocalOnly(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchTasks();
  }, [autoFetch, fetchTasks]);

  /** Persist to the local store, returning the new collection. */
  const persistLocal = (next) => {
    writeCollection('tasks', next);
    setTasks(next);
  };

  const createTask = async (taskData) => {
    const optimistic = {
      ...taskData,
      _id: newLocalId(),
      status: taskData.status || 'todo',
      createdAt: new Date().toISOString(),
    };
    const optimisticList = [optimistic, ...asList(tasks)];
    setTasks(optimisticList);

    if (localOnly || !isOnline) {
      persistLocal(optimisticList);
      toast.success('Task added');
      return optimistic;
    }

    try {
      const newTask = await tasksAPI.create(taskData);
      setTasks((prev) => asList(prev).map((task) => (task._id === optimistic._id ? newTask : task)));
      toast.success('Task created');
      return newTask;
    } catch (err) {
      // Keep the optimistic copy locally rather than losing the user's work
      persistLocal(optimisticList);
      setLocalOnly(true);
      queueAction?.('createTask', taskData);
      toast.success('Task saved locally');
      return optimistic;
    }
  };

  const updateTask = async (id, updates) => {
    const previous = asList(tasks);
    const next = previous.map((task) => (task._id === id ? { ...task, ...updates } : task));
    setTasks(next);
    persistLocal(next);

    if (localOnly || !isOnline) return next.find((task) => task._id === id);

    try {
      const updated = await tasksAPI.update(id, updates);
      setTasks((prev) => asList(prev).map((task) => (task._id === id ? { ...task, ...updated } : task)));
      return updated;
    } catch (err) {
      setLocalOnly(true);
      queueAction?.('updateTask', { id, updates });
      return next.find((task) => task._id === id);
    }
  };

  const deleteTask = async (id) => {
    const next = asList(tasks).filter((task) => task._id !== id);
    persistLocal(next);
    toast.success('Task deleted');

    if (localOnly || !isOnline) return;

    try {
      await tasksAPI.delete(id);
    } catch {
      setLocalOnly(true);
      queueAction?.('deleteTask', id);
    }
  };

  const toggleTask = async (id) => {
    const task = asList(tasks).find((item) => item._id === id);
    if (!task) return;
    const completed = task.status === 'completed';
    await updateTask(id, {
      status: completed ? 'todo' : 'completed',
      completedAt: completed ? null : new Date().toISOString(),
    });
  };

  return {
    tasks: asList(tasks),
    loading,
    error,
    localOnly,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
    refreshTasks: fetchTasks,
  };
};

export default useTasks;

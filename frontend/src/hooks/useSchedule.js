import { useState, useEffect, useCallback } from 'react';
import scheduleAPI from '@services/api/scheduleAPI';
import { asList } from '@services/api/tasksAPI';
import { readCollection, writeCollection, newLocalId } from '@services/storage/localFallback';
import toast from 'react-hot-toast';
import { publishActivity } from '@services/store/activitySnapshot';

export const useSchedule = (options = {}) => {
  const { autoFetch = true } = options;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);
  const [localOnly, setLocalOnly] = useState(false);

  const fetchEvents = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const data = await scheduleAPI.getAll(params);
      setEvents(asList(data));
      setLocalOnly(false);
      setError(null);
    } catch (err) {
      setEvents(readCollection('events'));
      setLocalOnly(true);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoFetch) fetchEvents();
  }, [autoFetch, fetchEvents]);

  // Share this instance's data with read-only consumers (header badge).
  useEffect(() => {
    publishActivity({ events });
  }, [events]);

  const persistLocal = (next) => {
    writeCollection('events', next);
    setEvents(next);
  };

  const createEvent = async (eventData) => {
    const optimistic = { ...eventData, _id: newLocalId(), createdAt: new Date().toISOString() };
    const next = [...asList(events), optimistic];
    setEvents(next);

    if (localOnly) {
      persistLocal(next);
      toast.success('Event added');
      return optimistic;
    }

    try {
      const newEvent = await scheduleAPI.create(eventData);
      setEvents((prev) => asList(prev).map((event) => (event._id === optimistic._id ? newEvent : event)));
      toast.success('Event added to your calendar');
      return newEvent;
    } catch (err) {
      persistLocal(next);
      setLocalOnly(true);
      toast.success('Event saved locally');
      return optimistic;
    }
  };

  const updateEvent = async (id, updates) => {
    const next = asList(events).map((event) =>
      event._id === id ? { ...event, ...updates } : event
    );
    persistLocal(next);

    if (localOnly) return next.find((event) => event._id === id);

    try {
      const updated = await scheduleAPI.update(id, updates);
      setEvents((prev) => asList(prev).map((event) => (event._id === id ? { ...event, ...updated } : event)));
      return updated;
    } catch {
      setLocalOnly(true);
      return next.find((event) => event._id === id);
    }
  };

  const deleteEvent = async (id) => {
    const next = asList(events).filter((event) => event._id !== id);
    persistLocal(next);
    toast.success('Event removed');

    if (localOnly) return;

    try {
      await scheduleAPI.delete(id);
    } catch {
      setLocalOnly(true);
    }
  };

  return {
    events: asList(events),
    loading,
    error,
    localOnly,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents,
  };
};

export default useSchedule;

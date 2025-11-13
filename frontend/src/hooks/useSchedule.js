import { useState, useEffect, useCallback } from 'react';
import scheduleAPI from '@services/api/scheduleAPI';
import toast from 'react-hot-toast';

export const useSchedule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await scheduleAPI.getAll();
      setEvents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (eventData) => {
    try {
      const newEvent = await scheduleAPI.create(eventData);
      setEvents(prev => [...prev, newEvent]);
      toast.success('Event created successfully');
      return newEvent;
    } catch (err) {
      toast.error('Failed to create event');
      throw err;
    }
  };

  const updateEvent = async (id, updates) => {
    try {
      const updatedEvent = await scheduleAPI.update(id, updates);
      setEvents(prev => prev.map(event => 
        event._id === id ? updatedEvent : event
      ));
      toast.success('Event updated successfully');
      return updatedEvent;
    } catch (err) {
      toast.error('Failed to update event');
      throw err;
    }
  };

  const deleteEvent = async (id) => {
    try {
      await scheduleAPI.delete(id);
      setEvents(prev => prev.filter(event => event._id !== id));
      toast.success('Event deleted successfully');
    } catch (err) {
      toast.error('Failed to delete event');
      throw err;
    }
  };

  return {
    events,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refreshEvents: fetchEvents,
  };
};
import { useState, useCallback, useEffect } from 'react';

const useCalendarSync = (options = {}) => {
  const {
    autoSync = true,
    syncInterval = 300000, // 5 minutes
    providers = ['google', 'outlook', 'apple'],
  } = options;

  const [connectedCalendars, setConnectedCalendars] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [syncErrors, setSyncErrors] = useState([]);
  const [events, setEvents] = useState([]);

  // Auto-sync effect
  useEffect(() => {
    if (!autoSync || connectedCalendars.length === 0) return;

    const interval = setInterval(() => {
      syncAll();
    }, syncInterval);

    return () => clearInterval(interval);
  }, [autoSync, syncInterval, connectedCalendars]);

  // Connect a calendar
  const connect = useCallback(async (provider, credentials = {}) => {
    try {
      // Simulate OAuth flow
      await new Promise(r => setTimeout(r, 1000));
      
      const calendar = {
        id: `${provider}-${Date.now()}`,
        provider,
        email: credentials.email || `user@${provider}.com`,
        connected: true,
        connectedAt: new Date(),
        lastSync: null,
        eventCount: 0,
      };

      setConnectedCalendars(prev => [...prev, calendar]);
      return { success: true, calendar };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Disconnect a calendar
  const disconnect = useCallback((calendarId) => {
    setConnectedCalendars(prev => prev.filter(c => c.id !== calendarId));
    setEvents(prev => prev.filter(e => e.calendarId !== calendarId));
  }, []);

  // Sync a single calendar
  const sync = useCallback(async (calendarId) => {
    const calendar = connectedCalendars.find(c => c.id === calendarId);
    if (!calendar) return { success: false, error: 'Calendar not found' };

    setIsSyncing(true);
    setSyncErrors(prev => prev.filter(e => e.calendarId !== calendarId));

    try {
      // Simulate sync
      await new Promise(r => setTimeout(r, 2000));

      // Generate mock events
      const mockEvents = Array.from({ length: Math.floor(Math.random() * 10) + 5 }, (_, i) => ({
        id: `${calendarId}-event-${i}`,
        calendarId,
        title: `Event ${i + 1}`,
        start: new Date(Date.now() + Math.random() * 7 * 86400000),
        end: new Date(Date.now() + Math.random() * 7 * 86400000 + 3600000),
        provider: calendar.provider,
      }));

      setEvents(prev => [
        ...prev.filter(e => e.calendarId !== calendarId),
        ...mockEvents,
      ]);

      setConnectedCalendars(prev =>
        prev.map(c =>
          c.id === calendarId
            ? { ...c, lastSync: new Date(), eventCount: mockEvents.length }
            : c
        )
      );

      setLastSync(new Date());
      return { success: true, eventCount: mockEvents.length };
    } catch (error) {
      setSyncErrors(prev => [...prev, { calendarId, error: error.message, time: new Date() }]);
      return { success: false, error: error.message };
    } finally {
      setIsSyncing(false);
    }
  }, [connectedCalendars]);

  // Sync all calendars
  const syncAll = useCallback(async () => {
    const results = await Promise.all(
      connectedCalendars.map(c => sync(c.id))
    );
    return results;
  }, [connectedCalendars, sync]);

  // Create event on remote calendar
  const createEvent = useCallback(async (calendarId, eventData) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      
      const newEvent = {
        id: `${calendarId}-event-${Date.now()}`,
        calendarId,
        ...eventData,
        synced: true,
      };

      setEvents(prev => [...prev, newEvent]);
      return { success: true, event: newEvent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Update event
  const updateEvent = useCallback(async (eventId, updates) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      
      setEvents(prev =>
        prev.map(e => e.id === eventId ? { ...e, ...updates } : e)
      );
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Delete event
  const deleteEvent = useCallback(async (eventId) => {
    try {
      await new Promise(r => setTimeout(r, 500));
      setEvents(prev => prev.filter(e => e.id !== eventId));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, []);

  // Get events for a date range
  const getEvents = useCallback((start, end) => {
    return events.filter(e => {
      const eventStart = new Date(e.start);
      return eventStart >= start && eventStart <= end;
    });
  }, [events]);

  return {
    connectedCalendars,
    events,
    isSyncing,
    lastSync,
    syncErrors,
    connect,
    disconnect,
    sync,
    syncAll,
    createEvent,
    updateEvent,
    deleteEvent,
    getEvents,
    providers,
  };
};

export default useCalendarSync;


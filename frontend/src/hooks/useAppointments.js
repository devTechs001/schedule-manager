import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { readCollection, writeCollection, newLocalId } from '@services/storage/localFallback';

/**
 * Appointments & one-off reminders
 * ------------------------------------------------------------------
 * Calendar events already cover scheduled blocks, but a "reminder" is a
 * different animal: it has no duration and its whole purpose is a moment in
 * time. Modelling it as a zero-length event would pollute the calendar, so
 * these live in their own collection.
 *
 * Persisted to localStorage under `schedai:appointments` and kept local-first
 * like every other collection, so reminders work with no backend at all.
 */

const COLLECTION = 'appointments';

export const REMINDER_PRESETS = [
  { id: 'at-time', label: 'At the time', minutes: 0 },
  { id: '10min', label: '10 minutes before', minutes: 10 },
  { id: '30min', label: '30 minutes before', minutes: 30 },
  { id: '1hour', label: '1 hour before', minutes: 60 },
  { id: '1day', label: '1 day before', minutes: 1440 },
];

export const REPEAT_OPTIONS = [
  { id: 'none', label: 'Does not repeat' },
  { id: 'daily', label: 'Every day' },
  { id: 'weekdays', label: 'Every weekday' },
  { id: 'weekly', label: 'Every week' },
  { id: 'monthly', label: 'Every month' },
];

const normalise = (appointment) => ({
  _id: appointment._id || newLocalId(),
  title: String(appointment.title || '').trim() || 'Reminder',
  notes: appointment.notes || '',
  // ISO string — always the *reminder* moment, not the underlying event start.
  at: appointment.at instanceof Date ? appointment.at.toISOString() : appointment.at,
  notifyMinutesBefore: Number(appointment.notifyMinutesBefore || 0),
  repeat: appointment.repeat || 'none',
  categories: Array.isArray(appointment.categories) ? appointment.categories : [],
  linkedTaskId: appointment.linkedTaskId || null,
  linkedEventId: appointment.linkedEventId || null,
  done: Boolean(appointment.done),
  createdAt: appointment.createdAt || new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

/** Next occurrence for a repeating reminder, used after one is marked done. */
export const nextOccurrence = (appointment) => {
  const base = new Date(appointment.at);
  if (!appointment.at || Number.isNaN(base.getTime())) return null;

  const next = new Date(base);
  switch (appointment.repeat) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekdays': {
      next.setDate(next.getDate() + 1);
      // Skip Saturday (6) and Sunday (0)
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1);
      }
      break;
    }
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return null;
  }
  return next;
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAppointments(readCollection(COLLECTION).map(normalise));
    setLoading(false);
  }, []);

  const persist = useCallback((next) => {
    writeCollection(COLLECTION, next);
    setAppointments(next);
  }, []);

  const createAppointment = useCallback(
    (data) => {
      const created = normalise(data);
      persist([...appointments, created]);
      toast.success('Reminder set');
      return created;
    },
    [appointments, persist]
  );

  const updateAppointment = useCallback(
    (id, patch) => {
      const next = appointments.map((item) =>
        item._id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
      );
      persist(next);
      return next.find((item) => item._id === id);
    },
    [appointments, persist]
  );

  const removeAppointment = useCallback(
    (id) => {
      persist(appointments.filter((item) => item._id !== id));
      toast.success('Reminder removed');
    },
    [appointments, persist]
  );

  /**
   * Mark done. Repeating reminders roll forward instead of disappearing, so a
   * daily standup reminder keeps working without babysitting.
   */
  const completeAppointment = useCallback(
    (id) => {
      const target = appointments.find((item) => item._id === id);
      if (!target) return;

      const next = nextOccurrence(target);
      if (next) {
        persist(
          appointments.map((item) =>
            item._id === id
              ? { ...item, at: next.toISOString(), updatedAt: new Date().toISOString() }
              : item
          )
        );
        toast.success('Done — next one scheduled');
        return;
      }

      persist(appointments.map((item) => (item._id === id ? { ...item, done: true } : item)));
      toast.success('Reminder done');
    },
    [appointments, persist]
  );

  const snoozeAppointment = useCallback(
    (id, minutes = 15) => {
      const target = appointments.find((item) => item._id === id);
      if (!target) return;
      const base = new Date(target.at);
      const from = Number.isNaN(base.getTime()) || base < new Date() ? new Date() : base;
      const at = new Date(from.getTime() + minutes * 60000).toISOString();
      persist(appointments.map((item) => (item._id === id ? { ...item, at } : item)));
      toast.success(`Snoozed ${minutes} minutes`);
    },
    [appointments, persist]
  );

  const active = useMemo(() => appointments.filter((item) => !item.done), [appointments]);
  const completed = useMemo(() => appointments.filter((item) => item.done), [appointments]);

  return {
    appointments,
    active,
    completed,
    loading,
    createAppointment,
    updateAppointment,
    removeAppointment,
    completeAppointment,
    snoozeAppointment,
  };
};

export default useAppointments;

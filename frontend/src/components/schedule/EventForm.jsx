import React, { useEffect, useMemo, useState } from 'react';
import { FaSave, FaTimes, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaVideo, FaBell } from 'react-icons/fa';
import Input from '@components/ui/Input';
import { Field, Select, Textarea } from '@components/ui/Field';

/** Local ISO string (YYYY-MM-DDTHH:mm) for <input type="datetime-local"> */
const toLocalInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60 * 1000).toISOString().slice(0, 16);
};

const TYPES = [
  { id: 'meeting', label: 'Meeting' },
  { id: 'task', label: 'Focus / task' },
  { id: 'deadline', label: 'Deadline' },
  { id: 'reminder', label: 'Reminder' },
];

const REMINDERS = [
  { value: 0, label: 'No reminder' },
  { value: 5, label: '5 minutes before' },
  { value: 15, label: '15 minutes before' },
  { value: 30, label: '30 minutes before' },
  { value: 60, label: '1 hour before' },
  { value: 1440, label: '1 day before' },
];

const EventForm = ({ event, onSubmit, onCancel }) => {
  const initial = useMemo(() => {
    const now = new Date();
    const start = event?.start ? new Date(event.start) : new Date(now.getTime() + 60 * 60 * 1000);
    const end = event?.end
      ? new Date(event.end)
      : new Date(start.getTime() + 60 * 60 * 1000);

    return {
      title: event?.title || '',
      description: event?.description || '',
      start: toLocalInput(start),
      end: toLocalInput(end),
      type: event?.type || 'meeting',
      location: event?.location || '',
      meetingLink: event?.meetingLink || '',
      reminder: event?.reminder?.minutesBefore ?? 15,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event?._id]);

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event_) => {
    event_.preventDefault();

    const nextErrors = {};
    if (form.title.trim().length < 2) nextErrors.title = 'Give the event a title';
    if (!form.start) nextErrors.start = 'Pick a start time';
    if (!form.end) nextErrors.end = 'Pick an end time';
    if (form.start && form.end && new Date(form.end) <= new Date(form.start)) {
      nextErrors.end = 'The end must be after the start';
    }

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        start: new Date(form.start).toISOString(),
        end: new Date(form.end).toISOString(),
        reminder: { enabled: Boolean(form.reminder), minutesBefore: Number(form.reminder) || 0 },
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Event title" htmlFor="event-title" required error={errors.title}>
        <Input
          id="event-title"
          value={form.title}
          onChange={(e) => update('title', e.target.value)}
          placeholder="e.g. Design review with the team"
          autoFocus
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Starts" htmlFor="event-start" required error={errors.start}>
          <div className="relative">
            <FaCalendarAlt className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
            <Input
              id="event-start"
              type="datetime-local"
              value={form.start}
              onChange={(e) => update('start', e.target.value)}
              className="pl-10"
            />
          </div>
        </Field>

        <Field label="Ends" htmlFor="event-end" required error={errors.end}>
          <div className="relative">
            <FaClock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
            <Input
              id="event-end"
              type="datetime-local"
              value={form.end}
              onChange={(e) => update('end', e.target.value)}
              className="pl-10"
            />
          </div>
        </Field>
      </div>

      <div>
        <p className="label">Type</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => update('type', type.id)}
              aria-pressed={form.type === type.id}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-colors ${
                form.type === type.id
                  ? 'border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                  : 'border-line text-content-muted hover:border-primary-300'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Location" htmlFor="event-location" hint="Optional">
          <div className="relative">
            <FaMapMarkerAlt className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
            <Input
              id="event-location"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
              placeholder="Room 4, Nairobi"
              className="pl-10"
            />
          </div>
        </Field>

        <Field label="Meeting link" htmlFor="event-link" hint="Zoom, Meet, Teams…">
          <div className="relative">
            <FaVideo className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
            <Input
              id="event-link"
              value={form.meetingLink}
              onChange={(e) => update('meetingLink', e.target.value)}
              placeholder="https://meet.google.com/…"
              className="pl-10"
            />
          </div>
        </Field>
      </div>

      <Field label="Reminder" htmlFor="event-reminder">
        <div className="relative">
          <FaBell className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-content-subtle" size={11} />
          <Select
            id="event-reminder"
            value={form.reminder}
            onChange={(e) => update('reminder', e.target.value)}
            className="pl-10"
          >
            {REMINDERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </Field>

      <Field label="Notes" htmlFor="event-description">
        <Textarea
          id="event-description"
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          placeholder="Agenda, context, links…"
        />
      </Field>

      <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
            <FaTimes size={9} /> Cancel
          </button>
        )}
        <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
          <FaSave size={9} /> {saving ? 'Saving…' : event?._id ? 'Save event' : 'Create event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm;

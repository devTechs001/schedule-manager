import React, { useEffect, useMemo, useState } from 'react';
import { FaCalendarAlt, FaList, FaPlus, FaSyncAlt, FaClock, FaVideo } from 'react-icons/fa';
import { format, isToday, isTomorrow, isFuture, isPast } from 'date-fns';
import { useSchedule } from '@hooks/useSchedule';
import CalendarView from '@components/schedule/CalendarView';
import ScheduleView from '@components/schedule/ScheduleView';
import EventForm from '@components/schedule/EventForm';
import Modal from '@components/ui/Modal';
import EmptyState from '@components/ui/EmptyState';
import Badge from '@components/ui/Badge';
import ConflictResolver from '@components/schedule/ConflictResolver';
import TrafficAware from '@components/schedule/TrafficAware';
import WeatherIntegration from '@components/schedule/WeatherIntegration';

const Schedule = () => {
  const { events, loading, createEvent, updateEvent, deleteEvent, refreshEvents } = useSchedule();
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');

  useEffect(() => {
    document.title = 'Schedule — SchedAI';
  }, []);

  const stats = useMemo(() => {
    const list = Array.isArray(events) ? events : [];
    return {
      total: list.length,
      today: list.filter((event) => isToday(new Date(event.start))).length,
      upcoming: list.filter((event) => isFuture(new Date(event.start))).length,
      past: list.filter((event) => isPast(new Date(event.end || event.start))).length,
      next: list
        .filter((event) => isFuture(new Date(event.start)))
        .sort((a, b) => new Date(a.start) - new Date(b.start))[0],
    };
  }, [events]);

  const openCreate = () => {
    setSelectedEvent(null);
    setShowModal(true);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent({ start: slotInfo.start, end: slotInfo.end });
    setShowModal(true);
  };

  const handleSubmit = async (eventData) => {
    if (selectedEvent?._id) {
      await updateEvent(selectedEvent._id, eventData);
    } else {
      await createEvent(eventData);
    }
    setShowModal(false);
    setSelectedEvent(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this event?')) {
      await deleteEvent(id);
      setShowModal(false);
      setSelectedEvent(null);
    }
  };

  const handleDrop = async (event, start, end) => {
    await updateEvent(event._id, { start, end });
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Schedule</h1>
          <p className="page-subtitle">
            {loading
              ? 'Syncing your calendar…'
              : `${stats.total} events · ${stats.today} today · ${stats.upcoming} upcoming`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-line bg-surface-raised p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'calendar' ? 'bg-primary-600 text-white' : 'text-content-muted'
              }`}
            >
              <FaCalendarAlt size={9} /> Calendar
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-content-muted'
              }`}
            >
              <FaList size={9} /> List
            </button>
          </div>
          <button type="button" onClick={() => refreshEvents()} className="btn btn-outline btn-sm" aria-label="Refresh">
            <FaSyncAlt size={9} className={loading ? 'animate-spin' : ''} />
          </button>
          <button type="button" onClick={openCreate} className="btn btn-primary btn-sm">
            <FaPlus size={9} /> New event
          </button>
        </div>
      </div>

      {/* Next event banner */}
      {stats.next && (
        <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
              <FaClock size={14} />
            </span>
            <div className="min-w-0">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">Next up</p>
              <p className="truncate text-sm font-semibold text-content">{stats.next.title}</p>
              <p className="text-xs text-content-muted">
                {isToday(new Date(stats.next.start))
                  ? 'Today'
                  : isTomorrow(new Date(stats.next.start))
                  ? 'Tomorrow'
                  : format(new Date(stats.next.start), 'EEE, MMM d')}
                {' · '}
                {format(new Date(stats.next.start), 'h:mm a')}
                {stats.next.location ? ` · ${stats.next.location}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {stats.next.meetingLink && (
              <a href={stats.next.meetingLink} target="_blank" rel="noreferrer noopener" className="btn btn-outline btn-sm">
                <FaVideo size={9} /> Join
              </a>
            )}
            <button type="button" onClick={() => handleSelectEvent(stats.next)} className="btn btn-secondary btn-sm">
              Details
            </button>
          </div>
        </div>
      )}

      {viewMode === 'calendar' ? (
        <CalendarView
          events={events}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleDrop}
        />
      ) : (
        <div className="card p-4">
          {events.length === 0 && !loading ? (
            <EmptyState
              icon={<FaCalendarAlt />}
              title="No events yet"
              description="Create your first event, or click any day in the calendar view."
              action={
                <button type="button" onClick={openCreate} className="btn btn-primary btn-sm mt-1">
                  <FaPlus size={9} /> Create event
                </button>
              }
            />
          ) : (
            <ScheduleView events={events} onEventClick={handleSelectEvent} />
          )}
        </div>
      )}

      {/* Real overlap detection from the user's own events. */}
      {events.length > 1 && (
        <ConflictResolver
          events={events}
          onReschedule={(conflict) => handleSelectEvent(conflict.events[1])}
        />
      )}

      {events.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <TrafficAware events={events} />
          <WeatherIntegration events={events} />
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent?._id ? 'Edit event' : 'New event'}
        subtitle={selectedEvent?._id ? format(new Date(selectedEvent.start), 'PPPP') : 'Pick a time and add the details.'}
        size="lg"
        footer={
          selectedEvent?._id ? (
            <button
              type="button"
              onClick={() => handleDelete(selectedEvent._id)}
              className="btn btn-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
            >
              Delete event
            </button>
          ) : null
        }
      >
        <EventForm
          event={selectedEvent}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default Schedule;

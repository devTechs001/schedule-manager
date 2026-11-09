import React, { useMemo, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const TYPE_COLORS = {
  meeting: { backgroundColor: '#6366f1', borderColor: '#4f46e5' },
  task: { backgroundColor: '#f59e0b', borderColor: '#d97706' },
  deadline: { backgroundColor: '#ef4444', borderColor: '#dc2626' },
  reminder: { backgroundColor: '#10b981', borderColor: '#059669' },
};

const VIEWS_MAP = {
  month: Views.MONTH,
  week: Views.WEEK,
  work_week: Views.WORK_WEEK,
  day: Views.DAY,
  agenda: Views.AGENDA,
};

const CalendarView = ({ events = [], onSelectEvent, onSelectSlot, onEventDrop }) => {
  const [view, setView] = useState('month');
  const [date, setDate] = useState(new Date());

  // react-big-calendar needs Date objects for start/end
  const calendarEvents = useMemo(
    () =>
      (Array.isArray(events) ? events : []).map((event) => ({
        ...event,
        start: new Date(event.start),
        end: event.end ? new Date(event.end) : new Date(new Date(event.start).getTime() + 60 * 60 * 1000),
      })),
    [events]
  );

  const eventPropGetter = (event) => {
    const colors = TYPE_COLORS[event.type] || TYPE_COLORS.meeting;
    return { style: { ...colors, color: '#fff', borderRadius: '6px', border: '0', fontSize: '0.72rem' } };
  };

  const handleEventDrop = ({ event, start, end }) => {
    if (typeof onEventDrop === 'function' && event?._id) {
      onEventDrop(event, start, end);
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* View switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-content">Calendar</h2>
          <p className="text-[0.68rem] text-content-muted">
            {calendarEvents.length} event{calendarEvents.length === 1 ? '' : 's'} in view
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.keys(VIEWS_MAP).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setView(option)}
              className={`rounded-lg px-2.5 py-1.5 text-[0.68rem] font-semibold capitalize transition-colors ${
                view === option
                  ? 'bg-primary-600 text-white'
                  : 'text-content-muted hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
              aria-pressed={view === option}
            >
              {option.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          view={VIEWS_MAP[view]}
          onView={(nextView) => {
            const match = Object.entries(VIEWS_MAP).find(([, value]) => value === nextView);
            if (match) setView(match[0]);
          }}
          date={date}
          onNavigate={setDate}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          selectable
          resizable={false}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          onEventDrop={handleEventDrop}
          eventPropGetter={eventPropGetter}
          popup
          style={{ height: '70vh', minHeight: 520 }}
        />
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 border-t border-line px-4 py-2.5">
        {Object.entries(TYPE_COLORS).map(([type, colors]) => (
          <span key={type} className="flex items-center gap-1.5 text-[0.65rem] capitalize text-content-muted">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.backgroundColor }} />
            {type}
          </span>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;

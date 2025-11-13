import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
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

const CalendarView = ({ events, onSelectEvent, onSelectSlot, onEventDrop }) => {
  const [view, setView] = useState('month');

  const eventStyleGetter = (event) => {
    const colors = {
      meeting: { backgroundColor: '#6366f1' },
      task: { backgroundColor: '#f59e0b' },
      deadline: { backgroundColor: '#ef4444' },
      reminder: { backgroundColor: '#22c55e' },
    };

    return {
      style: {
        ...colors[event.type] || { backgroundColor: '#6366f1' },
        borderRadius: '5px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  const handleEventDrop = ({ event, start, end }) => {
    onEventDrop({ ...event, start, end });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calendar</h2>
        <div className="flex space-x-2">
          {['month', 'week', 'day', 'agenda'].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`
                px-4 py-2 rounded-lg font-medium transition-colors capitalize
                ${view === v
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }
              `}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: '700px' }} className="calendar-container">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          view={view}
          onView={setView}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          onEventDrop={handleEventDrop}
          selectable
          resizable
          eventPropGetter={eventStyleGetter}
          popup
          className="dark:text-white"
        />
      </div>
    </div>
  );
};

export default CalendarView;
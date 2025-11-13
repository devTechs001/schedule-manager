import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const TaskCalendar = ({ tasks, onSelectTask, onSelectSlot }) => {
  const events = tasks
    .filter(task => task.dueDate)
    .map(task => ({
      id: task._id,
      title: task.title,
      start: new Date(task.dueDate),
      end: new Date(task.dueDate),
      resource: task,
    }));

  const eventStyleGetter = (event) => {
    const task = event.resource;
    let backgroundColor = '#6366f1';

    if (task.status === 'completed') backgroundColor = '#22c55e';
    else if (task.priority === 'high') backgroundColor = '#ef4444';
    else if (task.priority === 'medium') backgroundColor = '#f59e0b';

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block',
      },
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div style={{ height: '600px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={(event) => onSelectTask(event.resource)}
          onSelectSlot={onSelectSlot}
          selectable
          eventPropGetter={eventStyleGetter}
          className="dark:text-white"
        />
      </div>
    </div>
  );
};

export default TaskCalendar;
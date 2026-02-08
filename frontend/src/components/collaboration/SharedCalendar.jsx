import React, { useState } from 'react';
import { FaCalendarAlt, FaChevronLeft, FaChevronRight, FaPlus, FaUsers } from 'react-icons/fa';

const SharedCalendar = ({ events = [], members = [], onEventClick, onAddEvent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month');

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    // Add previous month days
    for (let i = 0; i < firstDay.getDay(); i++) {
      const day = new Date(year, month, -i);
      days.unshift({ date: day, isCurrentMonth: false });
    }
    
    // Add current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Add next month days
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  const getEventsForDay = (date) => {
    return events.filter(e => {
      const eventDate = new Date(e.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + direction,
      1
    ));
  };

  const isToday = (date) => date.toDateString() === new Date().toDateString();

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <FaCalendarAlt className="text-primary-600" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Shared Calendar</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FaUsers className="text-gray-400" />
            <div className="flex -space-x-2">
              {members.slice(0, 3).map((m, i) => (
                <div key={i} className="w-6 h-6 rounded-full bg-primary-500 border-2 border-white text-white text-xs flex items-center justify-center">
                  {m.name?.[0]}
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={onAddEvent}
            className="flex items-center gap-2 px-3 py-1 bg-primary-600 text-white rounded-lg text-sm"
          >
            <FaPlus /> Add Event
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <FaChevronLeft />
        </button>
        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h4>
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map(({ date, isCurrentMonth }, i) => {
            const dayEvents = getEventsForDay(date);
            return (
              <div
                key={i}
                className={`min-h-[80px] p-1 border border-gray-100 dark:border-gray-700 rounded ${
                  !isCurrentMonth ? 'bg-gray-50 dark:bg-gray-900/50' : ''
                } ${isToday(date) ? 'ring-2 ring-primary-500' : ''}`}
              >
                <span className={`text-sm ${
                  isCurrentMonth ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                } ${isToday(date) ? 'font-bold text-primary-600' : ''}`}>
                  {date.getDate()}
                </span>
                <div className="mt-1 space-y-1">
                  {dayEvents.slice(0, 2).map((event, j) => (
                    <button
                      key={j}
                      onClick={() => onEventClick?.(event)}
                      className="w-full text-left text-xs p-1 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 truncate"
                    >
                      {event.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <span className="text-xs text-gray-500">+{dayEvents.length - 2} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SharedCalendar;


import React from 'react';
import { format, isToday, isTomorrow } from 'date-fns';
import { FaClock, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import Badge from '@components/ui/Badge';

const ScheduleView = ({ events, onEventClick }) => {
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = format(new Date(event.start), 'yyyy-MM-dd');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {});

  const getDateLabel = (dateStr) => {
    const date = new Date(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'EEEE, MMMM d');
  };

  const typeColors = {
    meeting: 'primary',
    task: 'warning',
    deadline: 'danger',
    reminder: 'success',
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedEvents).map(([date, dateEvents]) => (
        <div key={date} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {getDateLabel(date)}
          </h3>
          <div className="space-y-3">
            {dateEvents.map((event) => (
              <div
                key={event._id}
                onClick={() => onEventClick(event)}
                className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
              >
                <div className="flex-shrink-0">
                  <div className="w-2 h-16 bg-primary-600 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="text-base font-medium text-gray-900 dark:text-white">
                      {event.title}
                    </h4>
                    <Badge variant={typeColors[event.type]} size="sm">
                      {event.type}
                    </Badge>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {event.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <FaClock className="mr-1" size={12} />
                      {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                    </div>
                    {event.location && (
                      <div className="flex items-center">
                        <FaMapMarkerAlt className="mr-1" size={12} />
                        {event.location}
                      </div>
                    )}
                    {event.attendees && event.attendees.length > 0 && (
                      <div className="flex items-center">
                        <FaUsers className="mr-1" size={12} />
                        {event.attendees.length} attendees
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(groupedEvents).length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <p className="text-gray-400">No events scheduled</p>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;
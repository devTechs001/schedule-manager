import React, { useState } from 'react';
import { useSchedule } from '@hooks/useSchedule';
import CalendarView from '@components/schedule/CalendarView';
import ScheduleView from '@components/schedule/ScheduleView';
import EventForm from '@components/schedule/EventForm';
import Modal from '@components/ui/Modal';
import { FaCalendar, FaList } from 'react-icons/fa';

const Schedule = () => {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useSchedule();
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [viewMode, setViewMode] = useState('calendar');

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setShowModal(true);
  };

  const handleSelectSlot = (slotInfo) => {
    setSelectedEvent({
      start: slotInfo.start,
      end: slotInfo.end,
    });
    setShowModal(true);
  };

  const handleSubmit = async (eventData) => {
    try {
      if (selectedEvent?._id) {
        await updateEvent(selectedEvent._id, eventData);
      } else {
        await createEvent(eventData);
      }
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Failed to save event:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(id);
      setShowModal(false);
      setSelectedEvent(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your calendar and events
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`p-2 rounded-lg ${
              viewMode === 'calendar'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <FaCalendar size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <FaList size={20} />
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <CalendarView
          events={events}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={({ _id, start, end }) => updateEvent(_id, { start, end })}
        />
      ) : (
        <ScheduleView
          events={events}
          onEventClick={handleSelectEvent}
        />
      )}

      {/* Event Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent?._id ? 'Edit Event' : 'Create New Event'}
        size="lg"
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
import React, { useState, useEffect } from 'react';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { FaSave, FaTimes } from 'react-icons/fa';

const EventForm = ({ event, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    type: 'meeting',
    location: '',
    attendees: [],
    reminder: 15,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        start: event.start ? new Date(event.start).toISOString().slice(0, 16) : '',
        end: event.end ? new Date(event.end).toISOString().slice(0, 16) : '',
      });
    }
  }, [event]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      start: new Date(formData.start),
      end: new Date(formData.end),
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Event Title"
        name="title"
        value={formData.title}
        onChange={handleChange}
        placeholder="Enter event title"
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="Event description"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Date & Time"
          type="datetime-local"
          name="start"
          value={formData.start}
          onChange={handleChange}
          required
        />

        <Input
          label="End Date & Time"
          type="datetime-local"
          name="end"
          value={formData.end}
          onChange={handleChange}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Event Type
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="meeting">Meeting</option>
            <option value="task">Task</option>
            <option value="deadline">Deadline</option>
            <option value="reminder">Reminder</option>
          </select>
        </div>

        <Input
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Event location"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Reminder (minutes before)
        </label>
        <select
          name="reminder"
          value={formData.reminder}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="0">No reminder</option>
          <option value="5">5 minutes</option>
          <option value="15">15 minutes</option>
          <option value="30">30 minutes</option>
          <option value="60">1 hour</option>
          <option value="1440">1 day</option>
        </select>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" icon={<FaTimes />} onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" icon={<FaSave />}>
          {event ? 'Update' : 'Create'} Event
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
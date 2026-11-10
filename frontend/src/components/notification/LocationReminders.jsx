import React, { useState } from 'react';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { FaMapMarkerAlt, FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaHome, FaBuilding, FaStore, FaGlobe } from 'react-icons/fa';

const LocationReminders = ({ reminders: initialReminders = [], locations: initialLocations = [], onCreate, onDelete, onToggle }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newReminder, setNewReminder] = useState({ location: '', task: '', trigger: 'arrive' });



  const [locations] = useState(initialLocations);
  // Persisted: a location reminder that vanishes on navigation is useless.
  const [reminders, setReminders] = useLocalStorage('schedai:location-reminders', initialReminders);

  const handleCreate = () => {
    if (!newReminder.location || !newReminder.task) return;
    const reminder = {
      ...newReminder,
      id: Date.now(),
      active: true,
    };
    setReminders([...reminders, reminder]);
    setNewReminder({ location: '', task: '', trigger: 'arrive' });
    setShowCreate(false);
    onCreate?.(reminder);
  };

  const handleToggle = (id) => {
    setReminders(reminders.map(r =>
      r.id === id ? { ...r, active: !r.active } : r
    ));
    onToggle?.(id);
  };

  const handleDelete = (id) => {
    setReminders(reminders.filter(r => r.id !== id));
    onDelete?.(id);
  };

  const getLocationIcon = (locationName) => {
    const loc = locations.find(l => l.name === locationName);
    return loc?.icon || FaMapMarkerAlt;
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaMapMarkerAlt className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Location Reminders</h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
        >
          <FaPlus /> Add Reminder
        </button>
      </div>

      {/* Saved Locations */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-content mb-3">Saved Locations</h4>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {locations.map((loc) => (
            <div
              key={loc.id}
              className="flex items-center gap-2 px-4 py-2 bg-surface-sunken rounded-lg whitespace-nowrap"
            >
              <loc.icon className="text-primary-600" />
              <span className="text-sm text-content">{loc.name}</span>
            </div>
          ))}
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-line rounded-lg text-content-muted hover:border-primary-400 hover:text-primary-600">
            <FaPlus className="text-xs" /> Add
          </button>
        </div>
      </div>

      {/* Create Reminder Form */}
      {showCreate && (
        <div className="mb-6 p-4 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-content mb-1">Location</label>
              <select
                value={newReminder.location}
                onChange={(e) => setNewReminder({ ...newReminder, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg bg-surface-sunken border-line"
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-content mb-1">Remind me to</label>
              <input
                type="text"
                placeholder="e.g., Buy groceries"
                value={newReminder.task}
                onChange={(e) => setNewReminder({ ...newReminder, task: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg bg-surface-sunken border-line"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-content mb-1">Trigger when I</label>
              <div className="flex gap-2">
                {['arrive', 'leave'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setNewReminder({ ...newReminder, trigger: t })}
                    className={`flex-1 py-2 rounded-lg capitalize ${
                      newReminder.trigger === t
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-sunken text-content'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={!newReminder.location || !newReminder.task}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
            >
              Create Reminder
            </button>
          </div>
        </div>
      )}

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-center text-content-muted py-8">No location reminders set</p>
        ) : (
          reminders.map((reminder) => {
            const LocationIcon = getLocationIcon(reminder.location);
            return (
              <div
                key={reminder.id}
                className={`p-4 rounded-lg border-2 ${
                  reminder.active
                    ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                    : 'border-line opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                      <LocationIcon className="text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-content">{reminder.task}</p>
                      <p className="text-sm text-content-muted">
                        When I {reminder.trigger} <span className="font-medium">{reminder.location}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(reminder.id)}
                      className={reminder.active ? 'text-green-500' : 'text-content-subtle'}
                    >
                      {reminder.active ? <FaToggleOn className="text-2xl" /> : <FaToggleOff className="text-2xl" />}
                    </button>
                    <button
                      onClick={() => handleDelete(reminder.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LocationReminders;


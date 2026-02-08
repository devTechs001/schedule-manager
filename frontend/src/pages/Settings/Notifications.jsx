import { useState } from 'react';
import { FaBell, FaEnvelope, FaMobile, FaDesktop, FaCalendarAlt, FaTasks, FaUsers, FaExclamationTriangle } from 'react-icons/fa';

const Notifications = () => {
  const [settings, setSettings] = useState({
    channels: {
      push: true,
      email: true,
      sms: false,
      desktop: true,
    },
    categories: {
      tasks: { enabled: true, push: true, email: true },
      calendar: { enabled: true, push: true, email: false },
      team: { enabled: true, push: true, email: true },
      reminders: { enabled: true, push: true, email: false },
      system: { enabled: true, push: false, email: true },
    },
    quiet: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
  });

  const toggleChannel = (channel) => {
    setSettings(prev => ({
      ...prev,
      channels: { ...prev.channels, [channel]: !prev.channels[channel] },
    }));
  };

  const toggleCategory = (category, field) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: { ...prev.categories[category], [field]: !prev.categories[category][field] },
      },
    }));
  };

  const categories = [
    { id: 'tasks', name: 'Tasks', description: 'Task updates, assignments, and deadlines', icon: FaTasks },
    { id: 'calendar', name: 'Calendar', description: 'Event reminders and schedule changes', icon: FaCalendarAlt },
    { id: 'team', name: 'Team', description: 'Team activity and mentions', icon: FaUsers },
    { id: 'reminders', name: 'Reminders', description: 'Custom reminders and alerts', icon: FaBell },
    { id: 'system', name: 'System', description: 'Security alerts and account updates', icon: FaExclamationTriangle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notification Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage how you receive notifications</p>
        </div>

        {/* Notification Channels */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Notification Channels</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'push', name: 'Push', icon: FaMobile },
              { id: 'email', name: 'Email', icon: FaEnvelope },
              { id: 'sms', name: 'SMS', icon: FaMobile },
              { id: 'desktop', name: 'Desktop', icon: FaDesktop },
            ].map((channel) => (
              <button
                key={channel.id}
                onClick={() => toggleChannel(channel.id)}
                className={`p-4 rounded-xl border-2 transition-colors ${
                  settings.channels[channel.id]
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              >
                <channel.icon className={`text-2xl mx-auto mb-2 ${
                  settings.channels[channel.id] ? 'text-blue-500' : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  settings.channels[channel.id] ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'
                }`}>{channel.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Category Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Categories</h2>
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <category.icon className="text-xl text-gray-500 dark:text-gray-400" />
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{category.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.categories[category.id].push}
                      onChange={() => toggleCategory(category.id, 'push')}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      settings.categories[category.id].push ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`w-4 h-4 mt-1 ml-1 bg-white rounded-full transition-transform ${
                        settings.categories[category.id].push ? 'translate-x-4' : ''
                      }`} />
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Push</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.categories[category.id].email}
                      onChange={() => toggleCategory(category.id, 'email')}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      settings.categories[category.id].email ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      <div className={`w-4 h-4 mt-1 ml-1 bg-white rounded-full transition-transform ${
                        settings.categories[category.id].email ? 'translate-x-4' : ''
                      }`} />
                    </div>
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Email</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Quiet Hours</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pause notifications during specific hours</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.quiet.enabled}
                onChange={() => setSettings(prev => ({ ...prev, quiet: { ...prev.quiet, enabled: !prev.quiet.enabled } }))}
                className="sr-only"
              />
              <div className={`w-12 h-7 rounded-full transition-colors ${
                settings.quiet.enabled ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}>
                <div className={`w-5 h-5 mt-1 ml-1 bg-white rounded-full transition-transform ${
                  settings.quiet.enabled ? 'translate-x-5' : ''
                }`} />
              </div>
            </label>
          </div>
          {settings.quiet.enabled && (
            <div className="flex items-center space-x-4">
              <input
                type="time"
                value={settings.quiet.start}
                onChange={(e) => setSettings(prev => ({ ...prev, quiet: { ...prev.quiet, start: e.target.value } }))}
                className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
              <span className="text-gray-500">to</span>
              <input
                type="time"
                value={settings.quiet.end}
                onChange={(e) => setSettings(prev => ({ ...prev, quiet: { ...prev.quiet, end: e.target.value } }))}
                className="px-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;


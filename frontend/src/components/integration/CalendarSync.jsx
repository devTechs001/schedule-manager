import React, { useState } from 'react';
import { FaGoogle, FaMicrosoft, FaApple, FaSync, FaCheck, FaExclamationTriangle, FaCog } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { connectProvider, syncProvider } from './syncConnect';

const CalendarSync = ({ onConnect, onDisconnect, onSync }) => {
  // Nothing is connected until the user actually connects it. This used to
  // default to ['google'], so the panel claimed a live Google Calendar
  // integration — with "45 events synced" — that had never been authorised.
  const [connectedCalendars, setConnectedCalendars] = useState([]);
  // null until a sync actually happens; it used to start five minutes ago.
  const [lastSync, setLastSync] = useState(null);

  const calendars = [
    // No "45 events synced": that figure belonged to no real calendar account.
    { id: 'google', name: 'Google Calendar', icon: FaGoogle, color: 'red' },
    { id: 'outlook', name: 'Outlook Calendar', icon: FaMicrosoft, color: 'blue', status: 'disconnected' },
    { id: 'apple', name: 'Apple Calendar', icon: FaApple, color: 'gray', status: 'disconnected' },
  ];

  const handleConnect = (calendarId) => {
    const calendar = calendars.find(c => c.id === calendarId);
    const result = connectProvider(calendar.name, onConnect ? () => onConnect(calendarId) : undefined);
    if (!result.ok) {
      toast(result.message);
      return;
    }
    setConnectedCalendars([...connectedCalendars, calendarId]);
  };

  const handleDisconnect = (calendarId) => {
    setConnectedCalendars(connectedCalendars.filter(c => c !== calendarId));
    onDisconnect?.(calendarId);
  };

  const handleSync = (calendarId) => {
    const calendar = calendars.find(c => c.id === calendarId);
    const result = syncProvider(calendar.name, onSync ? () => onSync(calendarId) : undefined);
    if (!result.ok) {
      toast(result.message);
      return;
    }
    setLastSync(new Date());
  };

  const isConnected = (id) => connectedCalendars.includes(id);

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-content">Calendar Sync</h3>
        <span className="text-sm text-content-muted">
          {lastSync ? `Last sync: ${lastSync.toLocaleTimeString()}` : 'Not synced yet'}
        </span>
      </div>

      <div className="space-y-4">
        {calendars.map((calendar) => {
          const connected = isConnected(calendar.id);
          
          return (
            <div
              key={calendar.id}
              className={`p-4 rounded-lg border-2 ${
                connected
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-surface-sunken flex items-center justify-center`}>
                    <calendar.icon className={`text-content-muted text-xl`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-content">{calendar.name}</h4>
                    <div className="flex items-center gap-2 text-sm">
                      {connected ? (
                        <>
                          <FaCheck className="text-green-500" />
                          <span className="text-green-600">Connected</span>
                        </>
                      ) : (
                        <span className="text-content-muted">Not connected</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connected && (
                    <>
                      <button
                        onClick={() => handleSync(calendar.id)}
                        className="p-2 text-content-muted hover:text-primary-600 transition-colors"
                      >
                        <FaSync />
                      </button>
                      <button className="p-2 text-content-muted hover:text-content">
                        <FaCog />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => connected ? handleDisconnect(calendar.id) : handleConnect(calendar.id)}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      connected
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Settings */}
      <div className="mt-6 p-4 bg-surface-sunken rounded-lg">
        <h4 className="font-medium text-content mb-3">Sync Settings</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-content">Auto-sync every 15 minutes</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-content">Two-way sync (push changes back)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-content">Include declined events</span>
          </label>
        </div>
      </div>

      {/* Warning */}
      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-start gap-3">
        <FaExclamationTriangle className="text-yellow-500 mt-0.5" />
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Syncing will import all events from the last 30 days and upcoming 90 days.
        </p>
      </div>
    </div>
  );
};

export default CalendarSync;


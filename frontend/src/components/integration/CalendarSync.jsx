import React, { useState } from 'react';
import { FaGoogle, FaMicrosoft, FaApple, FaSync, FaCheck, FaExclamationTriangle, FaCog } from 'react-icons/fa';

const CalendarSync = ({ onConnect, onDisconnect, onSync }) => {
  const [connectedCalendars, setConnectedCalendars] = useState(['google']);
  const [syncing, setSyncing] = useState(null);
  const [lastSync, setLastSync] = useState(new Date(Date.now() - 300000));

  const calendars = [
    { id: 'google', name: 'Google Calendar', icon: FaGoogle, color: 'red', status: 'connected', events: 45 },
    { id: 'outlook', name: 'Outlook Calendar', icon: FaMicrosoft, color: 'blue', status: 'disconnected' },
    { id: 'apple', name: 'Apple Calendar', icon: FaApple, color: 'gray', status: 'disconnected' },
  ];

  const handleConnect = async (calendarId) => {
    setSyncing(calendarId);
    await new Promise(r => setTimeout(r, 2000));
    setConnectedCalendars([...connectedCalendars, calendarId]);
    setSyncing(null);
    onConnect?.(calendarId);
  };

  const handleDisconnect = (calendarId) => {
    setConnectedCalendars(connectedCalendars.filter(c => c !== calendarId));
    onDisconnect?.(calendarId);
  };

  const handleSync = async (calendarId) => {
    setSyncing(calendarId);
    await new Promise(r => setTimeout(r, 2000));
    setLastSync(new Date());
    setSyncing(null);
    onSync?.(calendarId);
  };

  const isConnected = (id) => connectedCalendars.includes(id);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Calendar Sync</h3>
        <span className="text-sm text-gray-500">
          Last sync: {lastSync.toLocaleTimeString()}
        </span>
      </div>

      <div className="space-y-4">
        {calendars.map((calendar) => {
          const connected = isConnected(calendar.id);
          const isSyncing = syncing === calendar.id;
          
          return (
            <div
              key={calendar.id}
              className={`p-4 rounded-lg border-2 ${
                connected
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-${calendar.color}-100 dark:bg-${calendar.color}-900/30 flex items-center justify-center`}>
                    <calendar.icon className={`text-${calendar.color}-500 text-xl`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{calendar.name}</h4>
                    <div className="flex items-center gap-2 text-sm">
                      {connected ? (
                        <>
                          <FaCheck className="text-green-500" />
                          <span className="text-green-600">{calendar.events} events synced</span>
                        </>
                      ) : (
                        <span className="text-gray-500">Not connected</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connected && (
                    <>
                      <button
                        onClick={() => handleSync(calendar.id)}
                        disabled={isSyncing}
                        className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                      >
                        <FaSync className={isSyncing ? 'animate-spin' : ''} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700">
                        <FaCog />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => connected ? handleDisconnect(calendar.id) : handleConnect(calendar.id)}
                    disabled={isSyncing}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      connected
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {isSyncing ? 'Connecting...' : connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sync Settings */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Sync Settings</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Auto-sync every 15 minutes</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Two-way sync (push changes back)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Include declined events</span>
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


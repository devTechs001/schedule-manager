import { useState } from 'react';
import { FaLock, FaShieldAlt, FaKey, FaMobile, FaHistory, FaSignOutAlt, FaDesktop, FaExclamationTriangle } from 'react-icons/fa';

const Security = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const sessions = [
    { id: 1, device: 'Chrome on Windows', location: 'New York, US', lastActive: 'Now', current: true },
    { id: 2, device: 'Safari on iPhone', location: 'New York, US', lastActive: '2 hours ago', current: false },
    { id: 3, device: 'Firefox on Mac', location: 'Boston, US', lastActive: '3 days ago', current: false },
  ];

  const securityEvents = [
    { id: 1, event: 'Password changed', date: '2024-01-15', ip: '192.168.1.1' },
    { id: 2, event: 'Login from new device', date: '2024-01-10', ip: '192.168.1.2' },
    { id: 3, event: '2FA enabled', date: '2024-01-05', ip: '192.168.1.1' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Security Settings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your account security</p>
        </div>

        {/* Password Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <FaLock className="text-xl text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Password</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 30 days ago</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${twoFactorEnabled ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-700'} rounded-xl flex items-center justify-center`}>
                <FaShieldAlt className={`text-xl ${twoFactorEnabled ? 'text-green-500' : 'text-gray-500'}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Two-Factor Authentication</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {twoFactorEnabled ? 'Enabled - Your account is more secure' : 'Add an extra layer of security'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`px-4 py-2 rounded-lg ${
                twoFactorEnabled
                  ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {twoFactorEnabled ? 'Disable' : 'Enable'}
            </button>
          </div>
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-start space-x-3">
              <FaMobile className="text-green-500 mt-1" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">Authenticator App</p>
                <p className="text-sm text-green-600 dark:text-green-400">Using Google Authenticator</p>
              </div>
            </div>
          )}
        </div>

        {/* Active Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Active Sessions</h2>
            <button className="text-red-500 hover:text-red-600 text-sm font-medium">Sign out all</button>
          </div>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-4">
                  <FaDesktop className="text-xl text-gray-500 dark:text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">
                      {session.device}
                      {session.current && <span className="ml-2 text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded">Current</span>}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{session.location} • {session.lastActive}</p>
                  </div>
                </div>
                {!session.current && (
                  <button className="p-2 text-red-500 hover:text-red-600">
                    <FaSignOutAlt />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Security Log */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <FaHistory className="text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Security Log</h2>
          </div>
          <div className="space-y-3">
            {securityEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between py-3 border-b dark:border-gray-700 last:border-0">
                <div className="flex items-center space-x-3">
                  <FaKey className="text-gray-400" />
                  <div>
                    <p className="text-gray-800 dark:text-white">{event.event}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">IP: {event.ip}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">{event.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Security;


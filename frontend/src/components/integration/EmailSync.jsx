import React, { useState } from 'react';
import { FaEnvelope, FaGoogle, FaMicrosoft, FaSync, FaCheck, FaCog, FaFolder } from 'react-icons/fa';

const EmailSync = ({ onConnect, onDisconnect, onSync }) => {
  const [connectedAccounts, setConnectedAccounts] = useState(['gmail']);
  const [syncing, setSyncing] = useState(null);
  const [syncFolders, setSyncFolders] = useState(['inbox', 'sent']);

  const emailProviders = [
    { id: 'gmail', name: 'Gmail', icon: FaGoogle, color: 'red', emails: 234, unread: 12 },
    { id: 'outlook', name: 'Outlook', icon: FaMicrosoft, color: 'blue', emails: 0, unread: 0 },
  ];

  const folders = ['inbox', 'sent', 'drafts', 'starred', 'archive'];

  const handleConnect = async (providerId) => {
    setSyncing(providerId);
    await new Promise(r => setTimeout(r, 2000));
    setConnectedAccounts([...connectedAccounts, providerId]);
    setSyncing(null);
    onConnect?.(providerId);
  };

  const handleDisconnect = (providerId) => {
    setConnectedAccounts(connectedAccounts.filter(a => a !== providerId));
    onDisconnect?.(providerId);
  };

  const handleSync = async (providerId) => {
    setSyncing(providerId);
    await new Promise(r => setTimeout(r, 2000));
    setSyncing(null);
    onSync?.(providerId);
  };

  const toggleFolder = (folder) => {
    setSyncFolders(prev =>
      prev.includes(folder)
        ? prev.filter(f => f !== folder)
        : [...prev, folder]
    );
  };

  const isConnected = (id) => connectedAccounts.includes(id);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaEnvelope className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email Sync</h3>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {emailProviders.map((provider) => {
          const connected = isConnected(provider.id);
          const isSyncing = syncing === provider.id;
          
          return (
            <div
              key={provider.id}
              className={`p-4 rounded-lg border-2 ${
                connected
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-${provider.color}-100 dark:bg-${provider.color}-900/30 flex items-center justify-center`}>
                    <provider.icon className={`text-${provider.color}-500 text-xl`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{provider.name}</h4>
                    {connected ? (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-500">{provider.emails} emails</span>
                        {provider.unread > 0 && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">
                            {provider.unread} unread
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not connected</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connected && (
                    <>
                      <button
                        onClick={() => handleSync(provider.id)}
                        disabled={isSyncing}
                        className="p-2 text-gray-500 hover:text-primary-600"
                      >
                        <FaSync className={isSyncing ? 'animate-spin' : ''} />
                      </button>
                      <button className="p-2 text-gray-500 hover:text-gray-700">
                        <FaCog />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => connected ? handleDisconnect(provider.id) : handleConnect(provider.id)}
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

      {/* Folder Selection */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-3">
          <FaFolder className="text-gray-500" />
          <h4 className="font-medium text-gray-900 dark:text-white">Folders to Sync</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => toggleFolder(folder)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                syncFolders.includes(folder)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}
            >
              {folder}
            </button>
          ))}
        </div>
      </div>

      {/* Sync Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Sync attachments</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Extract tasks from emails</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Mark as read when processed</span>
        </label>
      </div>
    </div>
  );
};

export default EmailSync;


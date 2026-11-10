import React, { useState } from 'react';
import { FaEnvelope, FaGoogle, FaMicrosoft, FaSync, FaCheck, FaCog, FaFolder } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { connectProvider, syncProvider } from './syncConnect';

const EmailSync = ({ onConnect, onDisconnect, onSync }) => {
  // Nothing is connected until the user actually connects it. This used to
  // default to ['gmail'] and report "234 emails, 12 unread" for a mailbox
  // that had never been authorised.
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [syncFolders, setSyncFolders] = useState(['inbox', 'sent']);

  const emailProviders = [
    // No message or unread counts — those came from nowhere.
    { id: 'gmail', name: 'Gmail', icon: FaGoogle, color: 'red' },
    { id: 'outlook', name: 'Outlook', icon: FaMicrosoft, color: 'blue' },
  ];

  const folders = ['inbox', 'sent', 'drafts', 'starred', 'archive'];

  const handleConnect = (providerId) => {
    const provider = emailProviders.find(p => p.id === providerId);
    const result = connectProvider(provider.name, onConnect ? () => onConnect(providerId) : undefined);
    if (!result.ok) {
      toast(result.message);
      return;
    }
    setConnectedAccounts([...connectedAccounts, providerId]);
  };

  const handleDisconnect = (providerId) => {
    setConnectedAccounts(connectedAccounts.filter(a => a !== providerId));
    onDisconnect?.(providerId);
  };

  const handleSync = (providerId) => {
    const provider = emailProviders.find(p => p.id === providerId);
    const result = syncProvider(provider.name, onSync ? () => onSync(providerId) : undefined);
    if (!result.ok) {
      toast(result.message);
    }
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
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaEnvelope className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Email Sync</h3>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {emailProviders.map((provider) => {
          const connected = isConnected(provider.id);
          
          return (
            <div
              key={provider.id}
              className={`p-4 rounded-lg border-2 ${
                connected
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-surface-sunken flex items-center justify-center`}>
                    <provider.icon className={`text-content-muted text-xl`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-content">{provider.name}</h4>
                    {connected ? (
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <FaCheck /> Connected
                      </span>
                    ) : (
                      <span className="text-sm text-content-muted">Not connected</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connected && (
                    <>
                      <button
                        onClick={() => handleSync(provider.id)}
                        className="p-2 text-content-muted hover:text-primary-600"
                      >
                        <FaSync />
                      </button>
                      <button className="p-2 text-content-muted hover:text-content">
                        <FaCog />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => connected ? handleDisconnect(provider.id) : handleConnect(provider.id)}
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

      {/* Folder Selection */}
      <div className="p-4 bg-surface-sunken rounded-lg mb-4">
        <div className="flex items-center gap-2 mb-3">
          <FaFolder className="text-content-muted" />
          <h4 className="font-medium text-content">Folders to Sync</h4>
        </div>
        <div className="flex flex-wrap gap-2">
          {folders.map((folder) => (
            <button
              key={folder}
              onClick={() => toggleFolder(folder)}
              className={`px-3 py-1 rounded-full text-sm capitalize ${
                syncFolders.includes(folder)
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-sunken text-content'
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
          <span className="text-sm text-content">Sync attachments</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="rounded" />
          <span className="text-sm text-content">Extract tasks from emails</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="rounded" />
          <span className="text-sm text-content">Mark as read when processed</span>
        </label>
      </div>
    </div>
  );
};

export default EmailSync;


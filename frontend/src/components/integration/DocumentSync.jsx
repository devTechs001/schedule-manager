import React, { useState } from 'react';
import { FaFolder, FaSync, FaCog, FaCheck, FaCloud } from 'react-icons/fa';
import { SiGoogledrive, SiDropbox, SiOnedrive } from 'react-icons/si';
import toast from 'react-hot-toast';
import { connectProvider, syncProvider } from './syncConnect';

const DocumentSync = ({ onConnect, onDisconnect, onSync }) => {
  // Nothing is connected until the user actually connects it. This used to
  // default to ['gdrive'], so the UI reported a live integration that
  // did not exist.
  const [connectedStorages, setConnectedStorages] = useState([]);
  const [selectedFolders, setSelectedFolders] = useState(['Documents', 'Projects']);

  const storageProviders = [
    // No file counts or storage figures — those used to read "234 files,
    // 2.5 GB" for an account that had never been connected.
    { id: 'gdrive', name: 'Google Drive', icon: SiGoogledrive, color: 'yellow' },
    { id: 'dropbox', name: 'Dropbox', icon: SiDropbox, color: 'blue' },
    { id: 'onedrive', name: 'OneDrive', icon: SiOnedrive, color: 'blue' },
  ];

  const folders = ['Documents', 'Projects', 'Shared', 'Archives', 'Templates'];

  const handleConnect = (storageId) => {
    const storage = storageProviders.find(s => s.id === storageId);
    const result = connectProvider(storage.name, onConnect ? () => onConnect(storageId) : undefined);
    if (!result.ok) {
      toast(result.message);
      return;
    }
    setConnectedStorages([...connectedStorages, storageId]);
  };

  const handleDisconnect = (storageId) => {
    setConnectedStorages(connectedStorages.filter(s => s !== storageId));
    onDisconnect?.(storageId);
  };

  const handleSync = (storageId) => {
    const storage = storageProviders.find(s => s.id === storageId);
    const result = syncProvider(storage.name, onSync ? () => onSync(storageId) : undefined);
    if (!result.ok) {
      toast(result.message);
    }
  };

  const toggleFolder = (folder) => {
    setSelectedFolders(prev =>
      prev.includes(folder)
        ? prev.filter(f => f !== folder)
        : [...prev, folder]
    );
  };

  const isConnected = (id) => connectedStorages.includes(id);

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaCloud className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Document Storage Sync</h3>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {storageProviders.map((storage) => {
          const connected = isConnected(storage.id);
          
          return (
            <div
              key={storage.id}
              className={`p-4 rounded-lg border-2 ${
                connected
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-surface-sunken flex items-center justify-center`}>
                    <storage.icon className={`text-content-muted text-xl`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-content">{storage.name}</h4>
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
                        onClick={() => handleSync(storage.id)}
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
                    onClick={() => connected ? handleDisconnect(storage.id) : handleConnect(storage.id)}
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
        <div className="space-y-2">
          {folders.map((folder) => (
            <label key={folder} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFolders.includes(folder)}
                onChange={() => toggleFolder(folder)}
                className="rounded text-primary-600"
              />
              <FaFolder className="text-yellow-500" />
              <span className="text-sm text-content">{folder}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="rounded" />
          <span className="text-sm text-content">Auto-sync on file changes</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="rounded" />
          <span className="text-sm text-content">Keep local copy of files</span>
        </label>
      </div>
    </div>
  );
};

export default DocumentSync;


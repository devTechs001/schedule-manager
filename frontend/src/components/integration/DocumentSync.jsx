import React, { useState } from 'react';
import { FaFolder, FaSync, FaCog, FaCheck, FaCloud, FaFile } from 'react-icons/fa';
import { SiGoogledrive, SiDropbox, SiOnedrive } from 'react-icons/si';

const DocumentSync = ({ onConnect, onDisconnect, onSync }) => {
  const [connectedStorages, setConnectedStorages] = useState(['gdrive']);
  const [syncing, setSyncing] = useState(null);
  const [selectedFolders, setSelectedFolders] = useState(['Documents', 'Projects']);

  const storageProviders = [
    { id: 'gdrive', name: 'Google Drive', icon: SiGoogledrive, color: 'yellow', files: 234, used: '2.5 GB' },
    { id: 'dropbox', name: 'Dropbox', icon: SiDropbox, color: 'blue', files: 0, used: '0 GB' },
    { id: 'onedrive', name: 'OneDrive', icon: SiOnedrive, color: 'blue', files: 0, used: '0 GB' },
  ];

  const folders = ['Documents', 'Projects', 'Shared', 'Archives', 'Templates'];

  const handleConnect = async (storageId) => {
    setSyncing(storageId);
    await new Promise(r => setTimeout(r, 2000));
    setConnectedStorages([...connectedStorages, storageId]);
    setSyncing(null);
    onConnect?.(storageId);
  };

  const handleDisconnect = (storageId) => {
    setConnectedStorages(connectedStorages.filter(s => s !== storageId));
    onDisconnect?.(storageId);
  };

  const handleSync = async (storageId) => {
    setSyncing(storageId);
    await new Promise(r => setTimeout(r, 2000));
    setSyncing(null);
    onSync?.(storageId);
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaCloud className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Document Storage Sync</h3>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {storageProviders.map((storage) => {
          const connected = isConnected(storage.id);
          const isSyncing = syncing === storage.id;
          
          return (
            <div
              key={storage.id}
              className={`p-4 rounded-lg border-2 ${
                connected
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-${storage.color}-100 dark:bg-${storage.color}-900/30 flex items-center justify-center`}>
                    <storage.icon className={`text-${storage.color}-600 text-xl`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{storage.name}</h4>
                    {connected ? (
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaFile className="text-xs" /> {storage.files} files
                        </span>
                        <span>•</span>
                        <span>{storage.used} synced</span>
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
                        onClick={() => handleSync(storage.id)}
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
                    onClick={() => connected ? handleDisconnect(storage.id) : handleConnect(storage.id)}
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
              <span className="text-sm text-gray-700 dark:text-gray-300">{folder}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input type="checkbox" defaultChecked className="rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Auto-sync on file changes</span>
        </label>
        <label className="flex items-center gap-3">
          <input type="checkbox" className="rounded" />
          <span className="text-sm text-gray-700 dark:text-gray-300">Keep local copy of files</span>
        </label>
      </div>
    </div>
  );
};

export default DocumentSync;


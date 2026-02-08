import React, { useState } from 'react';
import { FaProjectDiagram, FaSync, FaCog, FaCheck, FaLink, FaUnlink } from 'react-icons/fa';
import { SiAsana, SiJira, SiTrello, SiNotion } from 'react-icons/si';

const ProjectSync = ({ onConnect, onDisconnect, onSync }) => {
  const [connectedTools, setConnectedTools] = useState(['asana']);
  const [syncing, setSyncing] = useState(null);

  const projectTools = [
    { id: 'asana', name: 'Asana', icon: SiAsana, color: 'pink', projects: 5, tasks: 127 },
    { id: 'jira', name: 'Jira', icon: SiJira, color: 'blue', projects: 0, tasks: 0 },
    { id: 'trello', name: 'Trello', icon: SiTrello, color: 'blue', projects: 0, tasks: 0 },
    { id: 'notion', name: 'Notion', icon: SiNotion, color: 'gray', projects: 0, tasks: 0 },
  ];

  const handleConnect = async (toolId) => {
    setSyncing(toolId);
    await new Promise(r => setTimeout(r, 2000));
    setConnectedTools([...connectedTools, toolId]);
    setSyncing(null);
    onConnect?.(toolId);
  };

  const handleDisconnect = (toolId) => {
    setConnectedTools(connectedTools.filter(t => t !== toolId));
    onDisconnect?.(toolId);
  };

  const handleSync = async (toolId) => {
    setSyncing(toolId);
    await new Promise(r => setTimeout(r, 2000));
    setSyncing(null);
    onSync?.(toolId);
  };

  const isConnected = (id) => connectedTools.includes(id);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaProjectDiagram className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Project Management Sync</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {projectTools.map((tool) => {
          const connected = isConnected(tool.id);
          const isSyncing = syncing === tool.id;
          
          return (
            <div
              key={tool.id}
              className={`p-4 rounded-lg border-2 ${
                connected
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${tool.color}-100 dark:bg-${tool.color}-900/30 flex items-center justify-center`}>
                  <tool.icon className={`text-${tool.color}-500 text-lg`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">{tool.name}</h4>
                  {connected && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <FaCheck /> Connected
                    </span>
                  )}
                </div>
              </div>

              {connected && (
                <div className="flex gap-4 text-sm text-gray-500 mb-3">
                  <span>{tool.projects} projects</span>
                  <span>{tool.tasks} tasks</span>
                </div>
              )}

              <div className="flex gap-2">
                {connected ? (
                  <>
                    <button
                      onClick={() => handleSync(tool.id)}
                      disabled={isSyncing}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-sm"
                    >
                      <FaSync className={isSyncing ? 'animate-spin' : ''} />
                      {isSyncing ? 'Syncing...' : 'Sync'}
                    </button>
                    <button
                      onClick={() => handleDisconnect(tool.id)}
                      className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <FaUnlink />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleConnect(tool.id)}
                    disabled={isSyncing}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
                  >
                    <FaLink />
                    {isSyncing ? 'Connecting...' : 'Connect'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Import Options */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Import Options</h4>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Import project structure</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Import task assignments</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Import completed tasks</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="rounded" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Sync due dates & priorities</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default ProjectSync;


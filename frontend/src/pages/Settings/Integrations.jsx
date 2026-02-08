import { useState } from 'react';
import { FaGoogle, FaMicrosoft, FaSlack, FaGithub, FaTrello, FaDropbox, FaCheck, FaPlus, FaCog, FaSync, FaTrash } from 'react-icons/fa';

const Integrations = () => {
  const [integrations, setIntegrations] = useState([
    { id: 'google', name: 'Google Calendar', icon: FaGoogle, connected: true, lastSync: '2 min ago', color: 'red' },
    { id: 'microsoft', name: 'Microsoft 365', icon: FaMicrosoft, connected: true, lastSync: '5 min ago', color: 'blue' },
    { id: 'slack', name: 'Slack', icon: FaSlack, connected: false, lastSync: null, color: 'purple' },
    { id: 'github', name: 'GitHub', icon: FaGithub, connected: false, lastSync: null, color: 'gray' },
    { id: 'trello', name: 'Trello', icon: FaTrello, connected: true, lastSync: '1 hour ago', color: 'blue' },
    { id: 'dropbox', name: 'Dropbox', icon: FaDropbox, connected: false, lastSync: null, color: 'blue' },
  ]);

  const [syncing, setSyncing] = useState(null);

  const handleConnect = async (id) => {
    // Simulate OAuth flow
    await new Promise(r => setTimeout(r, 1500));
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, connected: true, lastSync: 'Just now' } : i
    ));
  };

  const handleDisconnect = (id) => {
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, connected: false, lastSync: null } : i
    ));
  };

  const handleSync = async (id) => {
    setSyncing(id);
    await new Promise(r => setTimeout(r, 2000));
    setIntegrations(prev => prev.map(i => 
      i.id === id ? { ...i, lastSync: 'Just now' } : i
    ));
    setSyncing(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Integrations</h1>
          <p className="text-gray-500 dark:text-gray-400">Connect your favorite apps and services</p>
        </div>

        {/* Connected Integrations */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Connected</h2>
          <div className="space-y-4">
            {integrations.filter(i => i.connected).map((integration) => (
              <div key={integration.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-${integration.color}-100 dark:bg-${integration.color}-900/30 rounded-xl flex items-center justify-center`}>
                    <integration.icon className={`text-xl text-${integration.color}-500`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{integration.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      <FaCheck className="inline text-green-500 mr-1" />
                      Connected • Last sync: {integration.lastSync}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSync(integration.id)}
                    disabled={syncing === integration.id}
                    className="p-2 text-gray-500 hover:text-blue-500 disabled:opacity-50"
                  >
                    <FaSync className={syncing === integration.id ? 'animate-spin' : ''} />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    <FaCog />
                  </button>
                  <button
                    onClick={() => handleDisconnect(integration.id)}
                    className="p-2 text-gray-500 hover:text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Integrations */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Available</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.filter(i => !i.connected).map((integration) => (
              <div key={integration.id} className="bg-white dark:bg-gray-800 rounded-xl p-4">
                <div className="flex items-center space-x-4 mb-4">
                  <div className={`w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center`}>
                    <integration.icon className="text-xl text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-white">{integration.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Not connected</p>
                  </div>
                </div>
                <button
                  onClick={() => handleConnect(integration.id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  <FaPlus className="mr-2" /> Connect
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;


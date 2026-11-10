import React, { useState } from 'react';
import { FaUsers, FaSync, FaCheck, FaCog, FaLink, FaUnlink } from 'react-icons/fa';
import { SiSalesforce, SiHubspot } from 'react-icons/si';

const CRMSync = ({ onConnect, onDisconnect, onSync }) => {
  const [connectedCRMs, setConnectedCRMs] = useState([]);
  const [syncing, setSyncing] = useState(null);
  const [mappings, setMappings] = useState({
    contacts: true,
    deals: true,
    companies: false,
    activities: true,
  });

  const crmProviders = [
    { id: 'salesforce', name: 'Salesforce', icon: SiSalesforce, color: 'blue', contacts: 0, deals: 0 },
    { id: 'hubspot', name: 'HubSpot', icon: SiHubspot, color: 'orange', contacts: 0, deals: 0 },
  ];

  const handleConnect = async (crmId) => {
    setSyncing(crmId);
    await new Promise(r => setTimeout(r, 2000));
    setConnectedCRMs([...connectedCRMs, crmId]);
    setSyncing(null);
    onConnect?.(crmId);
  };

  const handleDisconnect = (crmId) => {
    setConnectedCRMs(connectedCRMs.filter(c => c !== crmId));
    onDisconnect?.(crmId);
  };

  const handleSync = async (crmId) => {
    setSyncing(crmId);
    await new Promise(r => setTimeout(r, 3000));
    setSyncing(null);
    onSync?.(crmId);
  };

  const isConnected = (id) => connectedCRMs.includes(id);

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaUsers className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">CRM Integration</h3>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {crmProviders.map((crm) => {
          const connected = isConnected(crm.id);
          const isSyncing = syncing === crm.id;
          
          return (
            <div
              key={crm.id}
              className={`p-4 rounded-lg border-2 ${
                connected
                  ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-line'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-surface-sunken flex items-center justify-center`}>
                    <crm.icon className={`text-content-muted text-xl`} />
                  </div>
                  <div>
                    <h4 className="font-medium text-content">{crm.name}</h4>
                    {connected ? (
                      <div className="flex items-center gap-3 text-sm text-content-muted">
                        <span>{crm.contacts || 156} contacts</span>
                        <span>•</span>
                        <span>{crm.deals || 23} deals</span>
                      </div>
                    ) : (
                      <span className="text-sm text-content-muted">Connect to sync contacts & deals</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {connected && (
                    <>
                      <button
                        onClick={() => handleSync(crm.id)}
                        disabled={isSyncing}
                        className="p-2 text-content-muted hover:text-primary-600"
                      >
                        <FaSync className={isSyncing ? 'animate-spin' : ''} />
                      </button>
                      <button className="p-2 text-content-muted hover:text-content">
                        <FaCog />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => connected ? handleDisconnect(crm.id) : handleConnect(crm.id)}
                    disabled={isSyncing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                      connected
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {connected ? <FaUnlink /> : <FaLink />}
                    {isSyncing ? 'Connecting...' : connected ? 'Disconnect' : 'Connect'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Field Mappings */}
      <div className="p-4 bg-surface-sunken rounded-lg mb-4">
        <h4 className="font-medium text-content mb-3">Data to Sync</h4>
        <div className="space-y-3">
          {Object.entries(mappings).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between">
              <span className="text-sm text-content capitalize">{key}</span>
              <button
                onClick={() => setMappings(prev => ({ ...prev, [key]: !prev[key] }))}
                className={`w-10 h-6 rounded-full transition-colors ${
                  value ? 'bg-primary-600' : 'bg-surface-sunken'
                }`}
              >
                <div className={`w-4 h-4 bg-surface rounded-full shadow transform transition-transform ${
                  value ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </button>
            </label>
          ))}
        </div>
      </div>

      {/* Sync Direction */}
      <div className="p-4 border border-line rounded-lg">
        <h4 className="font-medium text-content mb-3">Sync Direction</h4>
        <div className="space-y-2">
          <label className="flex items-center gap-3">
            <input type="radio" name="direction" defaultChecked className="text-primary-600" />
            <span className="text-sm text-content">Two-way sync</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="radio" name="direction" className="text-primary-600" />
            <span className="text-sm text-content">Import only (CRM → App)</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="radio" name="direction" className="text-primary-600" />
            <span className="text-sm text-content">Export only (App → CRM)</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CRMSync;


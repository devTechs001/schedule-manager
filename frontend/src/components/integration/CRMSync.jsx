import React, { useState } from 'react';
import { FaUsers, FaSync, FaCheck, FaCog, FaLink, FaUnlink } from 'react-icons/fa';
import { SiSalesforce, SiHubspot } from 'react-icons/si';
import toast from 'react-hot-toast';
import { connectProvider, syncProvider } from './syncConnect';

const CRMSync = ({ onConnect, onDisconnect, onSync }) => {
  const [connectedCRMs, setConnectedCRMs] = useState([]);
  const [mappings, setMappings] = useState({
    contacts: true,
    deals: true,
    companies: false,
    activities: true,
  });

  const crmProviders = [
    // No contact/deal counts. The render below used to fall back to
    // `crm.contacts || 156`, which printed "156 contacts • 23 deals" for an
    // account with nothing in it — and even for a genuinely empty CRM.
    { id: 'salesforce', name: 'Salesforce', icon: SiSalesforce, color: 'blue' },
    { id: 'hubspot', name: 'HubSpot', icon: SiHubspot, color: 'orange' },
  ];

  const handleConnect = (crmId) => {
    const crm = crmProviders.find(c => c.id === crmId);
    const result = connectProvider(crm.name, onConnect ? () => onConnect(crmId) : undefined);
    if (!result.ok) {
      toast(result.message);
      return;
    }
    setConnectedCRMs([...connectedCRMs, crmId]);
  };

  const handleDisconnect = (crmId) => {
    setConnectedCRMs(connectedCRMs.filter(c => c !== crmId));
    onDisconnect?.(crmId);
  };

  const handleSync = (crmId) => {
    const crm = crmProviders.find(c => c.id === crmId);
    const result = syncProvider(crm.name, onSync ? () => onSync(crmId) : undefined);
    if (!result.ok) {
      toast(result.message);
    }
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
                      <span className="flex items-center gap-1 text-sm text-green-600">
                        <FaCheck /> Connected
                      </span>
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
                    onClick={() => connected ? handleDisconnect(crm.id) : handleConnect(crm.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                      connected
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {connected ? <FaUnlink /> : <FaLink />}
                    {connected ? 'Disconnect' : 'Connect'}
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


import React, { useState } from 'react';
import { FaPlug, FaPlus, FaTrash, FaPlay, FaPause, FaCheck, FaExclamationTriangle, FaCopy } from 'react-icons/fa';

const WebhookManager = ({ webhooks: initialWebhooks = [], onCreate, onDelete, onToggle }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ name: '', url: '', events: [] });


  const [webhooks, setWebhooks] = useState(initialWebhooks);

  const availableEvents = [
    'task.created', 'task.updated', 'task.completed', 'task.deleted', 'task.assigned',
    'event.created', 'event.updated', 'event.deleted',
    'contact.created', 'contact.updated',
  ];

  const handleToggle = (id) => {
    setWebhooks(webhooks.map(w =>
      w.id === id ? { ...w, active: !w.active } : w
    ));
    onToggle?.(id);
  };

  const handleDelete = (id) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
    onDelete?.(id);
  };

  const handleCreate = () => {
    if (!newWebhook.name || !newWebhook.url) return;
    const webhook = {
      ...newWebhook,
      id: Date.now(),
      active: true,
      lastTriggered: null,
      successRate: 100,
    };
    setWebhooks([...webhooks, webhook]);
    setNewWebhook({ name: '', url: '', events: [] });
    setShowCreate(false);
    onCreate?.(webhook);
  };

  const toggleEvent = (event) => {
    setNewWebhook(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaPlug className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Webhook Manager</h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
        >
          <FaPlus /> New Webhook
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="mb-6 p-4 border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-lg">
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Webhook name"
              value={newWebhook.name}
              onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-surface-sunken border-line"
            />
            <input
              type="url"
              placeholder="Webhook URL (https://...)"
              value={newWebhook.url}
              onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg bg-surface-sunken border-line"
            />
            <div>
              <p className="text-sm font-medium text-content mb-2">Events</p>
              <div className="flex flex-wrap gap-2">
                {availableEvents.map((event) => (
                  <button
                    key={event}
                    onClick={() => toggleEvent(event)}
                    className={`px-3 py-1 rounded-full text-xs ${
                      newWebhook.events.includes(event)
                        ? 'bg-primary-600 text-white'
                        : 'bg-surface-sunken text-content'
                    }`}
                  >
                    {event}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleCreate}
              disabled={!newWebhook.name || !newWebhook.url}
              className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
            >
              Create Webhook
            </button>
          </div>
        </div>
      )}

      {/* Webhooks List */}
      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className={`p-4 rounded-lg border-2 ${
              webhook.active
                ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                : 'border-line'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-content">{webhook.name}</h4>
                  {webhook.active ? (
                    <span className="flex items-center gap-1 text-xs text-green-600">
                      <FaCheck /> Active
                    </span>
                  ) : (
                    <span className="text-xs text-content-muted">Paused</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-xs bg-surface-sunken px-2 py-1 rounded truncate max-w-xs">
                    {webhook.url}
                  </code>
                  <button className="text-content-subtle hover:text-content-muted">
                    <FaCopy className="text-xs" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(webhook.id)}
                  className={`p-2 rounded-lg ${
                    webhook.active ? 'text-green-600 hover:bg-green-100' : 'text-content-subtle hover:bg-surface-sunken'
                  }`}
                >
                  {webhook.active ? <FaPause /> : <FaPlay />}
                </button>
                <button
                  onClick={() => handleDelete(webhook.id)}
                  className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {webhook.events.map((event) => (
                <span key={event} className="px-2 py-0.5 bg-surface-sunken text-content-muted text-xs rounded">
                  {event}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-content-muted">
              <span>Success rate: {webhook.successRate}%</span>
              {webhook.lastTriggered && (
                <span>Last triggered: {new Date(webhook.lastTriggered).toLocaleString()}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WebhookManager;


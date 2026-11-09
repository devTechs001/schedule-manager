import React, { useState } from 'react';
import { FaHistory, FaFilter, FaSearch, FaUser, FaEdit, FaTrash, FaPlus, FaSignInAlt, FaKey, FaDownload } from 'react-icons/fa';

const AuditLogs = ({ logs: initialLogs = [], onExport }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('7d');


  const logs = initialLogs;

  const getActionIcon = (action) => {
    switch (action) {
      case 'login': return FaSignInAlt;
      case 'create': return FaPlus;
      case 'update': return FaEdit;
      case 'delete': return FaTrash;
      case 'permission': return FaKey;
      default: return FaHistory;
    }
  };

  const getActionColor = (action, status) => {
    if (status === 'failed') return 'red';
    switch (action) {
      case 'login': return 'blue';
      case 'create': return 'green';
      case 'update': return 'yellow';
      case 'delete': return 'red';
      case 'permission': return 'purple';
      default: return 'gray';
    }
  };

  const formatTime = (date) => {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.action !== filter) return false;
    if (searchQuery && !log.user.includes(searchQuery) && !log.target?.includes(searchQuery)) return false;
    return true;
  });

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaHistory className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Audit Logs</h3>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-surface-sunken hover:bg-surface-sunken text-content rounded-lg text-sm"
        >
          <FaDownload /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-content-subtle" />
            <input
              type="text"
              placeholder="Search by user or target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg bg-surface-sunken border-line"
            />
          </div>
        </div>
        <div className="flex gap-1">
          {['all', 'login', 'create', 'update', 'delete', 'permission'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm capitalize ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-sunken text-content-muted'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg bg-surface-sunken border-line"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="all">All time</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-content-muted border-b border-line">
              <th className="pb-3 font-medium">Action</th>
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Target</th>
              <th className="pb-3 font-medium">IP Address</th>
              <th className="pb-3 font-medium">Time</th>
              <th className="pb-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {filteredLogs.map((log) => {
              const ActionIcon = getActionIcon(log.action);
              const color = getActionColor(log.action, log.status);
              return (
                <tr key={log.id} className="border-b border-line">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
                        <ActionIcon className={`text-${color}-600 text-xs`} />
                      </div>
                      <span className="capitalize text-content">{log.action}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-content-subtle" />
                      <span className="text-content">{log.user}</span>
                    </div>
                  </td>
                  <td className="py-3 text-content-muted">{log.target || '-'}</td>
                  <td className="py-3">
                    <code className="text-xs bg-surface-sunken px-2 py-1 rounded">
                      {log.ip}
                    </code>
                  </td>
                  <td className="py-3 text-content-muted">{formatTime(log.time)}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      log.status === 'success'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-8 text-content-muted">No logs found matching your criteria</div>
      )}
    </div>
  );
};

export default AuditLogs;


import React, { useState } from 'react';
import { FaHistory, FaFilter, FaSearch, FaUser, FaEdit, FaTrash, FaPlus, FaSignInAlt, FaKey, FaDownload } from 'react-icons/fa';

const AuditLogs = ({ logs: initialLogs = [], onExport }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('7d');

  const defaultLogs = [
    { id: 1, action: 'login', user: 'john@example.com', target: null, ip: '192.168.1.1', time: new Date(Date.now() - 300000), status: 'success' },
    { id: 2, action: 'create', user: 'sarah@example.com', target: 'Task: Q1 Report', ip: '192.168.1.2', time: new Date(Date.now() - 600000), status: 'success' },
    { id: 3, action: 'update', user: 'mike@example.com', target: 'Event: Team Meeting', ip: '192.168.1.3', time: new Date(Date.now() - 1800000), status: 'success' },
    { id: 4, action: 'delete', user: 'john@example.com', target: 'Contact: Old Vendor', ip: '192.168.1.1', time: new Date(Date.now() - 3600000), status: 'success' },
    { id: 5, action: 'login', user: 'unknown@hacker.com', target: null, ip: '45.33.32.156', time: new Date(Date.now() - 7200000), status: 'failed' },
    { id: 6, action: 'permission', user: 'admin@example.com', target: 'Role: Manager', ip: '192.168.1.10', time: new Date(Date.now() - 14400000), status: 'success' },
  ];

  const logs = initialLogs.length > 0 ? initialLogs : defaultLogs;

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaHistory className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Logs</h3>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
        >
          <FaDownload /> Export
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user or target..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
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
            <tr className="text-left text-sm text-gray-500 border-b border-gray-200 dark:border-gray-700">
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
                <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}>
                        <ActionIcon className={`text-${color}-600 text-xs`} />
                      </div>
                      <span className="capitalize text-gray-900 dark:text-white">{log.action}</span>
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">{log.user}</span>
                    </div>
                  </td>
                  <td className="py-3 text-gray-500">{log.target || '-'}</td>
                  <td className="py-3">
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                      {log.ip}
                    </code>
                  </td>
                  <td className="py-3 text-gray-500">{formatTime(log.time)}</td>
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
        <div className="text-center py-8 text-gray-500">No logs found matching your criteria</div>
      )}
    </div>
  );
};

export default AuditLogs;


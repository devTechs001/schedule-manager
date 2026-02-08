import React from 'react';
import { FaChartPie, FaEnvelope, FaPhone, FaCalendar, FaUserFriends, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const ContactAnalytics = ({ contact, interactions = [] }) => {
  const stats = {
    totalInteractions: interactions.length,
    emailsSent: interactions.filter(i => i.type === 'email').length,
    callsMade: interactions.filter(i => i.type === 'call').length,
    meetingsHeld: interactions.filter(i => i.type === 'meeting').length,
    lastContact: interactions.length > 0 ? interactions[0].date : null,
    responseRate: 75,
    avgResponseTime: '2.5 hours',
  };

  const interactionTypes = [
    { type: 'email', icon: FaEnvelope, color: 'blue', count: stats.emailsSent },
    { type: 'call', icon: FaPhone, color: 'green', count: stats.callsMade },
    { type: 'meeting', icon: FaCalendar, color: 'purple', count: stats.meetingsHeld },
  ];

  const getTimeAgo = (date) => {
    if (!date) return 'Never';
    const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaChartPie className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Analytics</h3>
        </div>
      </div>

      {contact && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-medium">
            {contact.name?.[0] || 'C'}
          </div>
          <div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{contact.name}</h4>
            <p className="text-gray-500">{contact.company || contact.email}</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {interactionTypes.map((item) => (
          <div key={item.type} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <item.icon className={`mx-auto text-${item.color}-500 text-xl mb-2`} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{item.count}</p>
            <p className="text-sm text-gray-500 capitalize">{item.type}s</p>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-gray-600 dark:text-gray-400">Last Contact</span>
          <span className="font-medium text-gray-900 dark:text-white">{getTimeAgo(stats.lastContact)}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-gray-600 dark:text-gray-400">Response Rate</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 dark:text-white">{stats.responseRate}%</span>
            <FaArrowUp className="text-green-500 text-sm" />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-gray-600 dark:text-gray-400">Avg Response Time</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats.avgResponseTime}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <span className="text-gray-600 dark:text-gray-400">Total Interactions</span>
          <span className="font-medium text-gray-900 dark:text-white">{stats.totalInteractions}</span>
        </div>
      </div>

      {/* Interaction Timeline */}
      <div>
        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Recent Activity</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {interactions.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No interactions recorded</p>
          ) : (
            interactions.slice(0, 5).map((interaction, i) => {
              const typeInfo = interactionTypes.find(t => t.type === interaction.type);
              return (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                  <div className={`p-2 rounded-lg bg-${typeInfo?.color || 'gray'}-100 dark:bg-${typeInfo?.color || 'gray'}-900/30`}>
                    {typeInfo?.icon ? <typeInfo.icon className={`text-${typeInfo.color}-500`} /> : null}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900 dark:text-white">{interaction.subject || interaction.type}</p>
                    <p className="text-xs text-gray-500">{getTimeAgo(interaction.date)}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Health Score */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Relationship Health</p>
            <p className="text-3xl font-bold">Good</p>
          </div>
          <FaUserFriends className="text-4xl opacity-80" />
        </div>
        <p className="text-sm mt-2 opacity-80">Regular engagement. Consider scheduling a catch-up call.</p>
      </div>
    </div>
  );
};

export default ContactAnalytics;


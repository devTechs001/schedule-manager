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
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaChartPie className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Contact Analytics</h3>
        </div>
      </div>

      {contact && (
        <div className="flex items-center gap-4 mb-6 p-4 bg-surface-sunken rounded-lg">
          <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-medium">
            {contact.name?.[0] || 'C'}
          </div>
          <div>
            <h4 className="text-lg font-medium text-content">{contact.name}</h4>
            <p className="text-content-muted">{contact.company || contact.email}</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {interactionTypes.map((item) => (
          <div key={item.type} className="p-4 bg-surface-sunken rounded-lg text-center">
            <item.icon className={`mx-auto text-content-muted text-xl mb-2`} />
            <p className="text-2xl font-bold text-content">{item.count}</p>
            <p className="text-sm text-content-muted capitalize">{item.type}s</p>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between p-3 bg-surface-sunken rounded-lg">
          <span className="text-content-muted">Last Contact</span>
          <span className="font-medium text-content">{getTimeAgo(stats.lastContact)}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-surface-sunken rounded-lg">
          <span className="text-content-muted">Response Rate</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-content">{stats.responseRate}%</span>
            <FaArrowUp className="text-green-500 text-sm" />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-surface-sunken rounded-lg">
          <span className="text-content-muted">Avg Response Time</span>
          <span className="font-medium text-content">{stats.avgResponseTime}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-surface-sunken rounded-lg">
          <span className="text-content-muted">Total Interactions</span>
          <span className="font-medium text-content">{stats.totalInteractions}</span>
        </div>
      </div>

      {/* Interaction Timeline */}
      <div>
        <h4 className="font-medium text-content mb-3">Recent Activity</h4>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {interactions.length === 0 ? (
            <p className="text-center text-content-muted py-4">No interactions recorded</p>
          ) : (
            interactions.slice(0, 5).map((interaction, i) => {
              const typeInfo = interactionTypes.find(t => t.type === interaction.type);
              return (
                <div key={i} className="flex items-center gap-3 p-2 hover:bg-surface-sunken rounded">
                  <div className={`p-2 rounded-lg bg-surface-sunken`}>
                    {typeInfo?.icon ? <typeInfo.icon className={`text-content-muted`} /> : null}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-content">{interaction.subject || interaction.type}</p>
                    <p className="text-xs text-content-muted">{getTimeAgo(interaction.date)}</p>
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


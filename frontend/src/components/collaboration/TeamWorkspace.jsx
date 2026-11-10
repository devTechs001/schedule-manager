import React, { useState } from 'react';
import { FaUsers, FaPlus, FaCog, FaUserPlus, FaFolder, FaTasks, FaComments } from 'react-icons/fa';

const TeamWorkspace = ({ workspace, members = [], onInvite, onCreateTask }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const handleInvite = () => {
    if (inviteEmail.trim()) {
      onInvite?.(inviteEmail);
      setInviteEmail('');
      setShowInvite(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaFolder },
    { id: 'tasks', label: 'Tasks', icon: FaTasks },
    { id: 'discussions', label: 'Discussions', icon: FaComments },
    { id: 'members', label: 'Members', icon: FaUsers },
  ];

  return (
    <div className="bg-surface rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-line">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-500 rounded-lg flex items-center justify-center">
              <FaUsers className="text-white text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-content">
                {workspace?.name || 'Team Workspace'}
              </h2>
              <p className="text-sm text-content-muted">
                {members.length} members
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
            >
              <FaUserPlus /> Invite
            </button>
            <button className="p-2 text-content-muted hover:text-content dark:text-content-subtle">
              <FaCog />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-content-muted hover:text-content dark:text-content-subtle'
            }`}
          >
            <tab.icon /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">12</p>
              <p className="text-sm text-content-muted">Active Tasks</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-2xl font-bold text-green-600">8</p>
              <p className="text-sm text-content-muted">Completed</p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{members.length}</p>
              <p className="text-sm text-content-muted">Team Members</p>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-3">
            {members.map((member, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-surface-sunken rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white font-medium">
                    {member.name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-content">{member.name}</p>
                    <p className="text-sm text-content-muted">{member.email}</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-surface-sunken rounded text-sm capitalize">
                  {member.role || 'member'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-surface rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-content mb-4">Invite Team Member</h3>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="w-full px-3 py-2 border border-line rounded-lg bg-white bg-surface-sunken text-content mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowInvite(false)}
                className="px-4 py-2 text-content-muted hover:text-content"
              >Cancel</button>
              <button
                onClick={handleInvite}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
              >Send Invite</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamWorkspace;


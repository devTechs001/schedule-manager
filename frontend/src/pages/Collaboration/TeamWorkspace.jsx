import { useState } from 'react';
import { FaUsers, FaTasks, FaCalendarAlt, FaComments, FaPlus, FaCog, FaSearch } from 'react-icons/fa';

const TeamWorkspace = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');

  const team = {
    id: 'team-1',
    name: 'Product Team',
    members: [
      { id: 1, name: 'John Doe', role: 'Team Lead', avatar: null, status: 'online' },
      { id: 2, name: 'Jane Smith', role: 'Developer', avatar: null, status: 'online' },
      { id: 3, name: 'Bob Johnson', role: 'Designer', avatar: null, status: 'away' },
      { id: 4, name: 'Alice Brown', role: 'Developer', avatar: null, status: 'offline' },
    ],
    tasks: [
      { id: 1, title: 'Design new dashboard', assignee: 'Bob Johnson', status: 'in-progress', priority: 'high' },
      { id: 2, title: 'Implement API endpoints', assignee: 'Jane Smith', status: 'todo', priority: 'medium' },
      { id: 3, title: 'Review pull requests', assignee: 'John Doe', status: 'done', priority: 'low' },
    ],
    upcomingMeetings: [
      { id: 1, title: 'Sprint Planning', time: '10:00 AM', attendees: 4 },
      { id: 2, title: 'Design Review', time: '2:00 PM', attendees: 3 },
    ],
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaUsers },
    { id: 'tasks', label: 'Tasks', icon: FaTasks },
    { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
    { id: 'discussions', label: 'Discussions', icon: FaComments },
  ];

  const getStatusColor = (status) => {
    const colors = { online: 'bg-green-500', away: 'bg-yellow-500', offline: 'bg-gray-400' };
    return colors[status] || 'bg-gray-400';
  };

  const getPriorityColor = (priority) => {
    const colors = { high: 'text-red-500', medium: 'text-yellow-500', low: 'text-green-500' };
    return colors[priority] || 'text-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{team.name}</h1>
              <p className="text-gray-500 dark:text-gray-400">{team.members.length} members</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <FaCog />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-4 mt-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Team Members */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Team Members</h2>
                <button className="text-blue-500 hover:text-blue-600"><FaPlus /></button>
              </div>
              <div className="space-y-3">
                {team.members.map((member) => (
                  <div key={member.id} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="relative">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <div className={`absolute bottom-0 right-0 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-white dark:border-gray-700`} />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-800 dark:text-white">{member.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Active Tasks</h2>
                <button className="text-blue-500 hover:text-blue-600"><FaPlus /></button>
              </div>
              <div className="space-y-3">
                {team.tasks.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-800 dark:text-white">{task.title}</p>
                      <span className={`text-sm ${getPriorityColor(task.priority)}`}>●</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.assignee}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Today's Meetings</h2>
                <button className="text-blue-500 hover:text-blue-600"><FaPlus /></button>
              </div>
              <div className="space-y-3">
                {team.upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="font-medium text-gray-800 dark:text-white">{meeting.title}</p>
                    <div className="flex items-center justify-between mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span>{meeting.time}</span>
                      <span>{meeting.attendees} attendees</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">All Tasks</h2>
            <p className="text-gray-500 dark:text-gray-400">Task board coming soon...</p>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Team Calendar</h2>
            <p className="text-gray-500 dark:text-gray-400">Shared calendar coming soon...</p>
          </div>
        )}

        {activeTab === 'discussions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Team Discussions</h2>
            <p className="text-gray-500 dark:text-gray-400">Discussion threads coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamWorkspace;


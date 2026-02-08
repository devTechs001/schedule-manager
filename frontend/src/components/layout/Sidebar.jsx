import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaTasks,
  FaEnvelope,
  FaUsers,
  FaCalendar,
  FaChartLine,
  FaRobot,
  FaCog,
  FaComments,
  FaChevronDown,
  FaChevronUp,
  FaSlidersH,
  FaBell,
  FaShieldAlt,
  FaUniversalAccess,
  FaProjectDiagram,
  FaVideo,
  FaStar,
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const [expandedSections, setExpandedSections] = useState({
    settings: false,
    collaboration: false,
    ai: false,
    analytics: false,
    gamification: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const linkClass = ({ isActive }) => `
    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
    ${isActive
      ? 'bg-primary-600 text-white shadow-md'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }
  `;

  const subLinkClass = ({ isActive }) => `
    flex items-center space-x-3 px-8 py-2 rounded-lg ml-6 transition-all duration-200
    ${isActive
      ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
    }
  `;

  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/tasks', icon: FaTasks, label: 'Tasks' },
    { path: '/emails', icon: FaEnvelope, label: 'Emails' },
    { path: '/contacts', icon: FaUsers, label: 'Contacts' },
    { path: '/schedule', icon: FaCalendar, label: 'Schedule' },
    {
      label: 'AI Tools',
      icon: FaRobot,
      expanded: expandedSections.ai,
      toggle: () => toggleSection('ai'),
      children: [
        { path: '/ai-insights', label: 'AI Insights' },
        { path: '/ai-chat', label: 'AI Chat' },
        { path: '/predictive-scheduler', label: 'Predictive Scheduler' },
        { path: '/meeting-assistant', label: 'Meeting Assistant' },
      ]
    },
    {
      label: 'Collaboration',
      icon: FaComments,
      expanded: expandedSections.collaboration,
      toggle: () => toggleSection('collaboration'),
      children: [
        { path: '/collaboration', label: 'Workspace' },
        { path: '/collaboration/projects', label: 'Projects' },
        { path: '/collaboration/meetings', label: 'Meetings' },
      ]
    },
    {
      label: 'Analytics',
      icon: FaChartLine,
      expanded: expandedSections.analytics,
      toggle: () => toggleSection('analytics'),
      children: [
        { path: '/analytics', label: 'Overview' },
        { path: '/analytics/performance', label: 'Performance' },
        { path: '/analytics/time-tracking', label: 'Time Tracking' },
        { path: '/analytics/productivity', label: 'Productivity' },
      ]
    },
    {
      label: 'Gamification',
      icon: FaStar,
      expanded: expandedSections.gamification,
      toggle: () => toggleSection('gamification'),
      children: [
        { path: '/leaderboard', label: 'Leaderboard' },
        { path: '/achievements', label: 'Achievements' },
        { path: '/challenges', label: 'Challenges' },
        { path: '/rewards', label: 'Rewards' },
      ]
    },
    {
      label: 'Settings',
      icon: FaCog,
      expanded: expandedSections.settings,
      toggle: () => toggleSection('settings'),
      children: [
        { path: '/settings', label: 'General' },
        { path: '/settings/integrations', label: 'Integrations' },
        { path: '/settings/notifications', label: 'Notifications' },
        { path: '/settings/security', label: 'Security' },
        { path: '/settings/accessibility', label: 'Accessibility' },
      ]
    },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          w-64 bg-white dark:bg-gray-800
          border-r border-gray-200 dark:border-gray-700
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-full flex flex-col">
          {/* Logo - Mobile */}
          <div className="lg:hidden p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">AI</span>
              </div>
              <span className="text-xl font-bold text-gradient">AI Scheduler</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item, index) => (
              item.children ? (
                // Collapsible section
                <div key={index} className="mb-1">
                  <button
                    onClick={item.toggle}
                    className={`
                      w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200
                      ${expandedSections[item.label.toLowerCase()]
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon size={20} />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.expanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                  </button>

                  {/* Sub-menu items */}
                  {item.expanded && (
                    <div className="mt-1 space-y-1">
                      {item.children.map((child, childIndex) => (
                        <NavLink
                          key={childIndex}
                          to={child.path}
                          className={subLinkClass}
                          onClick={() => window.innerWidth < 1024 && onClose()}
                        >
                          <span className="ml-4">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Regular link
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={linkClass}
                  onClick={() => window.innerWidth < 1024 && onClose()}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              )
            ))}
          </nav>

          {/* AI Assistant Quick Access */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-lg hover:shadow-lg transition-all duration-200">
              <FaRobot size={20} />
              <span className="font-medium">AI Assistant</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
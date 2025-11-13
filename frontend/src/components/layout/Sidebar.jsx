import React from 'react';
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
} from 'react-icons/fa';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/', icon: FaHome, label: 'Dashboard' },
    { path: '/tasks', icon: FaTasks, label: 'Tasks' },
    { path: '/emails', icon: FaEnvelope, label: 'Emails' },
    { path: '/contacts', icon: FaUsers, label: 'Contacts' },
    { path: '/schedule', icon: FaCalendar, label: 'Schedule' },
    { path: '/analytics', icon: FaChartLine, label: 'Analytics' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  const linkClass = ({ isActive }) => `
    flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
    ${isActive
      ? 'bg-primary-600 text-white shadow-md'
      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }
  `;

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
          fixed lg:static inset-y-0 left-0 z-50
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
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={linkClass}
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
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
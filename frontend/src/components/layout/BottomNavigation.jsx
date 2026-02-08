import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaHome,
  FaTasks,
  FaEnvelope,
  FaCalendar,
  FaUsers,
  FaChartBar,
  FaCog,
  FaComments,
  FaEllipsisH,
  FaRobot,
  FaStar,
} from 'react-icons/fa';

const BottomNavigation = () => {
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  // Main navigation items (always visible)
  const mainItems = [
    { path: '/', icon: FaHome, label: 'Home' },
    { path: '/tasks', icon: FaTasks, label: 'Tasks' },
    { path: '/schedule', icon: FaCalendar, label: 'Schedule' },
    { path: '/emails', icon: FaEnvelope, label: 'Emails' },
  ];

  // Secondary items that appear in a dropdown
  const secondaryItems = [
    { path: '/contacts', icon: FaUsers, label: 'Contacts' },
    { path: '/collaboration', icon: FaComments, label: 'Team' },
    { path: '/ai-insights', icon: FaRobot, label: 'AI Tools' },
    { path: '/analytics', icon: FaChartBar, label: 'Analytics' },
    { path: '/leaderboard', icon: FaStar, label: 'Gamification' },
    { path: '/settings', icon: FaCog, label: 'Settings' },
  ];

  const activeStyle = "text-primary-600 dark:text-primary-400";
  const inactiveStyle = "text-gray-500 dark:text-gray-400";

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 lg:hidden">
      <div className="flex justify-around items-center px-2 py-2">
        {mainItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center p-2 w-full max-w-[70px] ${
                isActive ? activeStyle : inactiveStyle
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-xs mt-1">{item.label}</span>
          </NavLink>
        ))}

        {/* More menu button */}
        <div className="relative">
          <button
            onClick={() => setMoreMenuOpen(!moreMenuOpen)}
            className={`flex flex-col items-center justify-center p-2 w-full max-w-[70px] ${
              moreMenuOpen ? activeStyle : inactiveStyle
            }`}
          >
            <FaEllipsisH size={20} />
            <span className="text-xs mt-1">More</span>
          </button>

          {/* Dropdown menu */}
          {moreMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMoreMenuOpen(false)}
              />
              <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 w-48">
                {secondaryItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 ${
                        isActive
                          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`
                    }
                    onClick={() => setMoreMenuOpen(false)}
                  >
                    <item.icon size={16} className="mr-3" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomNavigation;
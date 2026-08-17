import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CheckSquareIcon, 
  MailIcon, 
  UsersIcon, 
  CalendarIcon, 
  BarChart3Icon,
  SettingsIcon,
  MenuIcon
} from 'lucide-react';

const MobileNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Dashboard' },
    { path: '/tasks', icon: CheckSquareIcon, label: 'Tasks' },
    { path: '/emails', icon: MailIcon, label: 'Emails' },
    { path: '/contacts', icon: UsersIcon, label: 'Contacts' },
    { path: '/schedule', icon: CalendarIcon, label: 'Schedule' },
    { path: '/analytics', icon: BarChart3Icon, label: 'Analytics' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
                          (item.path === '/' && location.pathname === '/');
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`
                flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }
              `}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
import React, { useState } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import Card from '@components/ui/Card';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { FaUser, FaBell, FaPalette, FaShieldAlt, FaSave } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    taskReminders: true,
    emailDigest: false,
  });

  const [privacy, setPrivacy] = useState({
    shareData: false,
    analyticsEnabled: true,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FaUser },
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'privacy', label: 'Privacy', icon: FaShieldAlt },
  ];

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleNotificationUpdate = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    toast.success('Notification preferences saved');
  };

  const handlePrivacyUpdate = () => {
    localStorage.setItem('privacy', JSON.stringify(privacy));
    toast.success('Privacy settings saved');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Tabs Sidebar */}
        <div className="col-span-12 md:col-span-3">
          <Card>
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${activeTab === tab.id
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <tab.icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="col-span-12 md:col-span-9">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card title="Profile Information">
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <Input
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 234 567 8900"
                />
                <Button type="submit" variant="primary" icon={<FaSave />}>
                  Save Changes
                </Button>
              </form>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card title="Notification Preferences">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive email notifications for important updates
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive push notifications in your browser
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Task Reminders</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Get reminded about upcoming tasks
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.taskReminders}
                      onChange={(e) => setNotifications({ ...notifications, taskReminders: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Daily Email Digest</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Receive a daily summary of your tasks
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifications.emailDigest}
                      onChange={(e) => setNotifications({ ...notifications, emailDigest: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <Button variant="primary" icon={<FaSave />} onClick={handleNotificationUpdate}>
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === 'appearance' && (
            <Card title="Appearance Settings">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Theme</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current theme: {theme === 'dark' ? 'Dark' : 'Light'}
                    </p>
                  </div>
                  <Button variant="primary" onClick={toggleTheme}>
                    Toggle Theme
                  </Button>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <p className="font-medium text-gray-900 dark:text-white mb-3">Color Scheme</p>
                  <div className="grid grid-cols-4 gap-3">
                    {['blue', 'purple', 'green', 'orange'].map((color) => (
                      <button
                        key={color}
                        className={`h-12 rounded-lg bg-${color}-600 hover:ring-4 hover:ring-${color}-200 transition-all`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <Card title="Privacy & Security">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Share Usage Data</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Help us improve by sharing anonymous usage data
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.shareData}
                      onChange={(e) => setPrivacy({ ...privacy, shareData: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Analytics</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable analytics to track your productivity
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={privacy.analyticsEnabled}
                      onChange={(e) => setPrivacy({ ...privacy, analyticsEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>

                <Button variant="primary" icon={<FaSave />} onClick={handlePrivacyUpdate}>
                  Save Settings
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
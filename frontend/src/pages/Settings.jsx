import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaUser,
  FaBell,
  FaPalette,
  FaShieldAlt,
  FaSave,
  FaPlug,
  FaUniversalAccess,
  FaChevronRight,
  FaCheck,
  FaMoon,
  FaSun,
  FaDesktop,
  FaEye,
} from 'react-icons/fa';
import { useAuth } from '@contexts/AuthContext';
import { useTheme } from '@contexts/ThemeContext';
import Input from '@components/ui/Input';
import ProfileCard from '@components/profile/ProfileCard';
import Toggle from '@components/ui/Toggle';

const TABS = [
  { id: 'profile', label: 'Profile', icon: FaUser },
  { id: 'appearance', label: 'Appearance', icon: FaPalette },
  { id: 'notifications', label: 'Notifications', icon: FaBell },
  { id: 'privacy', label: 'Privacy', icon: FaShieldAlt },
];

const LINKS = [
  { path: '/settings/integrations', label: 'Integrations', icon: FaPlug, description: 'Connect calendar, email and Slack' },
  { path: '/settings/notifications', label: 'Advanced notifications', icon: FaBell, description: 'Reminders, channels and quiet hours' },
  { path: '/settings/security', label: 'Security', icon: FaShieldAlt, description: 'Password, sessions and audit log' },
  { path: '/settings/accessibility', label: 'Accessibility', icon: FaUniversalAccess, description: 'Contrast, motion and focus aids' },
];

const Settings = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const {
    theme,
    isDark,
    accent,
    density,
    themes,
    accents,
    setTheme,
    setAccent,
    setDensity,
    reducedMotion,
    setReducedMotion,
    toggleTheme,
    themeChoice,
  } = useTheme();

  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [notifications, setNotifications] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem('notifications')) || {
          email: true,
          push: true,
          taskReminders: true,
          weeklyDigest: false,
        }
      );
    } catch {
      return { email: true, push: true, taskReminders: true, weeklyDigest: false };
    }
  });
  const [privacy, setPrivacy] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('privacy')) || { shareData: false, analyticsEnabled: true };
    } catch {
      return { shareData: false, analyticsEnabled: true };
    }
  });

  useEffect(() => {
    document.title = 'Settings — SchedAI';
  }, []);

  useEffect(() => {
    setForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
  }, [user]);

  const handleProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.message || 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (event) => {
    event.preventDefault();
    if (passwords.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    setSaving(true);
    try {
      await changePassword(passwords.currentPassword, passwords.newPassword);
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (error) {
      toast.error(error.message || 'Could not change password');
    } finally {
      setSaving(false);
    }
  };

  const saveNotifications = () => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
    toast.success('Notification preferences saved');
  };

  const savePrivacy = () => {
    localStorage.setItem('privacy', JSON.stringify(privacy));
    toast.success('Privacy settings saved');
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Make SchedAI behave the way you like.</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[15rem_1fr]">
        {/* Tabs */}
        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                    : 'text-content-muted hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <tab.icon size={12} /> {tab.label}
              </button>
            ))}
          </div>

          <div className="card p-2">
            {LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="group flex items-start gap-2.5 rounded-xl px-3 py-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <link.icon size={11} className="mt-1 shrink-0 text-content-subtle" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold text-content">{link.label}</span>
                  <span className="block truncate text-[0.65rem] text-content-subtle">{link.description}</span>
                </span>
                <FaChevronRight size={8} className="mt-1 shrink-0 text-content-subtle transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
          </div>
        </aside>

        {/* Panels */}
        <div className="space-y-5">
          {activeTab === 'profile' && (
            <>
              {/* Rich identity card — photo, inline-editable details, organisations */}
              <ProfileCard />

              <div className="card">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-base font-semibold text-content">Account details</h2>
                  <p className="text-sm text-content-muted">
                    Your sign-in email and contact number.
                  </p>
                </div>
                <form onSubmit={handleProfile} className="space-y-4 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input label="Full name" name="name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                    <Input label="Email" type="email" name="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
                    <Input label="Phone" type="tel" name="phone" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} placeholder="+254 …" />
                  </div>

                  <div className="flex justify-end border-t border-line pt-4">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      <FaSave size={11} /> {saving ? 'Saving…' : 'Save changes'}
                    </button>
                  </div>
                </form>
              </div>

              <div className="card">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-base font-semibold text-content">Password</h2>
                  <p className="text-sm text-content-muted">Use at least 8 characters with a number.</p>
                </div>
                <form onSubmit={handlePassword} className="space-y-4 p-5">
                  <Input
                    label="Current password"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="New password"
                      type="password"
                      value={passwords.newPassword}
                      onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
                      required
                      autoComplete="new-password"
                    />
                    <Input
                      label="Confirm new password"
                      type="password"
                      value={passwords.confirm}
                      onChange={(event) => setPasswords({ ...passwords, confirm: event.target.value })}
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="flex justify-end border-t border-line pt-4">
                    <button type="submit" className="btn btn-outline" disabled={saving}>
                      Update password
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-5">
              <div className="card">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-base font-semibold text-content">Appearance</h2>
                  <p className="text-sm text-content-muted">
                    Changes apply instantly and are remembered on this device.
                  </p>
                </div>

                <div className="space-y-6 p-5">
                  {/* Mode */}
                  <div>
                    <p className="label">Mode</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'light', label: 'Light', icon: FaSun },
                        { id: 'dark', label: 'Dark', icon: FaMoon },
                        { id: 'system', label: 'System', icon: FaDesktop },
                      ].map((mode) => {
                        // 'system' must be selectable and stay selected — the
                        // resolved theme alone cannot tell you it was chosen.
                        const active =
                          mode.id === 'system'
                            ? themeChoice === 'system'
                            : themeChoice !== 'system' && theme === mode.id;
                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() => (mode.id === 'system' ? setTheme('system') : setTheme(mode.id))}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-semibold transition-colors ${
                              active
                                ? 'border-primary-400 bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200'
                                : 'border-line text-content-muted hover:border-primary-300'
                            }`}
                          >
                            <mode.icon size={14} />
                            {mode.label}
                          </button>
                        );
                      })}
                    </div>
                    <button type="button" onClick={toggleTheme} className="btn btn-ghost btn-sm mt-2 px-0">
                      Toggle dark mode
                    </button>
                  </div>

                  {/* Themes */}
                  <div>
                    <p className="label">Theme</p>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {themes.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setTheme(option.id)}
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                            theme === option.id
                              ? 'border-primary-400 bg-primary-50/60 dark:bg-primary-500/10'
                              : 'border-line hover:border-primary-300'
                          }`}
                        >
                          <span
                            className="h-8 w-8 shrink-0 rounded-lg border border-line"
                            style={{
                              background: `linear-gradient(135deg, ${option.swatch[0]} 0 50%, ${option.swatch[1]} 50% 100%)`,
                            }}
                          />
                          <span className="flex-1 text-xs font-semibold text-content">{option.label}</span>
                          {theme === option.id && <FaCheck className="text-primary-600" size={11} />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Accent */}
                  <div>
                    <p className="label">Accent colour</p>
                    <div className="flex flex-wrap gap-2.5">
                      {accents.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setAccent(option.id)}
                          aria-label={option.label}
                          aria-pressed={accent === option.id}
                          className={`flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                            accent === option.id ? 'ring-2 ring-offset-2 ring-offset-surface-raised' : ''
                          }`}
                          style={{ backgroundColor: option.color, '--tw-ring-color': option.color }}
                        >
                          {accent === option.id && <FaCheck size={11} className="text-white" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Density */}
                  <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-content">Compact density</p>
                      <p className="text-xs text-content-muted">Fit more on screen with tighter spacing.</p>
                    </div>
                    <Toggle
                      checked={density === 'compact'}
                      onChange={(next) => setDensity(next ? 'compact' : 'comfortable')}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-content">Reduce motion</p>
                      <p className="text-xs text-content-muted">Disable floating and transition animations.</p>
                    </div>
                    <Toggle checked={reducedMotion} onChange={setReducedMotion} />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="card overflow-hidden">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="flex items-center gap-2 text-base font-semibold text-content">
                    <FaEye size={12} /> Preview
                  </h2>
                </div>
                <div className="space-y-3 p-5">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="btn btn-primary btn-sm">Primary action</button>
                    <button type="button" className="btn btn-outline btn-sm">Secondary</button>
                    <button type="button" className="btn btn-ghost btn-sm">Ghost</button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="stat-card">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">Stat</p>
                      <p className="mt-1 font-display text-xl font-bold text-content">128</p>
                    </div>
                    <div className="stat-card">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">Stat</p>
                      <p className="mt-1 font-display text-xl font-bold text-content">94%</p>
                    </div>
                    <div className="stat-card">
                      <p className="text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-content-subtle">Stat</p>
                      <p className="mt-1 font-display text-xl font-bold text-content">7h</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-accent-gradient p-4 text-white">
                    <p className="text-sm font-semibold">Accent gradient</p>
                    <p className="text-xs text-white/80">Used for CTAs, avatars and highlights.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="card">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-base font-semibold text-content">Notifications</h2>
                <p className="text-sm text-content-muted">Choose what reaches you and where.</p>
              </div>
              <div className="space-y-3 p-5">
                {[
                  { key: 'email', title: 'Email notifications', body: 'Important updates and mentions in your inbox.' },
                  { key: 'push', title: 'Push notifications', body: 'Browser and device alerts when something needs you.' },
                  { key: 'taskReminders', title: 'Task reminders', body: 'A nudge before tasks fall due.' },
                  { key: 'weeklyDigest', title: 'Weekly digest', body: 'A Monday summary of the week ahead.' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-content">{item.title}</p>
                      <p className="text-xs text-content-muted">{item.body}</p>
                    </div>
                    <Toggle
                      checked={Boolean(notifications[item.key])}
                      onChange={(next) => setNotifications({ ...notifications, [item.key]: next })}
                    />
                  </div>
                ))}
                <div className="flex justify-end border-t border-line pt-4">
                  <button type="button" onClick={saveNotifications} className="btn btn-primary">
                    <FaSave size={11} /> Save preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="card">
              <div className="border-b border-line px-5 py-4">
                <h2 className="text-base font-semibold text-content">Privacy</h2>
                <p className="text-sm text-content-muted">You control what leaves this device.</p>
              </div>
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-content">Share anonymous usage data</p>
                    <p className="text-xs text-content-muted">Helps us spot crashes and slow pages.</p>
                  </div>
                  <Toggle checked={Boolean(privacy.shareData)} onChange={(next) => setPrivacy({ ...privacy, shareData: next })} />
                </div>
                <div className="flex items-center justify-between gap-4 rounded-xl border border-line px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-content">Analytics on this device</p>
                    <p className="text-xs text-content-muted">Keep local analytics so your dashboard has history.</p>
                  </div>
                  <Toggle checked={Boolean(privacy.analyticsEnabled)} onChange={(next) => setPrivacy({ ...privacy, analyticsEnabled: next })} />
                </div>

                <div className="rounded-xl border border-line bg-surface-sunken/60 p-4">
                  <p className="text-sm font-semibold text-content">Your data</p>
                  <p className="mt-1 text-xs text-content-muted">
                    Export or delete everything connected to your account at any time.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to="/settings/security" className="btn btn-outline btn-sm">Security centre</Link>
                    <Link to="/contact" className="btn btn-ghost btn-sm">Request deletion</Link>
                  </div>
                </div>

                <div className="flex justify-end border-t border-line pt-4">
                  <button type="button" onClick={savePrivacy} className="btn btn-primary">
                    <FaSave size={11} /> Save settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;

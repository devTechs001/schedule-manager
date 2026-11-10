import { useState } from 'react';
import {
  FaLock,
  FaShieldAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaServer,
  FaUserShield,
} from 'react-icons/fa';
import { useAuth } from '@contexts/AuthContext';
import Modal from '@components/ui/Modal';
import Input from '@components/ui/Input';
import EncryptionBadge from '@components/security/EncryptionBadge';

/**
 * Security settings.
 *
 * This page used to list three active sessions (Chrome on Windows in New York,
 * Safari on iPhone, Firefox on Mac), a security log with fabricated IP
 * addresses, and a two-factor toggle that flipped local state and persisted
 * nothing. None of it came from the server — the account may well have been
 * signed in on one device, from a different country, with 2FA unavailable.
 *
 * Everything shown now either comes from the signed-in user record or is a
 * capability the backend genuinely implements. Things the backend does not
 * support yet are stated plainly as unavailable rather than faked.
 */
const Security = () => {
  const { user, changePassword, logout } = useAuth();

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const openPasswordModal = () => {
    setForm({ currentPassword: '', newPassword: '', confirm: '' });
    setError('');
    setSuccess('');
    setShowPasswordModal(true);
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setError('');

    if (form.newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (form.newPassword !== form.confirm) {
      setError('The two new passwords do not match.');
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setError('Choose a password different from your current one.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(form.currentPassword, form.newPassword);
      setShowPasswordModal(false);
      setSuccess('Password changed. Use it the next time you sign in.');
    } catch (err) {
      setError(err.message || 'Could not change your password.');
    } finally {
      setSubmitting(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null;

  return (
    <div className="space-y-5">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <h1 className="page-title">Security</h1>
          <p className="page-subtitle">How this account is protected, and what you can change.</p>
        </div>

        {success && (
          <p className="mb-5 flex items-start gap-2 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300">
            <FaCheckCircle className="mt-0.5 shrink-0" />
            <span>{success}</span>
          </p>
        )}

        {/* Password — the one credential control the API actually supports. */}
        <section className="card mb-5">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                <FaLock className="text-xl" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-content">Password</h2>
                <p className="text-sm text-content-muted">
                  Changing it signs nothing out — the change takes effect on your next sign-in.
                </p>
              </div>
            </div>
            <button type="button" onClick={openPasswordModal} className="btn btn-primary btn-sm">
              Change password
            </button>
          </div>
        </section>

        {/* Account facts we can state without guessing. */}
        <section className="card mb-5">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-content">Account</h2>
            <p className="text-sm text-content-muted">Details stored against your profile.</p>
          </div>
          <dl className="divide-y divide-line">
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-sm text-content-muted">Email</dt>
              <dd className="text-sm font-medium text-content">{user?.email || 'Not available'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-sm text-content-muted">Sign-in method</dt>
              <dd className="text-sm font-medium text-content">Email and password</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-sm text-content-muted">Member since</dt>
              <dd className="text-sm font-medium text-content">{memberSince || 'Unknown'}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-sm text-content-muted">Session</dt>
              <dd className="flex items-center gap-2 text-sm font-medium text-content">
                <FaShieldAlt size={11} className="text-emerald-500" /> Signed in on this browser
              </dd>
            </div>
          </dl>
        </section>

        <EncryptionBadge showDetails encryptionStatus="active" className="mb-5" />

        {/* Be explicit about what is not built, rather than pretending. */}
        <section className="card mb-5">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-content">Not available yet</h2>
            <p className="text-sm text-content-muted">
              These are often expected on a security page. They are listed here so you know their absence is
              deliberate rather than broken.
            </p>
          </div>
          <ul className="divide-y divide-line">
            {[
              {
                icon: FaUserShield,
                title: 'Two-factor authentication',
                body: 'Not implemented. Your account is protected by your password alone.',
              },
              {
                icon: FaServer,
                title: 'Active sessions and devices',
                body: 'Sessions are not tracked server-side, so there is no device list to show or revoke.',
              },
              {
                icon: FaExclamationTriangle,
                title: 'Security event log',
                body: 'Sign-in history and IP addresses are not recorded.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex items-start gap-3 px-5 py-4">
                  <Icon className="mt-0.5 shrink-0 text-content-subtle" />
                  <div>
                    <p className="text-sm font-medium text-content">{item.title}</p>
                    <p className="text-xs text-content-muted">{item.body}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card">
          <div className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <h2 className="text-base font-semibold text-content">Sign out</h2>
              <p className="text-sm text-content-muted">Ends this session on this browser.</p>
            </div>
            <button
              type="button"
              onClick={() => logout({ redirect: true })}
              className="btn btn-outline btn-sm"
            >
              Sign out
            </button>
          </div>
        </section>
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change password"
        size="sm"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
            required
          />
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            helperText="At least 8 characters."
            value={form.newPassword}
            onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
            required
          />
          <Input
            label="Confirm new password"
            type="password"
            autoComplete="new-password"
            value={form.confirm}
            onChange={(event) => setForm({ ...form, confirm: event.target.value })}
            required
          />

          {error && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-ghost btn-sm">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary btn-sm disabled:opacity-60">
              {submitting ? 'Saving…' : 'Change password'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Security;

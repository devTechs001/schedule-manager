import React from 'react';
import { FaLock, FaLockOpen, FaShieldAlt, FaQuestionCircle } from 'react-icons/fa';

/**
 * Connection and credential badge.
 *
 * The original version advertised "AES-256 active" with a "last key rotation"
 * date that was computed in the browser — neither figure came from anywhere.
 * This version reports two things that are actually observable from the client:
 *
 *   1. whether the page was served over HTTPS (a real property of the current
 *      browsing context, not an assumption), and
 *   2. that stored passwords are bcrypt-hashed (a fact about the server code,
 *      not a runtime measurement).
 *
 * Pass `encryptionStatus` explicitly if a caller has real information; the
 * default is "unknown" rather than "active".
 */
const EncryptionBadge = ({
  encryptionStatus = 'unknown', // 'active' | 'inactive' | 'unknown'
  onClick,
  showDetails = false,
  className = '',
}) => {
  const isBrowser = typeof window !== 'undefined';
  const isHttps = isBrowser ? window.location.protocol === 'https:' : false;
  const isLocalhost = isBrowser
    ? ['localhost', '127.0.0.1', '[::1]'].includes(window.location.hostname)
    : false;

  const transport = isHttps ? 'secure' : isLocalhost ? 'local' : 'insecure';

  const TONE = {
    secure: {
      icon: FaLock,
      label: 'Encrypted in transit',
      detail: 'This page was served over HTTPS.',
      classes: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
      iconTone: 'text-emerald-500',
    },
    local: {
      icon: FaShieldAlt,
      label: 'Local development',
      detail: 'Served over plain HTTP from localhost. Expected during development.',
      classes: 'bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300',
      iconTone: 'text-sky-500',
    },
    insecure: {
      icon: FaLockOpen,
      label: 'Not encrypted in transit',
      detail: 'This page was served over plain HTTP. Anything sent from it is readable on the network.',
      classes: 'bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
      iconTone: 'text-amber-500',
    },
  };

  const tone = TONE[transport];
  const Icon = tone.icon;

  if (!showDetails) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={tone.detail}
        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${tone.classes} ${className}`}
      >
        <Icon size={10} className={tone.iconTone} />
        {tone.label}
      </button>
    );
  }

  const storage = {
    active: { label: 'Passwords hashed', detail: 'Passwords are stored as bcrypt hashes, never as plain text.' },
    inactive: { label: 'Password storage unverified', detail: 'This deployment did not report how passwords are stored.' },
    unknown: { label: 'Password storage unverified', detail: 'This deployment did not report how passwords are stored.' },
  }[encryptionStatus] || {
    label: 'Password storage unverified',
    detail: 'This deployment did not report how passwords are stored.',
  };

  return (
    <div className={`card p-5 ${className}`}>
      <div className="mb-4 flex items-center gap-3">
        <FaShieldAlt className="text-lg text-primary-600" />
        <h3 className="font-semibold text-content">Security</h3>
      </div>

      <ul className="space-y-3 text-sm">
        <li className="flex items-start gap-3">
          <Icon className={`mt-0.5 shrink-0 ${tone.iconTone}`} />
          <div>
            <p className="font-medium text-content">{tone.label}</p>
            <p className="text-xs text-content-muted">{tone.detail}</p>
          </div>
        </li>
        <li className="flex items-start gap-3">
          {encryptionStatus === 'active' ? (
            <FaLock className="mt-0.5 shrink-0 text-emerald-500" />
          ) : (
            <FaQuestionCircle className="mt-0.5 shrink-0 text-content-subtle" />
          )}
          <div>
            <p className="font-medium text-content">{storage.label}</p>
            <p className="text-xs text-content-muted">{storage.detail}</p>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default EncryptionBadge;

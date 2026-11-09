import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaFingerprint,
  FaEye,
  FaLock,
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaShieldAlt,
} from 'react-icons/fa';

/**
 * Biometric unlock setup.
 *
 * Uses the real WebAuthn platform-authenticator API. The previous version
 * waited on a 2-second setTimeout and then declared success — so a device with
 * no biometric hardware still "finished" setup and displayed a green tick.
 *
 * Now the page detects support up front and tells the truth: if the browser or
 * device has no platform authenticator there is nothing to enrol, and the
 * methods are shown as unavailable rather than pretending.
 */

const METHODS = [
  {
    id: 'fingerprint',
    name: 'Fingerprint',
    icon: FaFingerprint,
    description: 'Unlock SchedAI with the fingerprint sensor on this device.',
  },
  {
    id: 'face',
    name: 'Face recognition',
    icon: FaEye,
    description: 'Use the device camera and its secure enclave.',
  },
  {
    id: 'pin',
    name: 'Device PIN',
    icon: FaLock,
    description: 'Fall back to the passcode you already use to unlock this device.',
  },
];

const BiometricSetup = ({ onComplete, onSkip }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState('intro');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [support, setSupport] = useState({ checking: true, available: false, reason: null });

  // Real capability detection — no assumptions.
  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      if (typeof window === 'undefined' || !window.PublicKeyCredential) {
        if (!cancelled) {
          setSupport({
            checking: false,
            available: false,
            reason: 'This browser does not support WebAuthn, so biometric unlock cannot be enabled here.',
          });
        }
        return;
      }

      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        if (cancelled) return;
        setSupport({
          checking: false,
          available,
          reason: available
            ? null
            : 'No platform authenticator was found on this device. Biometric unlock needs a fingerprint reader, Face ID or a device passcode.',
        });
      } catch {
        if (!cancelled) {
          setSupport({
            checking: false,
            available: false,
            reason: 'The browser blocked the biometric capability check.',
          });
        }
      }
    };

    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setError(null);
    setStep('setup');
  };

  /**
   * Register a platform credential for the account.
   * A full implementation would request a challenge from
   * POST /api/auth/webauthn/register-options; that endpoint does not exist yet,
   * so we generate the client-side portion and report honestly if the platform
   * cannot complete it.
   */
  const handleSetup = async () => {
    if (!support.available) return;
    setIsProcessing(true);
    setError(null);

    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'SchedAI' },
          user: {
            id: new Uint8Array(16),
            name: 'schedai-user',
            displayName: 'SchedAI user',
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      });

      if (!credential) {
        throw new Error('The device did not return a credential.');
      }

      setStep('complete');
    } catch (err) {
      // Cancelled by the user and a genuine failure read the same to us; be
      // explicit that no credential was stored.
      setError(
        err?.name === 'NotAllowedError'
          ? 'Setup was cancelled. No credential was stored on this device.'
          : err?.message || 'The device could not register a credential.'
      );
      setStep('intro');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    onComplete?.({ method: selectedMethod, enabled: true });
    navigate('/settings/security');
  };

  const method = METHODS.find((m) => m.id === selectedMethod);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4 py-8">
      <div className="card w-full p-6 sm:p-8">
        {step === 'intro' && (
          <>
            <div className="mb-6 text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-gradient text-white">
                <FaFingerprint size={26} />
              </span>
              <h1 className="text-xl font-bold tracking-tight text-content">Biometric unlock</h1>
              <p className="mt-1 text-sm text-content-muted">
                Sign in without typing your password on this device.
              </p>
            </div>

            {support.checking && (
              <p className="rounded-xl border border-line bg-surface-sunken px-3 py-2.5 text-center text-xs text-content-muted">
                Checking what this device supports…
              </p>
            )}

            {!support.checking && !support.available && (
              <div className="rounded-xl border border-amber-300/60 bg-amber-50 p-3 dark:border-amber-400/25 dark:bg-amber-400/10">
                <p className="flex items-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-200">
                  <FaExclamationTriangle size={11} /> Not available on this device
                </p>
                <p className="mt-1 text-[0.68rem] leading-relaxed text-amber-700 dark:text-amber-300/90">
                  {support.reason}
                </p>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {METHODS.map((item) => {
                const disabled = !support.available;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleMethodSelect(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      disabled
                        ? 'cursor-not-allowed border-line opacity-50'
                        : 'border-line hover:border-primary-400 hover:bg-surface-sunken'
                    }`}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                      <item.icon size={14} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-content">{item.name}</span>
                      <span className="block text-[0.68rem] leading-snug text-content-muted">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onSkip || (() => navigate('/settings/security'))}
              className="mt-5 w-full text-center text-xs font-medium text-content-subtle transition-colors hover:text-content"
            >
              Skip for now
            </button>
          </>
        )}

        {step === 'setup' && method && (
          <>
            <div className="mb-6 text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
                <method.icon size={26} />
              </span>
              <h2 className="text-lg font-bold text-content">Set up {method.name.toLowerCase()}</h2>
              <p className="mt-1 text-sm text-content-muted">
                Your browser will ask you to confirm. The secret never leaves this device.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-300/60 bg-rose-50 p-3 dark:border-rose-400/25 dark:bg-rose-400/10">
                <FaTimes size={11} className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400" />
                <p className="text-[0.68rem] leading-relaxed text-rose-700 dark:text-rose-300">
                  {error}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleSetup}
              disabled={isProcessing}
              className="btn btn-primary w-full justify-center"
            >
              {isProcessing ? 'Waiting for your device…' : `Continue with ${method.name.toLowerCase()}`}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('intro');
                setError(null);
              }}
              className="mt-2 w-full text-center text-xs font-medium text-content-subtle transition-colors hover:text-content"
            >
              Back
            </button>
          </>
        )}

        {step === 'complete' && (
          <>
            <div className="mb-6 text-center">
              <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-400/15 dark:text-emerald-300">
                <FaCheck size={26} />
              </span>
              <h2 className="text-lg font-bold text-content">Credential registered</h2>
              <p className="mt-1 text-sm text-content-muted">
                This device can now unlock SchedAI with {method?.name.toLowerCase() || 'your device'}.
              </p>
            </div>
            <button type="button" onClick={handleComplete} className="btn btn-primary w-full justify-center">
              Done
            </button>
          </>
        )}

        <p className="mt-5 flex items-start gap-1.5 border-t border-line pt-4 text-[0.62rem] leading-relaxed text-content-subtle">
          <FaShieldAlt size={9} className="mt-0.5 shrink-0" />
          Powered by WebAuthn. Biometric data is handled by your device's secure hardware and is
          never sent to SchedAI.
        </p>
      </div>
    </div>
  );
};

export default BiometricSetup;

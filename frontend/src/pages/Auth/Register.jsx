import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaCheck } from 'react-icons/fa';
import { useAuth } from '@contexts/AuthContext';
import { getPasswordStrength } from '@utils/validators';
import AuthShell from './AuthShell';

const STRENGTH_STYLES = {
  weak: { bar: 'bg-rose-500', text: 'text-rose-500', label: 'Weak' },
  medium: { bar: 'bg-amber-500', text: 'text-amber-500', label: 'Fair' },
  strong: { bar: 'bg-emerald-500', text: 'text-emerald-500', label: 'Strong' },
};

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    document.title = 'Create account — SchedAI';
  }, []);

  const strength = useMemo(
    () => (form.password ? getPasswordStrength(form.password) : null),
    [form.password]
  );

  const checks = useMemo(
    () => [
      { label: '8+ characters', ok: form.password.length >= 8 },
      { label: 'Upper & lowercase', ok: /[a-z]/.test(form.password) && /[A-Z]/.test(form.password) },
      { label: 'A number', ok: /\d/.test(form.password) },
      { label: 'Passwords match', ok: form.password.length > 0 && form.password === form.confirmPassword },
    ],
    [form.password, form.confirmPassword]
  );

  const errors = {
    name: touched.name && form.name.trim().length < 2 ? 'Enter at least two characters' : '',
    email: touched.email && !/^\S+@\S+\.\S+$/.test(form.email) ? 'Enter a valid email address' : '',
    password: touched.password && form.password.length < 8 ? 'Use at least 8 characters' : '',
    confirmPassword:
      touched.confirmPassword && form.password !== form.confirmPassword ? 'Passwords do not match' : '',
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    if (form.name.trim().length < 2) return toast.error('Please enter your name');
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return toast.error('Please enter a valid email');
    if (strength?.level === 'weak') return toast.error('Choose a stronger password');
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (!accepted) return toast.error('Please accept the terms to continue');

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('Account created — welcome aboard!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to start. Your first plan is about two minutes away."
      highlights={[
        'No credit card required',
        'Unlimited tasks & events',
        'Offline-first PWA',
        'All themes included',
      ]}
      footer={
        <p className="text-sm text-content-muted">
          Already have an account?{' '}
          <Link to="/login" className="link">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="name" className="label">Full name</label>
          <div className="relative">
            <FaUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
            <input
              id="name"
              autoComplete="name"
              value={form.name}
              onChange={update('name')}
              onBlur={() => setTouched((state) => ({ ...state, name: true }))}
              placeholder="Amara Otieno"
              className={`input pl-10 ${errors.name ? 'input-error' : ''}`}
              required
            />
          </div>
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="email" className="label">Email address</label>
          <div className="relative">
            <FaEnvelope className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={update('email')}
              onBlur={() => setTouched((state) => ({ ...state, email: true }))}
              placeholder="you@example.com"
              className={`input pl-10 ${errors.email ? 'input-error' : ''}`}
              required
            />
          </div>
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.password}
              onChange={update('password')}
              onBlur={() => setTouched((state) => ({ ...state, password: true }))}
              placeholder="Create a strong password"
              className={`input pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-content-subtle hover:text-content"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash size={11} /> : <FaEye size={11} />}
            </button>
          </div>
          {form.password && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      STRENGTH_STYLES[strength?.level]?.bar || 'bg-gray-300'
                    }`}
                    style={{ width: strength?.level === 'weak' ? '38%' : strength?.level === 'medium' ? '68%' : '100%' }}
                  />
                </div>
                <span className={`text-[0.68rem] font-semibold ${STRENGTH_STYLES[strength?.level]?.text || ''}`}>
                  {STRENGTH_STYLES[strength?.level]?.label || ''}
                </span>
              </div>
              <ul className="mt-2 grid grid-cols-2 gap-1">
                {checks.slice(0, 3).map((check) => (
                  <li
                    key={check.label}
                    className={`flex items-center gap-1.5 text-[0.65rem] ${
                      check.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-content-subtle'
                    }`}
                  >
                    <FaCheck size={7} className={check.ok ? '' : 'opacity-30'} /> {check.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirm password</label>
          <div className="relative">
            <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={11} />
            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={update('confirmPassword')}
              onBlur={() => setTouched((state) => ({ ...state, confirmPassword: true }))}
              placeholder="Repeat your password"
              className={`input pl-10 ${errors.confirmPassword ? 'input-error' : ''}`}
              required
            />
          </div>
          {errors.confirmPassword ? (
            <p className="error-text">{errors.confirmPassword}</p>
          ) : (
            form.confirmPassword && (
              <p className="mt-1.5 flex items-center gap-1 text-[0.68rem] text-emerald-600 dark:text-emerald-400">
                <FaCheck size={7} /> Passwords match
              </p>
            )
          )}
        </div>

        <label className="flex items-start gap-2 text-xs text-content-muted">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => setAccepted(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-500"
            required
          />
          <span>
            I agree to the{' '}
            <Link to="/contact" className="link">terms of service</Link> and{' '}
            <Link to="/contact" className="link">privacy policy</Link>.
          </span>
        </label>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create free account'} {!loading && <FaArrowRight size={10} />}
        </button>
      </form>
    </AuthShell>
  );
};

export default Register;

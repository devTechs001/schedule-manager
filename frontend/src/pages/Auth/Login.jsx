import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaArrowRight, FaGoogle, FaGithub, FaBolt } from 'react-icons/fa';
import { useAuth } from '@contexts/AuthContext';
import AuthShell from './AuthShell';
import { useDemoLogin } from '@components/public/DemoLoginButton';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const { startDemo, loading: demoLoading } = useDemoLogin();

  useEffect(() => {
    document.title = 'Sign in — SchedAI';
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Enter your email and password');
      return;
    }

    setLoading(true);
    try {
      await login(form.email.trim(), form.password);
      if (!remember) {
        // Session-only: drop the token when the tab closes.
        sessionStorage.setItem('token', localStorage.getItem('token'));
      }
      toast.success('Welcome back');
      const redirectTo = location.state?.from || '/dashboard';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to pick up exactly where you left off."
      highlights={[
        'AI-prioritised task list',
        'Calendar in one view',
        'Dark mode & themes',
        'Works offline',
      ]}
      footer={
        <p className="text-sm text-content-muted">
          New here?{' '}
          <Link to="/register" className="link">
            Create a free account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <div className="relative">
            <FaEnvelope className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={12} />
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
              className="input pl-10"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="label mb-0">
              Password
            </label>
            <Link to="/contact" className="text-xs font-medium text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-subtle" size={12} />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
              className="input pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-content-subtle hover:text-content"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-content-muted">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="h-4 w-4 rounded border-line text-primary-600 focus:ring-primary-500"
          />
          Keep me signed in for 7 days
        </label>

        <button type="submit" className="btn btn-primary w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'} {!loading && <FaArrowRight size={10} />}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[0.68rem] font-medium uppercase tracking-[0.14em] text-content-subtle">or</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => toast('Google sign-in is not configured on this deployment yet.')}
          className="btn btn-outline btn-sm"
        >
          <FaGoogle size={11} /> Google
        </button>
        <button
          type="button"
          onClick={() => toast('GitHub sign-in is not configured on this deployment yet.')}
          className="btn btn-outline btn-sm"
        >
          <FaGithub size={12} /> GitHub
        </button>
      </div>

      <button
        type="button"
        onClick={startDemo}
        disabled={demoLoading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line bg-surface-sunken/60 px-3 py-2.5 text-[0.72rem] font-semibold text-content transition-colors hover:border-primary-300"
      >
        <FaBolt className="text-primary-500" size={11} />
        {demoLoading ? 'Preparing a demo board…' : 'Explore instantly with a demo account'}
      </button>
    </AuthShell>
  );
};

export default Login;

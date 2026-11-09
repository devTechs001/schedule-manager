import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaBolt, FaArrowRight } from 'react-icons/fa';
import client from '@services/api/client';

/**
 * One-click demo session. If the backend has no database (or demo mode is
 * disabled) we fall back to a local sandbox session so the product can still
 * be explored.
 */
export const useDemoLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const startDemo = async () => {
    setLoading(true);
    try {
      const data = await client.post('/auth/demo', {});
      const token = data?.token;
      const user = data?.user;

      if (!token || !user) throw new Error('Demo session unavailable');

      localStorage.setItem('token', token);
      try {
        localStorage.setItem('demoSession', 'true');
        localStorage.setItem('demoUser', JSON.stringify(user));
        if (Array.isArray(data.seeded) && data.seeded.length) {
          localStorage.setItem('demoSeeded', data.seeded.join(', '));
        }
      } catch {
        /* ignore storage errors */
      }

      // Full reload so AuthProvider picks the new token up cleanly.
      window.location.assign('/dashboard');
      return true;
    } catch (error) {
      // Offline sandbox fallback — a flag is enough for AuthContext to
      // provision a local demo user (no backend or database required).
      try {
        localStorage.setItem('demoSession', 'true');
        localStorage.removeItem('demoUser');
      } catch {
        /* ignore */
      }
      toast.error(
        error?.message
          ? `Live demo unavailable (${error.message}). Opening a local sandbox instead.`
          : 'Opening a local sandbox demo.'
      );
      navigate('/dashboard');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { startDemo, loading };
};

const DemoLoginButton = ({ variant = 'outline', size = 'md', label = 'Try the live demo', className = '' }) => {
  const { startDemo, loading } = useDemoLogin();

  return (
    <button
      type="button"
      onClick={startDemo}
      disabled={loading}
      className={`btn btn-${variant} btn-${size} ${className}`}
    >
      {loading ? (
        'Preparing demo…'
      ) : (
        <>
          <FaBolt size={11} /> {label} <FaArrowRight size={10} />
        </>
      )}
    </button>
  );
};

export default DemoLoginButton;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { FaEnvelope, FaLock, FaRobot } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/');
    } catch (error) {
      console.error('Login error details:', error); // Log for debugging

      let errorMessage = error.message || 'Login failed. Please check your credentials.';
      let solution = '';

      // Provide specific solutions based on error message
      if (error.message.toLowerCase().includes('invalid credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
        solution = 'Make sure you\'re using the correct email and password. Default admin credentials: devtechs842@gmail.com / AdminPass123!';
      } else if (error.message.toLowerCase().includes('user not found') || error.message.toLowerCase().includes('no user')) {
        errorMessage = 'User not found. Please check your email address.';
        solution = 'If you don\'t have an account, please register first.';
      } else if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('no response from server')) {
        errorMessage = 'Cannot connect to the server. Please check if the backend is running.';
        solution = 'Make sure the backend server is running on port 5000.';
      } else if (error.message.toLowerCase().includes('404')) {
        errorMessage = 'Authentication service not found.';
        solution = 'Please contact the administrator. The login service may be temporarily unavailable.';
      }

      // Show error with solution
      toast.error(
        <div className="text-left">
          <div className="font-semibold">Login Failed</div>
          <div>{errorMessage}</div>
          {solution && <div className="mt-1 text-sm opacity-80">{solution}</div>}
        </div>,
        { duration: 8000 } // Show for 8 seconds to allow reading
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaRobot className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your AI Schedule Manager account
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              icon={<FaEnvelope />}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              icon={<FaLock />}
              placeholder="Enter your password"
              required
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                  Remember me
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-2" />
                Google
              </button>
              <button className="flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <img src="https://github.com/favicon.ico" alt="GitHub" className="w-5 h-5 mr-2" />
                GitHub
              </button>
            </div>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
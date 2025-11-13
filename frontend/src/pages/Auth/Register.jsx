import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@contexts/AuthContext';
import Input from '@components/ui/Input';
import Button from '@components/ui/Button';
import { FaUser, FaEnvelope, FaLock, FaRobot } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { validateEmail, validatePassword, getPasswordStrength } from '@utils/validators';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!validateEmail(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (!validatePassword(formData.password)) {
      toast.error('Password must be at least 8 characters with uppercase, lowercase, and number');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="max-w-md w-full space-y-8">
        {/* Logo & Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FaRobot className="text-white" size={32} />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Account
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Join AI Schedule Manager and boost your productivity
          </p>
        </div>

        {/* Register Form */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              icon={<FaUser />}
              placeholder="John Doe"
              required
            />

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

            <div>
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                icon={<FaLock />}
                placeholder="Create a strong password"
                required
              />
              {passwordStrength && (
                <div className="mt-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${passwordStrength.color}-500 transition-all duration-300`}
                        style={{
                          width: `${
                            passwordStrength.level === 'weak'
                              ? '33%'
                              : passwordStrength.level === 'medium'
                              ? '66%'
                              : '100%'
                          }`,
                        }}
                      />
                    </div>
                    <span className={`text-xs font-medium text-${passwordStrength.color}-600`}>
                      {passwordStrength.level}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              icon={<FaLock />}
              placeholder="Confirm your password"
              required
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                required
                className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={loading}
              disabled={loading}
            >
              Create Account
            </Button>
          </form>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
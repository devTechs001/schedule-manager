import { FaHome, FaSearch, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  const suggestions = [
    { path: '/', label: 'Dashboard', description: 'Go to your main dashboard' },
    { path: '/tasks', label: 'Tasks', description: 'View your task list' },
    { path: '/calendar', label: 'Calendar', description: 'Check your schedule' },
    { path: '/settings', label: 'Settings', description: 'Manage your preferences' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-[150px] md:text-[200px] font-bold text-gray-200 dark:text-gray-800">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center animate-bounce">
                <FaSearch className="text-4xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaArrowLeft className="mr-2" /> Go Back
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
            <FaHome className="mr-2" /> Home
          </button>
        </div>

        {/* Suggestions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Popular Pages
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {suggestions.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
              >
                <p className="font-medium text-gray-800 dark:text-white">{item.label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-500">
          Need help? <a href="/support" className="text-blue-500 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
};

export default NotFound;


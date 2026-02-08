import { useState } from 'react';
import { FaExclamationTriangle, FaRedo, FaHome, FaBug, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ServerError = ({ error, resetError }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleReportBug = () => {
    // In a real app, this would open a bug report form or send to error tracking service
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    console.log('Bug report:', errorInfo);
    alert('Thank you! Your bug report has been submitted.');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Illustration */}
        <div className="mb-8">
          <div className="relative inline-block">
            <span className="text-[150px] md:text-[200px] font-bold text-gray-200 dark:text-gray-800">
              500
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center">
                <FaExclamationTriangle className="text-4xl text-white animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
          We're experiencing technical difficulties. Our team has been notified and is working on a fix.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={handleRetry}
            className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
          >
            <FaRedo className="mr-2" /> Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaHome className="mr-2" /> Go Home
          </button>
          <button
            onClick={handleReportBug}
            className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaBug className="mr-2" /> Report Bug
          </button>
        </div>

        {/* Error Details (collapsible) */}
        {error && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-semibold text-gray-800 dark:text-white">Error Details</span>
              {showDetails ? (
                <FaChevronUp className="text-gray-500" />
              ) : (
                <FaChevronDown className="text-gray-500" />
              )}
            </button>
            
            {showDetails && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg overflow-auto">
                <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-2">
                  {error.message || 'An unexpected error occurred'}
                </p>
                {error.stack && (
                  <pre className="text-xs font-mono text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Status Info */}
        <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
          <span>Error ID: {Date.now().toString(36)}</span>
          <span>•</span>
          <a href="/status" className="text-blue-500 hover:underline">System Status</a>
          <span>•</span>
          <a href="/support" className="text-blue-500 hover:underline">Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default ServerError;


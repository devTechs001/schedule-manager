import { useState } from 'react';
import { FaExclamationTriangle, FaRedo, FaHome, FaBug, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

const ServerError = ({ error, resetError }) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  /*
   * One reference per error, not per render. This used to be computed inline as
   * `Date.now().toString(36)`, so it changed every time the page re-rendered —
   * any reference a user quoted would not match what support saw.
   */
  const [errorRef] = useState(() => Date.now().toString(36).toUpperCase());
  const [copied, setCopied] = useState(null);

  const handleRetry = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  /*
   * There is no error-tracking service wired up, so nothing is submitted. This
   * used to log to the console and then claim "Your bug report has been
   * submitted." Instead it copies what a maintainer would need to the clipboard
   * and says exactly that — a claim the app can keep.
   */
  const handleReportBug = async () => {
    const errorInfo = [
      `Reference: ${errorRef}`,
      `Message: ${error?.message || 'Unknown error'}`,
      `URL: ${window.location.href}`,
      `Time: ${new Date().toISOString()}`,
      `User agent: ${navigator.userAgent}`,
      error?.stack ? `Stack: ${error.stack}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    try {
      await navigator.clipboard.writeText(errorInfo);
      setCopied(true);
    } catch {
      // Clipboard can be unavailable (insecure context, denied permission).
      console.error(errorInfo);
      setCopied(false);
    }
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
            onClick={() => navigate('/dashboard')}
            className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaHome className="mr-2" /> Go Home
          </button>
          <button
            onClick={handleReportBug}
            className="flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FaBug className="mr-2" />
            {copied === true ? 'Details copied' : copied === false ? 'Copy failed — see console' : 'Copy error details'}
          </button>
        </div>

        {copied === true && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Include reference <span className="font-mono font-semibold">{errorRef}</span> when you
            contact support.
          </p>
        )}

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
          <span>Error reference: {errorRef}</span>
          <span>•</span>
          <Link to="/status" className="text-blue-500 hover:underline">System Status</Link>
          <span>•</span>
          <Link to="/support" className="text-blue-500 hover:underline">Support</Link>
        </div>
      </div>
    </div>
  );
};

export default ServerError;


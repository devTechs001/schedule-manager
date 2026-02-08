import React, { useState } from 'react';
import { FaLock, FaShieldAlt, FaCheck, FaExclamationTriangle, FaInfoCircle, FaKey, FaServer } from 'react-icons/fa';

const EncryptionBadge = ({ 
  encryptionStatus = 'active',
  encryptionType = 'AES-256',
  lastKeyRotation = new Date(Date.now() - 86400000 * 30),
  onClick,
  showDetails = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const isSecure = encryptionStatus === 'active';

  if (!showDetails) {
    // Compact badge view
    return (
      <div 
        className="relative inline-flex"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <button
          onClick={onClick}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            isSecure
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}
        >
          <FaLock className="text-xs" />
          <span>{isSecure ? 'Encrypted' : 'Not Encrypted'}</span>
        </button>
        
        {showTooltip && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
            <div className="flex items-center gap-2 mb-2">
              <FaShieldAlt className="text-green-400" />
              <span className="font-medium">End-to-end encrypted</span>
            </div>
            <p className="text-gray-300">Your data is protected with {encryptionType} encryption</p>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900" />
          </div>
        )}
      </div>
    );
  }

  // Detailed view
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaShieldAlt className="text-green-500 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Encryption Status</h3>
        </div>
        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          isSecure
            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
        }`}>
          {isSecure ? <FaCheck /> : <FaExclamationTriangle />}
          {isSecure ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Encryption Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaLock className="text-xs" />
            <span className="text-sm">Encryption Type</span>
          </div>
          <p className="font-bold text-gray-900 dark:text-white">{encryptionType}</p>
          <p className="text-xs text-gray-500 mt-1">Military-grade encryption</p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <FaKey className="text-xs" />
            <span className="text-sm">Last Key Rotation</span>
          </div>
          <p className="font-bold text-gray-900 dark:text-white">
            {Math.floor((Date.now() - new Date(lastKeyRotation).getTime()) / 86400000)} days ago
          </p>
          <p className="text-xs text-gray-500 mt-1">Auto-rotates every 90 days</p>
        </div>
      </div>

      {/* What's Protected */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Protected Data</h4>
        <div className="space-y-2">
          {[
            { name: 'Tasks & Notes', encrypted: true },
            { name: 'Calendar Events', encrypted: true },
            { name: 'Contacts', encrypted: true },
            { name: 'Files & Attachments', encrypted: true },
            { name: 'Messages', encrypted: true },
          ].map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
              <span className={`flex items-center gap-1 text-xs ${
                item.encrypted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {item.encrypted ? <FaCheck /> : <FaExclamationTriangle />}
                {item.encrypted ? 'Encrypted' : 'Not encrypted'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Security Features */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <FaInfoCircle className="text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Security Features</h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
              <li>• Zero-knowledge encryption (we can't read your data)</li>
              <li>• TLS 1.3 for data in transit</li>
              <li>• Automatic key rotation every 90 days</li>
              <li>• SOC 2 Type II certified</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Server Info */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <FaServer />
          <span>Data stored in US-East region</span>
        </div>
        <button className="text-primary-600 hover:text-primary-700">Learn more</button>
      </div>
    </div>
  );
};

export default EncryptionBadge;


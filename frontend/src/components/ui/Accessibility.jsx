import React, { useState, useEffect, createContext, useContext } from 'react';
import { FaUniversalAccess, FaFont, FaAdjust, FaVolumeUp, FaKeyboard, FaMouse, FaTimes } from 'react-icons/fa';

// Accessibility Context
const AccessibilityContext = createContext();

export const useAccessibility = () => useContext(AccessibilityContext);

export const AccessibilityProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    fontSize: 'normal',
    contrast: 'normal',
    reduceMotion: false,
    screenReader: false,
    keyboardNav: true,
    focusHighlight: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem('accessibilitySettings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    // Apply settings
    document.documentElement.classList.toggle('text-lg', settings.fontSize === 'large');
    document.documentElement.classList.toggle('text-xl', settings.fontSize === 'larger');
    document.documentElement.classList.toggle('high-contrast', settings.contrast === 'high');
    document.documentElement.classList.toggle('reduce-motion', settings.reduceMotion);
    document.documentElement.classList.toggle('focus-highlight', settings.focusHighlight);
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

// Skip to Content Link
export const SkipToContent = ({ targetId = 'main-content' }) => (
  <a
    href={`#${targetId}`}
    className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg"
  >
    Skip to main content
  </a>
);

// Accessibility Panel
const AccessibilityPanel = ({ isOpen, onClose }) => {
  const { settings, updateSetting } = useAccessibility() || { settings: {}, updateSetting: () => {} };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6" role="dialog" aria-modal="true" aria-labelledby="a11y-title">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FaUniversalAccess className="text-primary-600 text-xl" />
            <h2 id="a11y-title" className="text-lg font-semibold text-gray-900 dark:text-white">Accessibility Settings</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700" aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaFont /> Text Size
            </label>
            <div className="flex gap-2">
              {['normal', 'large', 'larger'].map((size) => (
                <button
                  key={size}
                  onClick={() => updateSetting('fontSize', size)}
                  className={`flex-1 py-2 px-4 rounded-lg capitalize ${
                    settings.fontSize === size
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <FaAdjust /> Contrast
            </label>
            <div className="flex gap-2">
              {['normal', 'high'].map((level) => (
                <button
                  key={level}
                  onClick={() => updateSetting('contrast', level)}
                  className={`flex-1 py-2 px-4 rounded-lg capitalize ${
                    settings.contrast === level
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          {[
            { key: 'reduceMotion', icon: FaMouse, label: 'Reduce Motion' },
            { key: 'screenReader', icon: FaVolumeUp, label: 'Screen Reader Optimized' },
            { key: 'keyboardNav', icon: FaKeyboard, label: 'Enhanced Keyboard Navigation' },
            { key: 'focusHighlight', icon: FaUniversalAccess, label: 'Focus Highlight' },
          ].map(({ key, icon: Icon, label }) => (
            <label key={key} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
              <div className="flex items-center gap-3">
                <Icon className="text-gray-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
              </div>
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => updateSetting(key, e.target.checked)}
                className="w-5 h-5 text-primary-600 rounded"
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

// Accessibility Button (FAB)
export const AccessibilityButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-40 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center"
        aria-label="Accessibility settings"
      >
        <FaUniversalAccess className="text-xl" />
      </button>
      <AccessibilityPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default AccessibilityPanel;


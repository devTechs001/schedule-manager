import { useState } from 'react';
import { FaUniversalAccess, FaEye, FaFont, FaKeyboard, FaVolumeUp, FaMoon, FaAdjust, FaMousePointer } from 'react-icons/fa';

const Accessibility = () => {
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    contrast: 'normal',
    reducedMotion: false,
    screenReader: false,
    keyboardNav: true,
    captions: false,
    colorBlind: 'none',
    cursorSize: 'normal',
  });

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const fontSizes = [
    { id: 'small', label: 'Small', size: '14px' },
    { id: 'medium', label: 'Medium', size: '16px' },
    { id: 'large', label: 'Large', size: '18px' },
    { id: 'xlarge', label: 'Extra Large', size: '20px' },
  ];

  const contrastModes = [
    { id: 'normal', label: 'Normal' },
    { id: 'high', label: 'High Contrast' },
    { id: 'inverted', label: 'Inverted' },
  ];

  const colorBlindModes = [
    { id: 'none', label: 'None' },
    { id: 'protanopia', label: 'Protanopia (Red-Blind)' },
    { id: 'deuteranopia', label: 'Deuteranopia (Green-Blind)' },
    { id: 'tritanopia', label: 'Tritanopia (Blue-Blind)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <FaUniversalAccess className="text-2xl text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Accessibility</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">Customize your experience for better accessibility</p>
        </div>

        {/* Text Size */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaFont className="text-xl text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Text Size</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {fontSizes.map((size) => (
              <button
                key={size.id}
                onClick={() => updateSetting('fontSize', size.id)}
                className={`p-4 rounded-lg border-2 transition-colors ${
                  settings.fontSize === size.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                }`}
              >
                <span style={{ fontSize: size.size }} className="text-gray-800 dark:text-white">{size.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Display & Contrast */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaAdjust className="text-xl text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Display & Contrast</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Contrast Mode</label>
              <select
                value={settings.contrast}
                onChange={(e) => updateSetting('contrast', e.target.value)}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                {contrastModes.map((mode) => (
                  <option key={mode.id} value={mode.id}>{mode.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color Blind Mode</label>
              <select
                value={settings.colorBlind}
                onChange={(e) => updateSetting('colorBlind', e.target.value)}
                className="w-full px-4 py-2 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
              >
                {colorBlindModes.map((mode) => (
                  <option key={mode.id} value={mode.id}>{mode.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Motion & Animation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaEye className="text-xl text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Motion & Animation</h2>
          </div>
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Reduce Motion</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Minimize animations and transitions</p>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors ${
              settings.reducedMotion ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}>
              <div className={`w-5 h-5 mt-1 ml-1 bg-white rounded-full transition-transform ${
                settings.reducedMotion ? 'translate-x-5' : ''
              }`} />
            </div>
          </label>
        </div>

        {/* Input & Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaKeyboard className="text-xl text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Input & Navigation</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Keyboard Navigation</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Enable full keyboard navigation</p>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors ${
                settings.keyboardNav ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`} onClick={() => updateSetting('keyboardNav', !settings.keyboardNav)}>
                <div className={`w-5 h-5 mt-1 ml-1 bg-white rounded-full transition-transform ${
                  settings.keyboardNav ? 'translate-x-5' : ''
                }`} />
              </div>
            </label>
            <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">Screen Reader Support</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Optimize for screen readers</p>
              </div>
              <div className={`w-12 h-7 rounded-full transition-colors ${
                settings.screenReader ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`} onClick={() => updateSetting('screenReader', !settings.screenReader)}>
                <div className={`w-5 h-5 mt-1 ml-1 bg-white rounded-full transition-transform ${
                  settings.screenReader ? 'translate-x-5' : ''
                }`} />
              </div>
            </label>
          </div>
        </div>

        {/* Audio */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <FaVolumeUp className="text-xl text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Audio</h2>
          </div>
          <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-800 dark:text-white">Closed Captions</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Show captions for video content</p>
            </div>
            <div className={`w-12 h-7 rounded-full transition-colors ${
              settings.captions ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
            }`} onClick={() => updateSetting('captions', !settings.captions)}>
              <div className={`w-5 h-5 mt-1 ml-1 bg-white rounded-full transition-transform ${
                settings.captions ? 'translate-x-5' : ''
              }`} />
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;


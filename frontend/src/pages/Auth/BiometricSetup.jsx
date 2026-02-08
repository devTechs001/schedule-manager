import { useState } from 'react';
import { FaFingerprint, FaEye, FaLock, FaCheck, FaTimes } from 'react-icons/fa';

const BiometricSetup = ({ onComplete, onSkip }) => {
  const [step, setStep] = useState('intro'); // intro, setup, verify, complete
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const biometricMethods = [
    { id: 'fingerprint', name: 'Fingerprint', icon: FaFingerprint, description: 'Use your fingerprint to sign in quickly' },
    { id: 'face', name: 'Face Recognition', icon: FaEye, description: 'Use facial recognition for secure access' },
    { id: 'pin', name: 'PIN Code', icon: FaLock, description: 'Set up a 6-digit PIN as backup' },
  ];

  const checkBiometricSupport = async () => {
    if (window.PublicKeyCredential) {
      try {
        const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return available;
      } catch {
        return false;
      }
    }
    return false;
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setStep('setup');
  };

  const handleSetup = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 2000));
      setStep('verify');
    } catch (err) {
      setError('Setup failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await new Promise(r => setTimeout(r, 1500));
      setStep('complete');
    } catch (err) {
      setError('Verification failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = () => {
    onComplete?.({ method: selectedMethod, enabled: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        {/* Intro Step */}
        {step === 'intro' && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFingerprint className="text-4xl text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                Set Up Biometric Login
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Add an extra layer of security with biometric authentication
              </p>
            </div>

            <div className="space-y-3">
              {biometricMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleMethodSelect(method.id)}
                  className="w-full flex items-center p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
                >
                  <method.icon className="text-2xl text-blue-500 mr-4" />
                  <div className="text-left">
                    <p className="font-medium text-gray-800 dark:text-white">{method.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{method.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={onSkip}
              className="w-full mt-6 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              Skip for now
            </button>
          </>
        )}

        {/* Setup Step */}
        {step === 'setup' && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                {selectedMethod === 'fingerprint' && <FaFingerprint className="text-4xl text-blue-500" />}
                {selectedMethod === 'face' && <FaEye className="text-4xl text-blue-500" />}
                {selectedMethod === 'pin' && <FaLock className="text-4xl text-blue-500" />}
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {selectedMethod === 'fingerprint' && 'Register Your Fingerprint'}
                {selectedMethod === 'face' && 'Set Up Face Recognition'}
                {selectedMethod === 'pin' && 'Create Your PIN'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedMethod === 'fingerprint' && 'Place your finger on the sensor when prompted'}
                {selectedMethod === 'face' && 'Position your face in front of the camera'}
                {selectedMethod === 'pin' && 'Enter a 6-digit PIN you\'ll remember'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center">
                <FaTimes className="mr-2" /> {error}
              </div>
            )}

            <button
              onClick={handleSetup}
              disabled={isProcessing}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {isProcessing ? 'Setting up...' : 'Start Setup'}
            </button>

            <button onClick={() => setStep('intro')} className="w-full mt-3 text-gray-500 hover:text-gray-700">
              Back
            </button>
          </>
        )}

        {/* Verify Step */}
        {step === 'verify' && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <FaCheck className="text-4xl text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">Verify Setup</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Let's verify your biometric setup works correctly
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
                {error}
              </div>
            )}

            <button
              onClick={handleVerify}
              disabled={isProcessing}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium disabled:opacity-50"
            >
              {isProcessing ? 'Verifying...' : 'Verify Now'}
            </button>
          </>
        )}

        {/* Complete Step */}
        {step === 'complete' && (
          <>
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-4xl text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">All Set!</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Biometric authentication is now enabled for your account
              </p>
            </div>

            <button
              onClick={handleComplete}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium"
            >
              Continue
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default BiometricSetup;


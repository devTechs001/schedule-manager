import { useState } from 'react';
import { FaUser, FaBriefcase, FaCalendarAlt, FaBell, FaCheck, FaArrowRight, FaArrowLeft } from 'react-icons/fa';

const SetupWizard = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    workHours: { start: '09:00', end: '17:00' },
    workDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    notifications: { email: true, push: true, reminders: true },
  });

  const steps = [
    { id: 'profile', title: 'Profile', icon: FaUser },
    { id: 'work', title: 'Work Preferences', icon: FaBriefcase },
    { id: 'calendar', title: 'Calendar', icon: FaCalendarAlt },
    { id: 'notifications', title: 'Notifications', icon: FaBell },
  ];

  const roles = ['Developer', 'Designer', 'Manager', 'Student', 'Freelancer', 'Other'];
  const days = [
    { id: 'mon', label: 'M' }, { id: 'tue', label: 'T' }, { id: 'wed', label: 'W' },
    { id: 'thu', label: 'T' }, { id: 'fri', label: 'F' }, { id: 'sat', label: 'S' }, { id: 'sun', label: 'S' },
  ];

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleWorkDay = (day) => {
    setFormData(prev => ({
      ...prev,
      workDays: prev.workDays.includes(day)
        ? prev.workDays.filter(d => d !== day)
        : [...prev.workDays, day],
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete?.(formData);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Progress */}
        <div className="px-8 pt-8">
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep ? 'bg-green-500' :
                  index === currentStep ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}>
                  {index < currentStep ? (
                    <FaCheck className="text-white" />
                  ) : (
                    <step.icon className={index === currentStep ? 'text-white' : 'text-gray-500'} />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 md:w-24 h-1 mx-2 ${
                    index < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{steps[currentStep].title}</h2>
        </div>

        {/* Step Content */}
        <div className="p-8">
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">What's your role?</label>
                <div className="grid grid-cols-3 gap-3">
                  {roles.map((role) => (
                    <button
                      key={role}
                      onClick={() => updateFormData('role', role)}
                      className={`p-3 rounded-xl border-2 transition-colors ${
                        formData.role === role
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Hours</label>
                <div className="flex items-center space-x-4">
                  <input
                    type="time"
                    value={formData.workHours.start}
                    onChange={(e) => updateFormData('workHours', { ...formData.workHours, start: e.target.value })}
                    className="px-4 py-3 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={formData.workHours.end}
                    onChange={(e) => updateFormData('workHours', { ...formData.workHours, end: e.target.value })}
                    className="px-4 py-3 border dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Work Days</label>
                <div className="flex space-x-2">
                  {days.map((day) => (
                    <button
                      key={day.id}
                      onClick={() => toggleWorkDay(day.id)}
                      className={`w-10 h-10 rounded-full font-medium transition-colors ${
                        formData.workDays.includes(day.id)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400 mb-4">Connect your calendars to sync events automatically</p>
              {['Google Calendar', 'Microsoft Outlook', 'Apple Calendar'].map((cal) => (
                <button key={cal} className="w-full p-4 border dark:border-gray-600 rounded-xl flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span className="font-medium text-gray-800 dark:text-white">{cal}</span>
                  <span className="text-blue-500">Connect</span>
                </button>
              ))}
              <button className="text-gray-500 dark:text-gray-400 text-sm">Skip for now</button>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Get updates via email' },
                { key: 'push', label: 'Push Notifications', desc: 'Receive instant alerts' },
                { key: 'reminders', label: 'Task Reminders', desc: 'Never miss a deadline' },
              ].map((item) => (
                <label key={item.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white">{item.label}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <div
                    className={`w-12 h-7 rounded-full transition-colors ${
                      formData.notifications[item.key] ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                    onClick={() => updateFormData('notifications', { ...formData.notifications, [item.key]: !formData.notifications[item.key] })}
                  >
                    <div className={`w-5 h-5 mt-1 ml-1 bg-white rounded-full transition-transform ${
                      formData.notifications[item.key] ? 'translate-x-5' : ''
                    }`} />
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-8 pb-8 flex items-center justify-between">
          <button
            onClick={prevStep}
            className={`flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 ${currentStep === 0 ? 'invisible' : ''}`}
          >
            <FaArrowLeft className="mr-2" /> Back
          </button>
          <button
            onClick={nextStep}
            className="flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Continue'} <FaArrowRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;


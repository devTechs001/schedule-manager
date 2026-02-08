import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaTimes, FaCalendarAlt, FaTasks, FaBrain, FaUsers, FaBell, FaRocket } from 'react-icons/fa';
import { useAIContext } from '@contexts/AIContext';

const Tour = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const { aiEnabled, setAiEnabled } = useAIContext();

  const slides = [
    {
      icon: FaCalendarAlt,
      title: 'Smart Calendar',
      description: 'View and manage all your events in one place. Our AI helps you find the best times for meetings and prevents scheduling conflicts.',
      image: '/tour/calendar.png',
      color: 'blue',
    },
    {
      icon: FaTasks,
      title: 'Task Management',
      description: 'Create tasks, set priorities, and track progress. Use drag-and-drop to organize your workflow effortlessly.',
      image: '/tour/tasks.png',
      color: 'green',
    },
    {
      icon: FaBrain,
      title: 'AI Assistant',
      description: 'Get intelligent suggestions for task prioritization, optimal scheduling, and productivity improvements. Toggle AI features here:',
      image: '/tour/ai.png',
      color: 'purple',
      hasToggle: true,
    },
    {
      icon: FaUsers,
      title: 'Team Collaboration',
      description: 'Work together with your team. Share calendars, assign tasks, and communicate in real-time.',
      image: '/tour/team.png',
      color: 'orange',
    },
    {
      icon: FaBell,
      title: 'Smart Notifications',
      description: 'Stay informed with intelligent alerts. Get reminded at the right time, never miss important deadlines.',
      image: '/tour/notifications.png',
      color: 'red',
    },
    {
      icon: FaRocket,
      title: "You're All Set!",
      description: "You're ready to supercharge your productivity. Let's get started!",
      image: '/tour/complete.png',
      color: 'indigo',
      isLast: true,
    },
  ];

  const slide = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      // Mark onboarding as complete when tour finishes
      localStorage.setItem('onboardingComplete', 'true');
      navigate('/register'); // Go to registration after tour completion
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  const handleSkip = () => {
    // Mark onboarding as complete when skipped
    localStorage.setItem('onboardingComplete', 'true');
    navigate('/login'); // Go to login if tour is skipped
  };

  const toggleAI = () => {
    setAiEnabled(!aiEnabled);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Skip button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={handleSkip}
            className="flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Skip Tour <FaTimes className="ml-2" />
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            {/* Illustration Side */}
            <div className={`bg-${slide.color}-500 p-12 flex items-center justify-center`}>
              <div className="text-center">
                <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <slide.icon className="text-5xl text-white" />
                </div>
                <div className="w-64 h-48 bg-white/10 rounded-xl mx-auto flex items-center justify-center">
                  {slide.hasToggle ? (
                    <div className="flex flex-col items-center">
                      <span className="text-white/50 mb-4">AI Assistant</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={aiEnabled}
                          onChange={toggleAI}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        <span className="ml-3 text-sm font-medium text-white">
                          {aiEnabled ? 'ON' : 'OFF'}
                        </span>
                      </label>
                    </div>
                  ) : (
                    <span className="text-white/50">Preview Image</span>
                  )}
                </div>
              </div>
            </div>

            {/* Content Side */}
            <div className="p-12 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                  {slide.title}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {slide.description}
                </p>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center space-x-2 my-8">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide
                        ? `bg-${slide.color}-500`
                        : 'bg-gray-200 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <button
                  onClick={prevSlide}
                  className={`flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white ${
                    currentSlide === 0 ? 'invisible' : ''
                  }`}
                >
                  <FaChevronLeft className="mr-2" /> Previous
                </button>
                <button
                  onClick={nextSlide}
                  className={`flex items-center px-6 py-3 bg-${slide.color}-500 hover:bg-${slide.color}-600 text-white font-medium rounded-xl`}
                >
                  {slide.isLast ? 'Get Started' : 'Next'} <FaChevronRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard hint */}
        <p className="text-center text-gray-400 dark:text-gray-500 mt-4 text-sm">
          Use arrow keys to navigate
        </p>
      </div>
    </div>
  );
};

export default Tour;


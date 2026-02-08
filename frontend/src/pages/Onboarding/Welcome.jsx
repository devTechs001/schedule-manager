import { FaRocket, FaCalendarAlt, FaTasks, FaBrain, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  // Mark splash screen as seen when component mounts
  if (typeof window !== 'undefined') {
    localStorage.setItem('seenSplash', 'true');
  }

  const features = [
    { icon: FaCalendarAlt, title: 'Smart Scheduling', description: 'AI-powered calendar management' },
    { icon: FaTasks, title: 'Task Management', description: 'Organize and prioritize with ease' },
    { icon: FaBrain, title: 'AI Assistant', description: 'Get intelligent suggestions' },
  ];

  const handleGetStarted = () => {
    navigate('/tour');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Logo & Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl mb-6">
            <FaRocket className="text-4xl text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome to Schedule Manager
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Your AI-powered productivity companion. Manage tasks, schedule smarter, and achieve more.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center transform hover:scale-105 transition-transform"
            >
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="text-2xl text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={handleGetStarted}
            className="w-full sm:w-auto flex items-center justify-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors"
          >
            Get Started <FaArrowRight className="ml-2" />
          </button>
          <button
            onClick={handleSignIn}
            className="w-full sm:w-auto px-8 py-4 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
          >
            I already have an account
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-white/50 mt-12 text-sm">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Welcome;


import React, { useState } from 'react';
import { FaUserFriends, FaBrain, FaTasks, FaCheck, FaClock, FaChartLine, FaArrowRight } from 'react-icons/fa';

const SmartDelegation = ({ task = null, teamMembers = [], onDelegate }) => {
  const [selectedMember, setSelectedMember] = useState(null);

  const defaultTask = {
    id: 1,
    title: 'Create Q1 Marketing Report',
    description: 'Compile and analyze marketing metrics for Q1',
    priority: 'high',
    estimatedTime: '4 hours',
    skills: ['analytics', 'marketing', 'reporting'],
  };

  const defaultMembers = [
    { id: 1, name: 'Sarah Wilson', avatar: 'S', role: 'Marketing Analyst', skills: ['analytics', 'marketing', 'reporting'], workload: 65, matchScore: 95, availability: 'available' },
    { id: 2, name: 'Mike Chen', avatar: 'M', role: 'Data Analyst', skills: ['analytics', 'data', 'reporting'], workload: 80, matchScore: 78, availability: 'busy' },
    { id: 3, name: 'Emily Davis', avatar: 'E', role: 'Marketing Manager', skills: ['marketing', 'strategy', 'leadership'], workload: 50, matchScore: 72, availability: 'available' },
    { id: 4, name: 'James Brown', avatar: 'J', role: 'Junior Analyst', skills: ['analytics', 'research'], workload: 40, matchScore: 65, availability: 'available' },
  ];

  const currentTask = task || defaultTask;
  const members = teamMembers.length > 0 ? teamMembers : defaultMembers;
  const sortedMembers = [...members].sort((a, b) => b.matchScore - a.matchScore);

  const getWorkloadColor = (workload) => {
    if (workload < 50) return 'green';
    if (workload < 80) return 'yellow';
    return 'red';
  };

  const handleDelegate = () => {
    if (selectedMember) {
      onDelegate?.(currentTask, selectedMember);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaUserFriends className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Delegation</h3>
        </div>
        <span className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
          <FaBrain /> AI Powered
        </span>
      </div>

      {/* Task to Delegate */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <FaTasks />
          <span>Task to Delegate</span>
        </div>
        <h4 className="font-medium text-gray-900 dark:text-white">{currentTask.title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{currentTask.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {currentTask.skills.map((skill) => (
            <span key={skill} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <FaClock /> {currentTask.estimatedTime}
          </span>
          <span className="capitalize px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
            {currentTask.priority} priority
          </span>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="mb-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          <FaBrain className="text-purple-500" />
          <span>AI Recommendations</span>
        </div>
      </div>

      {/* Team Members */}
      <div className="space-y-3 mb-6">
        {sortedMembers.map((member, index) => {
          const workloadColor = getWorkloadColor(member.workload);
          const isRecommended = index === 0;
          const isSelected = selectedMember?.id === member.id;
          
          return (
            <button
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                isSelected
                  ? 'border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : isRecommended
                  ? 'border-2 border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                  : 'border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                      {isRecommended && (
                        <span className="px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                          Best Match
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        member.availability === 'available'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {member.availability}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{member.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <FaChartLine className="text-purple-500" />
                    <span className="font-bold text-gray-900 dark:text-white">{member.matchScore}%</span>
                    <span className="text-gray-500">match</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">Workload:</span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${workloadColor}-500`}
                        style={{ width: `${member.workload}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{member.workload}%</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Delegate Button */}
      <button
        onClick={handleDelegate}
        disabled={!selectedMember}
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-white ${
          selectedMember
            ? 'bg-primary-600 hover:bg-primary-700'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        <span>Delegate to {selectedMember?.name || 'Select a team member'}</span>
        <FaArrowRight />
      </button>
    </div>
  );
};

export default SmartDelegation;


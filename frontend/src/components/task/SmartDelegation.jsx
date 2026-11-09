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


  const currentTask = task || defaultTask;
;
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
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaUserFriends className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Smart Delegation</h3>
        </div>
        <span className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
          <FaBrain /> AI Powered
        </span>
      </div>

      {/* Task to Delegate */}
      <div className="mb-6 p-4 bg-surface-sunken rounded-lg">
        <div className="flex items-center gap-2 text-sm text-content-muted mb-2">
          <FaTasks />
          <span>Task to Delegate</span>
        </div>
        <h4 className="font-medium text-content">{currentTask.title}</h4>
        <p className="text-sm text-content-muted mt-1">{currentTask.description}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {currentTask.skills.map((skill) => (
            <span key={skill} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-xs rounded-full">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-3 text-sm text-content-muted">
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
        <div className="flex items-center gap-2 text-sm font-medium text-content mb-3">
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
                  : 'border-2 border-line hover:border-line'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-content">{member.name}</span>
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
                    <span className="text-sm text-content-muted">{member.role}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm">
                    <FaChartLine className="text-purple-500" />
                    <span className="font-bold text-content">{member.matchScore}%</span>
                    <span className="text-content-muted">match</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-content-muted">Workload:</span>
                    <div className="w-16 h-2 bg-surface-sunken rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${workloadColor}-500`}
                        style={{ width: `${member.workload}%` }}
                      />
                    </div>
                    <span className="text-xs text-content-muted">{member.workload}%</span>
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
            : 'bg-surface-sunken cursor-not-allowed'
        }`}
      >
        <span>Delegate to {selectedMember?.name || 'Select a team member'}</span>
        <FaArrowRight />
      </button>
    </div>
  );
};

export default SmartDelegation;


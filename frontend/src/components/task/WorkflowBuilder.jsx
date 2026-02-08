import React, { useState } from 'react';
import { FaProjectDiagram, FaPlus, FaTrash, FaArrowRight, FaPlay, FaSave, FaCog, FaTasks, FaEnvelope, FaBell, FaCheck } from 'react-icons/fa';

const WorkflowBuilder = ({ workflow: initialWorkflow = null, onSave, onRun }) => {
  const [workflow, setWorkflow] = useState(initialWorkflow || {
    name: 'New Workflow',
    trigger: 'task_created',
    steps: [
      { id: 1, type: 'condition', config: { field: 'priority', operator: 'equals', value: 'high' } },
      { id: 2, type: 'action', config: { action: 'notify', recipient: 'manager' } },
    ],
  });

  const triggers = [
    { id: 'task_created', name: 'Task Created', icon: FaTasks },
    { id: 'task_completed', name: 'Task Completed', icon: FaCheck },
    { id: 'deadline_approaching', name: 'Deadline Approaching', icon: FaBell },
  ];

  const stepTypes = [
    { type: 'condition', name: 'Condition', icon: FaCog, color: 'yellow' },
    { type: 'action', name: 'Action', icon: FaPlay, color: 'green' },
    { type: 'notification', name: 'Send Notification', icon: FaBell, color: 'blue' },
    { type: 'email', name: 'Send Email', icon: FaEnvelope, color: 'purple' },
  ];

  const addStep = (type) => {
    const newStep = {
      id: Date.now(),
      type,
      config: {},
    };
    setWorkflow({ ...workflow, steps: [...workflow.steps, newStep] });
  };

  const removeStep = (id) => {
    setWorkflow({ ...workflow, steps: workflow.steps.filter(s => s.id !== id) });
  };

  const getStepIcon = (type) => {
    return stepTypes.find(s => s.type === type)?.icon || FaCog;
  };

  const getStepColor = (type) => {
    return stepTypes.find(s => s.type === type)?.color || 'gray';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaProjectDiagram className="text-primary-600 text-xl" />
          <input
            type="text"
            value={workflow.name}
            onChange={(e) => setWorkflow({ ...workflow, name: e.target.value })}
            className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 outline-none"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onRun?.(workflow)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
          >
            <FaPlay /> Test
          </button>
          <button
            onClick={() => onSave?.(workflow)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm"
          >
            <FaSave /> Save
          </button>
        </div>
      </div>

      {/* Trigger Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">When this happens...</h4>
        <div className="flex gap-2">
          {triggers.map((trigger) => (
            <button
              key={trigger.id}
              onClick={() => setWorkflow({ ...workflow, trigger: trigger.id })}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 ${
                workflow.trigger === trigger.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <trigger.icon className={workflow.trigger === trigger.id ? 'text-primary-600' : 'text-gray-400'} />
              <span className="text-sm text-gray-900 dark:text-white">{trigger.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Do this...</h4>
        <div className="space-y-3">
          {workflow.steps.map((step, index) => {
            const StepIcon = getStepIcon(step.type);
            const color = getStepColor(step.type);
            
            return (
              <div key={step.id} className="relative">
                {index > 0 && (
                  <div className="absolute left-6 -top-3 w-0.5 h-3 bg-gray-300 dark:bg-gray-600" />
                )}
                <div className={`flex items-center gap-4 p-4 rounded-lg border-2 border-${color}-200 dark:border-${color}-700 bg-${color}-50 dark:bg-${color}-900/20`}>
                  <div className={`w-10 h-10 rounded-full bg-${color}-100 dark:bg-${color}-900/50 flex items-center justify-center`}>
                    <StepIcon className={`text-${color}-600`} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {step.type}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {step.type === 'condition' && 'Check if condition is met'}
                      {step.type === 'action' && 'Perform an action'}
                      {step.type === 'notification' && 'Send a push notification'}
                      {step.type === 'email' && 'Send an email'}
                    </p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <FaCog />
                  </button>
                  <button
                    onClick={() => removeStep(step.id)}
                    className="p-2 text-red-400 hover:text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
                {index < workflow.steps.length - 1 && (
                  <div className="flex justify-center my-1">
                    <FaArrowRight className="text-gray-400" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Step */}
      <div className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
        <p className="text-sm text-gray-500 text-center mb-3">Add a step</p>
        <div className="flex justify-center gap-2">
          {stepTypes.map((stepType) => (
            <button
              key={stepType.type}
              onClick={() => addStep(stepType.type)}
              className={`flex items-center gap-2 px-3 py-2 bg-${stepType.color}-100 dark:bg-${stepType.color}-900/30 text-${stepType.color}-700 dark:text-${stepType.color}-300 rounded-lg text-sm hover:opacity-80`}
            >
              <FaPlus className="text-xs" />
              <stepType.icon />
              {stepType.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;


import React, { useState } from 'react';
import { FaLayerGroup, FaCheck, FaTrash, FaTag, FaCalendarAlt, FaUserPlus, FaArchive, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const BulkOperations = ({ tasks: initialTasks = [], onApply, onCancel }) => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [operation, setOperation] = useState(null);
  const [operationValue, setOperationValue] = useState('');


  const tasks = initialTasks;

  const operations = [
    { id: 'complete', name: 'Mark Complete', icon: FaCheck, color: 'green' },
    { id: 'delete', name: 'Delete', icon: FaTrash, color: 'red', danger: true },
    { id: 'priority', name: 'Change Priority', icon: FaTag, color: 'yellow', hasValue: true, options: ['high', 'medium', 'low'] },
    { id: 'reschedule', name: 'Reschedule', icon: FaCalendarAlt, color: 'blue', hasValue: true, type: 'date' },
    { id: 'assign', name: 'Assign To', icon: FaUserPlus, color: 'purple', hasValue: true },
    { id: 'archive', name: 'Archive', icon: FaArchive, color: 'gray' },
  ];

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(selectedIds.length === tasks.length ? [] : tasks.map(t => t.id));
  };

  const handleApply = () => {
    if (!operation || selectedIds.length === 0) return;
    onApply?.({
      operation: operation.id,
      taskIds: selectedIds,
      value: operationValue,
    });
    setSelectedIds([]);
    setOperation(null);
    setOperationValue('');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'yellow';
      default: return 'blue';
    }
  };

  return (
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaLayerGroup className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">Bulk Operations</h3>
          {selectedIds.length > 0 && (
            <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm">
              {selectedIds.length} selected
            </span>
          )}
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={() => setSelectedIds([])}
            className="text-content-muted hover:text-content"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Select All */}
      <div className="flex items-center justify-between mb-4 p-3 bg-surface-sunken rounded-lg">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedIds.length === tasks.length && tasks.length > 0}
            onChange={selectAll}
            className="w-5 h-5 rounded text-primary-600"
          />
          <span className="text-sm text-content">Select All</span>
        </label>
        <span className="text-sm text-content-muted">{tasks.length} tasks</span>
      </div>

      {/* Task List */}
      <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
        {tasks.map((task) => (
          <label
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
              selectedIds.includes(task.id)
                ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-300 dark:border-primary-700'
                : 'bg-surface-sunken bg-surface-sunken border-2 border-transparent'
            }`}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(task.id)}
              onChange={() => toggleSelect(task.id)}
              className="w-5 h-5 rounded text-primary-600"
            />
            <div className="flex-1">
              <p className="text-sm font-medium text-content">{task.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-xs rounded-full bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-700`}>
                  {task.priority}
                </span>
                <span className="text-xs text-content-muted">
                  Due {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
          </label>
        ))}
      </div>

      {/* Operations */}
      {selectedIds.length > 0 && (
        <div className="border-t border-line pt-4">
          <p className="text-sm font-medium text-content mb-3">Choose operation:</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {operations.map((op) => (
              <button
                key={op.id}
                onClick={() => { setOperation(op); setOperationValue(''); }}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                  operation?.id === op.id
                    ? `bg-${op.color}-100 dark:bg-${op.color}-900/30 text-${op.color}-700 dark:text-${op.color}-300 border-2 border-${op.color}-300`
                    : 'bg-surface-sunken bg-surface-sunken text-content border-2 border-transparent'
                }`}
              >
                <op.icon />
                {op.name}
              </button>
            ))}
          </div>

          {/* Operation Value Input */}
          {operation?.hasValue && (
            <div className="mb-4">
              {operation.options ? (
                <select
                  value={operationValue}
                  onChange={(e) => setOperationValue(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-surface-sunken border-line"
                >
                  <option value="">Select {operation.name.toLowerCase()}</option>
                  {operation.options.map((opt) => (
                    <option key={opt} value={opt} className="capitalize">{opt}</option>
                  ))}
                </select>
              ) : operation.type === 'date' ? (
                <input
                  type="date"
                  value={operationValue}
                  onChange={(e) => setOperationValue(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-surface-sunken border-line"
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Enter ${operation.name.toLowerCase()}`}
                  value={operationValue}
                  onChange={(e) => setOperationValue(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg bg-surface-sunken border-line"
                />
              )}
            </div>
          )}

          {/* Warning for dangerous operations */}
          {operation?.danger && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg mb-4">
              <FaExclamationTriangle />
              <span className="text-sm">This action cannot be undone.</span>
            </div>
          )}

          {/* Apply Button */}
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              disabled={!operation || (operation.hasValue && !operationValue)}
              className={`flex-1 py-3 rounded-lg text-white ${
                operation?.danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary-600 hover:bg-primary-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Apply to {selectedIds.length} task{selectedIds.length > 1 ? 's' : ''}
            </button>
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-surface-sunken text-content rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkOperations;


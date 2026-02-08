import React, { useState } from 'react';
import { FaClipboardCheck, FaCheck, FaTimes, FaClock, FaUser, FaArrowRight } from 'react-icons/fa';

const ApprovalWorkflows = ({ workflows: initialWorkflows = [], onApprove, onReject }) => {
  const [workflows, setWorkflows] = useState(initialWorkflows);
  const [filter, setFilter] = useState('pending');

  const updateStatus = (workflowId, status) => {
    setWorkflows(workflows.map(w =>
      w.id === workflowId ? { ...w, status, updatedAt: new Date() } : w
    ));
    if (status === 'approved') onApprove?.(workflowId);
    if (status === 'rejected') onReject?.(workflowId);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'green';
      case 'rejected': return 'red';
      case 'pending': return 'yellow';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheck className="text-green-500" />;
      case 'rejected': return <FaTimes className="text-red-500" />;
      case 'pending': return <FaClock className="text-yellow-500" />;
      default: return null;
    }
  };

  const filteredWorkflows = workflows.filter(w =>
    filter === 'all' || w.status === filter
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaClipboardCheck className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Approval Workflows
          </h3>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredWorkflows.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No {filter !== 'all' ? filter : ''} approval requests
          </p>
        ) : (
          filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(workflow.status)}
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {workflow.title}
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {workflow.description}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full bg-${getStatusColor(workflow.status)}-100 text-${getStatusColor(workflow.status)}-700 capitalize`}>
                  {workflow.status}
                </span>
              </div>

              {/* Approval Chain */}
              <div className="flex items-center gap-2 mb-3 text-sm">
                <span className="text-gray-500">Approvers:</span>
                {workflow.approvers?.map((approver, i) => (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">
                        {approver.name?.[0]}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">{approver.name}</span>
                      {approver.approved && <FaCheck className="text-green-500 text-xs" />}
                    </div>
                    {i < workflow.approvers.length - 1 && (
                      <FaArrowRight className="text-gray-400 text-xs" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Requester Info */}
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-3">
                <FaUser />
                <span>Requested by {workflow.requester?.name}</span>
                <span>•</span>
                <span>{new Date(workflow.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Actions */}
              {workflow.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateStatus(workflow.id, 'approved')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                  >
                    <FaCheck /> Approve
                  </button>
                  <button
                    onClick={() => updateStatus(workflow.id, 'rejected')}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalWorkflows;


import React, { useState } from 'react';
import { FaClipboardCheck, FaCheck, FaTimes, FaClock, FaUser, FaArrowRight } from 'react-icons/fa';

/** Static tone classes — Tailwind cannot generate `bg-${x}-100`. */
const STATUS_TONE = {
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300',
  approved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300',
  rejected: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
  draft: 'bg-surface-sunken text-content-muted',
};


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
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaClipboardCheck className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-content">
            Approval Workflows
          </h3>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-2 border border-line rounded-lg bg-white bg-surface-sunken text-content"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredWorkflows.length === 0 ? (
          <p className="text-center text-content-muted py-8">
            No {filter !== 'all' ? filter : ''} approval requests
          </p>
        ) : (
          filteredWorkflows.map((workflow) => (
            <div
              key={workflow.id}
              className="p-4 bg-surface-sunken rounded-lg"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusIcon(workflow.status)}
                    <h4 className="font-medium text-content">
                      {workflow.title}
                    </h4>
                  </div>
                  <p className="text-sm text-content-muted">
                    {workflow.description}
                  </p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${STATUS_TONE[workflow.status] || "bg-surface-sunken text-content-muted"}`}>
                  {workflow.status}
                </span>
              </div>

              {/* Approval Chain */}
              <div className="flex items-center gap-2 mb-3 text-sm">
                <span className="text-content-muted">Approvers:</span>
                {workflow.approvers?.map((approver, i) => (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-1">
                      <div className="w-6 h-6 rounded-full bg-primary-500 text-white flex items-center justify-center text-xs">
                        {approver.name?.[0]}
                      </div>
                      <span className="text-content">{approver.name}</span>
                      {approver.approved && <FaCheck className="text-green-500 text-xs" />}
                    </div>
                    {i < workflow.approvers.length - 1 && (
                      <FaArrowRight className="text-content-subtle text-xs" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              {/* Requester Info */}
              <div className="flex items-center gap-2 text-sm text-content-muted mb-3">
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


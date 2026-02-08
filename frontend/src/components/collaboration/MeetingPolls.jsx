import React, { useState } from 'react';
import { FaPoll, FaPlus, FaCheck, FaTrash, FaVoteYea } from 'react-icons/fa';

const MeetingPolls = ({ polls: initialPolls = [], onVote, onCreate }) => {
  const [polls, setPolls] = useState(initialPolls);
  const [showCreate, setShowCreate] = useState(false);
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });

  const addOption = () => {
    setNewPoll({ ...newPoll, options: [...newPoll.options, ''] });
  };

  const updateOption = (index, value) => {
    const options = [...newPoll.options];
    options[index] = value;
    setNewPoll({ ...newPoll, options });
  };

  const removeOption = (index) => {
    if (newPoll.options.length <= 2) return;
    const options = newPoll.options.filter((_, i) => i !== index);
    setNewPoll({ ...newPoll, options });
  };

  const createPoll = () => {
    if (!newPoll.question.trim() || newPoll.options.some(o => !o.trim())) return;
    const poll = {
      id: Date.now(),
      ...newPoll,
      options: newPoll.options.map(text => ({ text, votes: 0, voters: [] })),
      createdAt: new Date(),
      active: true,
    };
    setPolls([poll, ...polls]);
    onCreate?.(poll);
    setNewPoll({ question: '', options: ['', ''] });
    setShowCreate(false);
  };

  const vote = (pollId, optionIndex) => {
    const updated = polls.map(poll => {
      if (poll.id !== pollId) return poll;
      const options = poll.options.map((opt, i) => ({
        ...opt,
        votes: i === optionIndex ? opt.votes + 1 : opt.votes,
      }));
      return { ...poll, options };
    });
    setPolls(updated);
    onVote?.(pollId, optionIndex);
  };

  const getTotalVotes = (poll) => poll.options.reduce((sum, opt) => sum + opt.votes, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <FaPoll className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meeting Polls</h3>
        </div>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
        >
          <FaPlus /> Create Poll
        </button>
      </div>

      {showCreate && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
          <input
            type="text"
            value={newPoll.question}
            onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
            placeholder="Poll question"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          {newPoll.options.map((option, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={option}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              {newPoll.options.length > 2 && (
                <button onClick={() => removeOption(i)} className="p-2 text-red-500"><FaTrash /></button>
              )}
            </div>
          ))}
          <button onClick={addOption} className="text-sm text-primary-600 hover:text-primary-700">
            + Add Option
          </button>
          <button
            onClick={createPoll}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
          >
            Create Poll
          </button>
        </div>
      )}

      <div className="space-y-4">
        {polls.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No polls yet. Create one to gather team feedback!
          </p>
        ) : (
          polls.map((poll) => {
            const total = getTotalVotes(poll);
            return (
              <div key={poll.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">{poll.question}</h4>
                <div className="space-y-2">
                  {poll.options.map((option, i) => {
                    const percentage = total > 0 ? Math.round((option.votes / total) * 100) : 0;
                    return (
                      <button
                        key={i}
                        onClick={() => vote(poll.id, i)}
                        className="w-full text-left"
                      >
                        <div className="relative p-3 bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-0 bg-primary-100 dark:bg-primary-900/30"
                            style={{ width: `${percentage}%` }}
                          />
                          <div className="relative flex items-center justify-between">
                            <span className="text-gray-900 dark:text-white">{option.text}</span>
                            <span className="text-sm text-gray-500">{percentage}% ({option.votes})</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-sm text-gray-500 mt-2">{total} total votes</p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MeetingPolls;


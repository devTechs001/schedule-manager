import React, { useState, useCallback } from 'react';
import { FaUsers, FaClipboardList, FaClock, FaRobot, FaPlay, FaPause } from 'react-icons/fa';

const MeetingAssistant = ({ meeting, onActionItemsExtracted, onSummaryGenerated }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [summary, setSummary] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const toggleRecording = useCallback(() => {
    setIsRecording(!isRecording);
  }, [isRecording]);

  const extractActionItems = async () => {
    if (!transcript) return;
    setIsProcessing(true);
    
    // Simulate AI extraction
    setTimeout(() => {
      const items = [
        { id: 1, text: 'Follow up with design team', assignee: 'John', dueDate: new Date(Date.now() + 86400000) },
        { id: 2, text: 'Review project timeline', assignee: 'Sarah', dueDate: new Date(Date.now() + 172800000) },
        { id: 3, text: 'Schedule next standup', assignee: 'You', dueDate: new Date(Date.now() + 259200000) },
      ];
      setActionItems(items);
      onActionItemsExtracted?.(items);
      setIsProcessing(false);
    }, 1500);
  };

  const generateSummary = async () => {
    if (!transcript) return;
    setIsProcessing(true);
    
    setTimeout(() => {
      const generatedSummary = `Meeting discussed project progress and upcoming deadlines. Key decisions included prioritizing feature X and allocating resources for Q2. Next steps involve finalizing designs and beginning development sprint.`;
      setSummary(generatedSummary);
      onSummaryGenerated?.(generatedSummary);
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaUsers className="text-primary-600 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Meeting Assistant
        </h3>
      </div>

      {meeting && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h4>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
            <FaClock />
            <span>{new Date(meeting.start).toLocaleTimeString()}</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleRecording}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-600 hover:bg-primary-700'
            } text-white transition-colors`}
          >
            {isRecording ? <FaPause /> : <FaPlay />}
            {isRecording ? 'Stop Recording' : 'Start Recording'}
          </button>
          {isRecording && <span className="text-red-500 animate-pulse">● Recording</span>}
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Meeting transcript will appear here, or paste your notes..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />

        <div className="flex gap-3">
          <button
            onClick={extractActionItems}
            disabled={!transcript || isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
          >
            <FaClipboardList /> Extract Actions
          </button>
          <button
            onClick={generateSummary}
            disabled={!transcript || isProcessing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            <FaRobot /> Generate Summary
          </button>
        </div>

        {actionItems.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Action Items</h4>
            <ul className="space-y-2">
              {actionItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <span className="text-gray-800 dark:text-gray-200">{item.text}</span>
                  <span className="text-sm text-gray-500">@{item.assignee}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {summary && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h4>
            <p className="text-gray-700 dark:text-gray-300">{summary}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingAssistant;


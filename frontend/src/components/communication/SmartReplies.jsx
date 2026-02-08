import React, { useState } from 'react';
import { FaMagic, FaPaperPlane, FaEdit, FaRedo, FaThumbsUp, FaThumbsDown } from 'react-icons/fa';

const SmartReplies = ({ originalMessage, onSend, onEdit }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReply, setSelectedReply] = useState(null);
  const [customReply, setCustomReply] = useState('');
  const [tone, setTone] = useState('professional');

  const tones = [
    { value: 'professional', label: 'Professional' },
    { value: 'friendly', label: 'Friendly' },
    { value: 'brief', label: 'Brief' },
    { value: 'detailed', label: 'Detailed' },
  ];

  const generateReplies = async () => {
    setIsGenerating(true);
    // Simulate AI-generated replies
    setTimeout(() => {
      const mockReplies = [
        {
          id: 1,
          text: "Thank you for your message. I'll review this and get back to you by end of day.",
          tone: 'professional',
        },
        {
          id: 2,
          text: "Got it! Let me look into this and I'll follow up shortly.",
          tone: 'friendly',
        },
        {
          id: 3,
          text: "Acknowledged. Will respond with details soon.",
          tone: 'brief',
        },
      ];
      setSuggestions(mockReplies);
      setIsGenerating(false);
    }, 1500);
  };

  const handleSend = () => {
    const text = selectedReply ? suggestions.find(s => s.id === selectedReply)?.text : customReply;
    if (text) {
      onSend?.(text);
    }
  };

  const handleEdit = (text) => {
    setCustomReply(text);
    setSelectedReply(null);
    onEdit?.(text);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <FaMagic className="text-primary-600 text-xl" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Smart Replies</h3>
        </div>
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        >
          {tones.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Original Message Context */}
      {originalMessage && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Replying to:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{originalMessage}</p>
        </div>
      )}

      {/* Generate Button */}
      {suggestions.length === 0 && (
        <button
          onClick={generateReplies}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              Generating...
            </>
          ) : (
            <>
              <FaMagic /> Generate Smart Replies
            </>
          )}
        </button>
      )}

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3 mb-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              onClick={() => setSelectedReply(suggestion.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedReply === suggestion.id
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <p className="text-gray-700 dark:text-gray-300 mb-2">{suggestion.text}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 capitalize">{suggestion.tone}</span>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(suggestion.text); }}
                    className="p-1 text-gray-400 hover:text-primary-600"
                  >
                    <FaEdit />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-green-600">
                    <FaThumbsUp />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600">
                    <FaThumbsDown />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={generateReplies}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-primary-600 hover:text-primary-700"
          >
            <FaRedo /> Regenerate
          </button>
        </div>
      )}

      {/* Custom Reply */}
      <div className="mt-4">
        <textarea
          value={customReply}
          onChange={(e) => { setCustomReply(e.target.value); setSelectedReply(null); }}
          placeholder="Or write your own reply..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
      </div>

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={!selectedReply && !customReply.trim()}
        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
      >
        <FaPaperPlane /> Send Reply
      </button>
    </div>
  );
};

export default SmartReplies;


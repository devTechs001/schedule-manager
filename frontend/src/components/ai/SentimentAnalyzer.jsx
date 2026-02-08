import React, { useState } from 'react';
import { FaSmile, FaMeh, FaFrown, FaChartBar, FaSpinner } from 'react-icons/fa';

const SentimentAnalyzer = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSentiment = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

    // Simulate sentiment analysis
    setTimeout(() => {
      const words = text.toLowerCase();
      let positive = 0, negative = 0;
      
      const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'wonderful', 'amazing', 'fantastic'];
      const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'horrible', 'disappointed', 'angry', 'sad'];
      
      positiveWords.forEach(w => { if (words.includes(w)) positive++; });
      negativeWords.forEach(w => { if (words.includes(w)) negative++; });

      const total = positive + negative || 1;
      const score = (positive - negative) / total;
      
      const analysis = {
        sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
        score: Math.round((score + 1) * 50),
        confidence: 0.75 + Math.random() * 0.2,
        emotions: {
          joy: Math.random() * 0.5 + (score > 0 ? 0.3 : 0.1),
          anger: Math.random() * 0.3 + (score < 0 ? 0.2 : 0.05),
          sadness: Math.random() * 0.3 + (score < 0 ? 0.2 : 0.05),
          surprise: Math.random() * 0.3,
          fear: Math.random() * 0.2,
        },
      };
      setResult(analysis);
      onAnalyze?.(analysis);
      setIsAnalyzing(false);
    }, 1000);
  };

  const getSentimentIcon = () => {
    if (!result) return null;
    if (result.sentiment === 'positive') return <FaSmile className="text-green-500 text-4xl" />;
    if (result.sentiment === 'negative') return <FaFrown className="text-red-500 text-4xl" />;
    return <FaMeh className="text-yellow-500 text-4xl" />;
  };

  const getSentimentColor = () => {
    if (!result) return 'gray';
    if (result.sentiment === 'positive') return 'green';
    if (result.sentiment === 'negative') return 'red';
    return 'yellow';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaChartBar className="text-primary-600 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Sentiment Analyzer
        </h3>
      </div>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze sentiment..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />

        <button
          onClick={analyzeSentiment}
          disabled={!text.trim() || isAnalyzing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
        >
          {isAnalyzing ? <FaSpinner className="animate-spin" /> : <FaChartBar />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Sentiment'}
        </button>

        {result && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-center gap-4 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {getSentimentIcon()}
              <div>
                <p className={`text-2xl font-bold text-${getSentimentColor()}-600 capitalize`}>
                  {result.sentiment}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(result.confidence * 100)}% confidence
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Emotion Breakdown</h4>
              <div className="space-y-2">
                {Object.entries(result.emotions).map(([emotion, value]) => (
                  <div key={emotion} className="flex items-center gap-3">
                    <span className="w-20 text-sm text-gray-600 dark:text-gray-400 capitalize">{emotion}</span>
                    <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(value * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sentiment Score</span>
                <span className={`text-xl font-bold text-${getSentimentColor()}-600`}>
                  {result.score}/100
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentimentAnalyzer;


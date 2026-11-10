import React, { useState } from 'react';
import { FaSmile, FaMeh, FaFrown, FaChartBar, FaSpinner } from 'react-icons/fa';

/** Static tone classes — Tailwind cannot generate `text-${x}-600`. */
const SENTIMENT_TONE = {
  positive: 'text-emerald-600 dark:text-emerald-400',
  negative: 'text-rose-600 dark:text-rose-400',
  neutral: 'text-content-muted',
};


const SentimentAnalyzer = ({ onAnalyze }) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeSentiment = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);

    /*
     * This is a small lexicon-based score, computed synchronously from the
     * text on screen. The previous version wrapped it in a one-second
     * setTimeout to look like a network call and topped it off with
     * Math.random() "emotions" and "confidence" — numbers that had no
     * relationship to the sentence. Lexicon scoring is coarse but it is
     * explainable, so the result reports which words it matched.
     */
    const words = text.toLowerCase();
    const negatives = /\b(not|no|never|isn't|wasn't|don't|doesn't)\b/.test(words);

    const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'wonderful', 'amazing', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'horrible', 'disappointed', 'angry', 'sad'];

    const matchedPositive = positiveWords.filter((word) => words.includes(word));
    const matchedNegative = negativeWords.filter((word) => words.includes(word));

    // A leading negation inverts the polarity of the matches.
    const positive = negatives ? matchedNegative.length : matchedPositive.length;
    const negative = negatives ? matchedPositive.length : matchedNegative.length;

    const total = positive + negative || 1;
    const score = (positive - negative) / total;

    const analysis = {
      sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
      // Normalised 0-100 where 50 is neutral.
      score: Math.round((score + 1) * 50),
      positiveMatches: matchedPositive,
      negativeMatches: matchedNegative,
      method: 'lexicon',
      wordCount: text.trim().split(/\s+/).filter(Boolean).length,
    };

    setResult(analysis);
    onAnalyze?.(analysis);
    setIsAnalyzing(false);
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
    <div className="bg-surface rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaChartBar className="text-primary-600 text-xl" />
        <h3 className="text-lg font-semibold text-content">
          Sentiment Analyzer
        </h3>
      </div>

      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze sentiment..."
          rows={4}
          className="w-full px-3 py-2 border border-line rounded-lg bg-white bg-surface-sunken text-content"
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
            <div className="flex items-center justify-center gap-4 p-6 bg-surface-sunken rounded-lg">
              {getSentimentIcon()}
              <div>
                <p className={`text-2xl font-bold capitalize ${SENTIMENT_TONE[getSentimentColor()] || "text-content"}`}>
                  {result.sentiment}
                </p>
                <p className="text-sm text-content-muted">
                  score {result.score}/100 · {result.wordCount} words
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-surface-sunken p-4">
              <h4 className="mb-2 font-medium text-content">Matched words</h4>
              {result.positiveMatches.length === 0 && result.negativeMatches.length === 0 ? (
                <p className="text-sm text-content-muted">
                  None of the scored words appear in this text, so the result is neutral by default.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {result.positiveMatches.map((word) => (
                    <span key={`p-${word}`} className="rounded bg-emerald-100 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                      {word}
                    </span>
                  ))}
                  {result.negativeMatches.map((word) => (
                    <span key={`n-${word}`} className="rounded bg-rose-100 px-1.5 py-0.5 text-xs text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                      {word}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-xs text-content-subtle">
                Lexicon scoring — a coarse keyword count, not a model judgement.
              </p>
            </div>

            <div className="p-4 bg-surface-sunken rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-content-muted">Sentiment Score</span>
                <span className={`text-xl font-bold ${SENTIMENT_TONE[getSentimentColor()] || "text-content"}`}>
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


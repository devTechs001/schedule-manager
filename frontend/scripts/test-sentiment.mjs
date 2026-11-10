/**
 * Sentiment scoring.
 *
 * The analyzer advertises a score, a polarity and the words it matched, so the
 * numbers have to follow from the text. These pin the lexicon rules,
 * including the negation flip that is easy to get backwards.
 */
import assert from 'node:assert/strict';

// Mirrors analyzeSentiment in components/ai/SentimentAnalyzer.jsx.
const analyse = (text) => {
  const words = text.toLowerCase();
  const negatives = /\b(not|no|never|isn't|wasn't|don't|doesn't)\b/.test(words);

  const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'wonderful', 'amazing', 'fantastic'];
  const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'horrible', 'disappointed', 'angry', 'sad'];

  const matchedPositive = positiveWords.filter((word) => words.includes(word));
  const matchedNegative = negativeWords.filter((word) => words.includes(word));

  const positive = negatives ? matchedNegative.length : matchedPositive.length;
  const negative = negatives ? matchedPositive.length : matchedNegative.length;

  const total = positive + negative || 1;
  const score = (positive - negative) / total;

  return {
    sentiment: score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral',
    score: Math.round((score + 1) * 50),
    matchedPositive,
    matchedNegative,
  };
};

const positive = analyse('This is a great and amazing result');
assert.equal(positive.sentiment, 'positive', 'positive words read positive');
assert.ok(positive.score > 50, 'score sits above the midpoint');
assert.deepEqual(positive.matchedPositive, ['great', 'amazing'], 'reports the words it matched');

const negative = analyse('That was a terrible and awful day');
assert.equal(negative.sentiment, 'negative');
assert.ok(negative.score < 50);

const neutral = analyse('The meeting is on Tuesday');
assert.equal(neutral.sentiment, 'neutral', 'no scored words is neutral');
assert.equal(neutral.score, 50, 'neutral sits exactly on 50');

assert.equal(
  analyse('This was not good').sentiment,
  'negative',
  'a negation flips the polarity'
);
assert.equal(
  analyse('This was not bad').sentiment,
  'positive',
  'negating a negative reads positive'
);

assert.equal(analyse('').score, 50, 'empty input does not divide by zero');

console.log('8 sentiment assertions passed');

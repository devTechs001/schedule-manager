// Sentiment Analysis Service

class SentimentAnalysisService {
  constructor() {
    this.positiveWords = new Set([
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love',
      'best', 'happy', 'joy', 'delighted', 'pleased', 'thankful', 'grateful',
      'brilliant', 'outstanding', 'superb', 'perfect', 'awesome', 'incredible',
    ]);

    this.negativeWords = new Set([
      'bad', 'terrible', 'awful', 'poor', 'worst', 'hate', 'horrible',
      'angry', 'sad', 'disappointed', 'frustrated', 'annoyed', 'upset',
      'fail', 'failure', 'wrong', 'problem', 'issue', 'difficult',
    ]);

    this.intensifiers = new Set(['very', 'really', 'extremely', 'absolutely', 'totally']);
    this.negators = new Set(['not', 'no', 'never', 'none', 'neither', "don't", "doesn't", "isn't"]);
  }

  // Analyze sentiment of text
  analyze(text) {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let intensity = 1;
    let negated = false;

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^\w]/g, '');
      
      // Check for intensifiers
      if (this.intensifiers.has(word)) {
        intensity = 1.5;
        continue;
      }

      // Check for negators
      if (this.negators.has(word)) {
        negated = true;
        continue;
      }

      // Calculate sentiment
      if (this.positiveWords.has(word)) {
        const change = intensity * (negated ? -1 : 1);
        score += change;
        if (change > 0) positiveCount++;
        else negativeCount++;
      } else if (this.negativeWords.has(word)) {
        const change = intensity * (negated ? 1 : -1);
        score += change;
        if (change < 0) negativeCount++;
        else positiveCount++;
      }

      // Reset modifiers
      intensity = 1;
      negated = false;
    }

    const normalized = Math.max(-1, Math.min(1, score / Math.max(words.length / 10, 1)));

    return {
      score: normalized,
      label: this.getLabel(normalized),
      confidence: this.getConfidence(positiveCount + negativeCount, words.length),
      details: {
        positiveCount,
        negativeCount,
        totalWords: words.length,
        rawScore: score,
      },
    };
  }

  // Get sentiment label
  getLabel(score) {
    if (score > 0.5) return 'very positive';
    if (score > 0.2) return 'positive';
    if (score > -0.2) return 'neutral';
    if (score > -0.5) return 'negative';
    return 'very negative';
  }

  // Calculate confidence
  getConfidence(sentimentWords, totalWords) {
    if (totalWords === 0) return 0;
    const ratio = sentimentWords / totalWords;
    return Math.min(0.95, ratio * 5);
  }

  // Analyze array of texts
  analyzeBatch(texts) {
    return texts.map(text => ({
      text,
      analysis: this.analyze(text),
    }));
  }

  // Get emotion breakdown
  getEmotions(text) {
    const emotions = {
      joy: ['happy', 'joy', 'delighted', 'excited', 'thrilled', 'love'],
      anger: ['angry', 'furious', 'annoyed', 'irritated', 'mad'],
      sadness: ['sad', 'disappointed', 'upset', 'depressed', 'unhappy'],
      fear: ['scared', 'afraid', 'worried', 'anxious', 'nervous'],
      surprise: ['surprised', 'amazed', 'shocked', 'astonished'],
    };

    const words = text.toLowerCase().split(/\s+/);
    const scores = {};

    for (const [emotion, keywords] of Object.entries(emotions)) {
      scores[emotion] = words.filter(w => keywords.includes(w.replace(/[^\w]/g, ''))).length;
    }

    const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
    
    return Object.entries(scores).map(([emotion, count]) => ({
      emotion,
      score: count / total,
      count,
    })).sort((a, b) => b.score - a.score);
  }

  // Analyze feedback/reviews
  analyzeReview(text) {
    const sentiment = this.analyze(text);
    const emotions = this.getEmotions(text);
    
    // Extract aspects
    const aspects = this.extractAspects(text);

    return {
      sentiment,
      emotions,
      aspects,
      recommendation: this.getRecommendation(sentiment.score),
    };
  }

  // Extract aspects from review
  extractAspects(text) {
    const aspectKeywords = {
      quality: ['quality', 'well-made', 'durable', 'sturdy'],
      service: ['service', 'support', 'help', 'customer'],
      price: ['price', 'cost', 'value', 'expensive', 'cheap'],
      speed: ['fast', 'slow', 'quick', 'delivery', 'shipping'],
      usability: ['easy', 'difficult', 'simple', 'complicated', 'user-friendly'],
    };

    const words = text.toLowerCase();
    const found = [];

    for (const [aspect, keywords] of Object.entries(aspectKeywords)) {
      if (keywords.some(kw => words.includes(kw))) {
        found.push(aspect);
      }
    }

    return found;
  }

  // Get action recommendation
  getRecommendation(score) {
    if (score > 0.5) return 'highlight';
    if (score > 0.2) return 'acknowledge';
    if (score > -0.2) return 'monitor';
    if (score > -0.5) return 'respond';
    return 'escalate';
  }

  // Get trend over time
  analyzeTrend(textsWithDates) {
    const analyzed = textsWithDates.map(({ text, date }) => ({
      date,
      sentiment: this.analyze(text),
    }));

    analyzed.sort((a, b) => new Date(a.date) - new Date(b.date));

    const scores = analyzed.map(a => a.sentiment.score);
    const trend = scores.length >= 2 
      ? scores[scores.length - 1] - scores[0]
      : 0;

    return {
      items: analyzed,
      averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      trend: trend > 0.1 ? 'improving' : trend < -0.1 ? 'declining' : 'stable',
    };
  }
}

export const sentimentAnalysis = new SentimentAnalysisService();
export default sentimentAnalysis;


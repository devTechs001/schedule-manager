// Document Intelligence Service

class DocumentAIService {
  constructor() {
    this.documents = [];
  }

  // Extract text from image (OCR simulation)
  async extractText(imageFile) {
    // Simulate OCR processing
    await new Promise(r => setTimeout(r, 2000));
    
    return {
      text: 'Extracted text from document...',
      confidence: 0.95,
      blocks: [
        { text: 'Header text', type: 'heading', confidence: 0.98 },
        { text: 'Body paragraph...', type: 'paragraph', confidence: 0.93 },
      ],
    };
  }

  // Analyze document content
  async analyzeDocument(text) {
    const analysis = {
      wordCount: text.split(/\s+/).length,
      charCount: text.length,
      sentences: text.split(/[.!?]+/).filter(s => s.trim()).length,
      readingTime: Math.ceil(text.split(/\s+/).length / 200), // minutes
      entities: this.extractEntities(text),
      sentiment: this.analyzeSentiment(text),
      keywords: this.extractKeywords(text),
      summary: this.summarize(text),
    };

    return analysis;
  }

  // Extract entities from text
  extractEntities(text) {
    const entities = {
      dates: [],
      people: [],
      organizations: [],
      locations: [],
      amounts: [],
    };

    // Date patterns
    const datePattern = /\b(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w* \d{1,2},? \d{4})\b/gi;
    entities.dates = [...(text.match(datePattern) || [])];

    // Money patterns
    const moneyPattern = /\$[\d,]+\.?\d*/g;
    entities.amounts = [...(text.match(moneyPattern) || [])];

    // Email patterns
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
    entities.emails = [...(text.match(emailPattern) || [])];

    // Phone patterns
    const phonePattern = /(?:\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
    entities.phones = [...(text.match(phonePattern) || [])];

    return entities;
  }

  // Analyze sentiment
  analyzeSentiment(text) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'love', 'best'];
    const negativeWords = ['bad', 'terrible', 'awful', 'poor', 'worst', 'hate', 'horrible'];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    const normalized = Math.max(-1, Math.min(1, score / 10));
    
    return {
      score: normalized,
      label: normalized > 0.2 ? 'positive' : normalized < -0.2 ? 'negative' : 'neutral',
    };
  }

  // Extract keywords
  extractKeywords(text, count = 10) {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 3);

    const stopWords = new Set(['this', 'that', 'with', 'have', 'from', 'they', 'been', 'were', 'will', 'would', 'could', 'should']);
    
    const frequency = {};
    words.forEach(word => {
      if (!stopWords.has(word)) {
        frequency[word] = (frequency[word] || 0) + 1;
      }
    });

    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word, count]) => ({ word, count }));
  }

  // Summarize text
  summarize(text, maxSentences = 3) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    if (sentences.length <= maxSentences) {
      return text;
    }

    // Simple extraction: take first, middle, and last sentences
    const summary = [
      sentences[0],
      sentences[Math.floor(sentences.length / 2)],
      sentences[sentences.length - 1],
    ].join('. ').trim() + '.';

    return summary;
  }

  // Classify document type
  classifyDocument(text) {
    const categories = {
      invoice: ['invoice', 'bill', 'amount due', 'payment', 'total'],
      contract: ['agreement', 'terms', 'conditions', 'parties', 'hereby'],
      report: ['summary', 'findings', 'analysis', 'conclusion', 'recommendation'],
      email: ['dear', 'regards', 'sincerely', 'from:', 'to:'],
      resume: ['experience', 'education', 'skills', 'employment', 'objective'],
    };

    const lowerText = text.toLowerCase();
    const scores = {};

    for (const [category, keywords] of Object.entries(categories)) {
      scores[category] = keywords.filter(kw => lowerText.includes(kw)).length;
    }

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return {
      category: sorted[0][1] > 0 ? sorted[0][0] : 'unknown',
      confidence: sorted[0][1] / 5,
      scores,
    };
  }

  // Extract tasks from document
  extractTasks(text) {
    const taskPatterns = [
      /(?:need to|must|should|will|todo|action:?)\s+([^.!?]+)/gi,
      /\[ \]\s*([^\n]+)/g, // Markdown checkboxes
      /(?:\d+\.\s*)?(?:task|item):\s*([^\n]+)/gi,
    ];

    const tasks = [];
    
    taskPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        tasks.push({
          text: match[1].trim(),
          source: 'document',
        });
      }
    });

    return tasks;
  }
}

export const documentAI = new DocumentAIService();
export default documentAI;


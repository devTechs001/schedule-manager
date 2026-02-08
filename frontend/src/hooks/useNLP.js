import { useState, useCallback } from 'react';

const useNLP = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Extract entities from text
  const extractEntities = useCallback((text) => {
    const entities = {
      dates: [],
      times: [],
      people: [],
      places: [],
      tasks: [],
      priorities: [],
    };

    // Date patterns
    const datePatterns = [
      /\b(today|tomorrow|yesterday)\b/gi,
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi,
      /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g,
      /\b(next|this)\s+(week|month|year)\b/gi,
      /\bin\s+(\d+)\s+(days?|weeks?|months?)\b/gi,
    ];

    datePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) entities.dates.push(...matches);
    });

    // Time patterns
    const timePatterns = [
      /\b(\d{1,2}:\d{2})\s*(am|pm)?\b/gi,
      /\b(\d{1,2})\s*(am|pm)\b/gi,
      /\b(morning|afternoon|evening|night)\b/gi,
      /\bat\s+(\d{1,2})\b/gi,
    ];

    timePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) entities.times.push(...matches);
    });

    // Priority keywords
    const priorityKeywords = ['urgent', 'important', 'critical', 'high priority', 'low priority', 'asap'];
    priorityKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        entities.priorities.push(keyword);
      }
    });

    // People (simple pattern - names starting with capital)
    const peoplePattern = /\b(?:with|meet|call|email|contact)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\b/g;
    let match;
    while ((match = peoplePattern.exec(text)) !== null) {
      entities.people.push(match[1]);
    }

    return entities;
  }, []);

  // Parse natural language to task
  const parseTaskFromText = useCallback((text) => {
    setIsProcessing(true);

    const entities = extractEntities(text);
    
    // Determine action type
    let actionType = 'task';
    const actionKeywords = {
      meeting: ['meet', 'meeting', 'call', 'discuss'],
      reminder: ['remind', 'remember', 'don\'t forget'],
      email: ['email', 'send', 'write to'],
      task: ['do', 'complete', 'finish', 'work on', 'create'],
    };

    for (const [type, keywords] of Object.entries(actionKeywords)) {
      if (keywords.some(kw => text.toLowerCase().includes(kw))) {
        actionType = type;
        break;
      }
    }

    // Extract title (simplified)
    let title = text;
    // Remove date/time mentions from title
    entities.dates.forEach(d => { title = title.replace(d, ''); });
    entities.times.forEach(t => { title = title.replace(t, ''); });
    title = title.replace(/\s+/g, ' ').trim();

    // Determine priority
    let priority = 'medium';
    if (entities.priorities.some(p => ['urgent', 'critical', 'asap', 'high priority'].includes(p.toLowerCase()))) {
      priority = 'high';
    } else if (entities.priorities.some(p => p.toLowerCase().includes('low'))) {
      priority = 'low';
    }

    // Parse date
    let dueDate = null;
    if (entities.dates.length > 0) {
      const dateStr = entities.dates[0].toLowerCase();
      if (dateStr === 'today') {
        dueDate = new Date();
      } else if (dateStr === 'tomorrow') {
        dueDate = new Date(Date.now() + 86400000);
      } else if (dateStr === 'next week') {
        dueDate = new Date(Date.now() + 7 * 86400000);
      }
    }

    const result = {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      type: actionType,
      priority,
      dueDate,
      assignee: entities.people[0] || null,
      entities,
      originalText: text,
    };

    setLastResult(result);
    setIsProcessing(false);

    return result;
  }, [extractEntities]);

  // Analyze sentiment
  const analyzeSentiment = useCallback((text) => {
    const positiveWords = ['great', 'good', 'excellent', 'happy', 'love', 'wonderful', 'amazing', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'poor', 'worst', 'angry'];

    const words = text.toLowerCase().split(/\s+/);
    let score = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    return {
      score: Math.max(-1, Math.min(1, score / 5)),
      sentiment: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral',
    };
  }, []);

  // Extract action items from text
  const extractActionItems = useCallback((text) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const actionItems = [];

    const actionVerbs = ['need to', 'should', 'must', 'have to', 'will', 'going to', 'todo', 'action'];

    sentences.forEach(sentence => {
      if (actionVerbs.some(verb => sentence.toLowerCase().includes(verb))) {
        actionItems.push({
          text: sentence.trim(),
          parsed: parseTaskFromText(sentence),
        });
      }
    });

    return actionItems;
  }, [parseTaskFromText]);

  // Summarize text
  const summarize = useCallback((text, maxLength = 100) => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length === 0) return text;

    let summary = sentences[0];
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength - 3) + '...';
    }

    return summary;
  }, []);

  return {
    isProcessing,
    lastResult,
    extractEntities,
    parseTaskFromText,
    analyzeSentiment,
    extractActionItems,
    summarize,
  };
};

export default useNLP;


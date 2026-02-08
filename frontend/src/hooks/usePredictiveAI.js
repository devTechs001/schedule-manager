import { useState, useCallback, useEffect } from 'react';

const usePredictiveAI = (options = {}) => {
  const { 
    enabled = true,
    historySize = 100,
    minConfidence = 0.7,
  } = options;

  const [predictions, setPredictions] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [history, setHistory] = useState([]);
  const [patterns, setPatterns] = useState({});

  // Analyze patterns from history
  const analyzePatterns = useCallback((data) => {
    const timePatterns = {};
    const dayPatterns = {};
    const sequencePatterns = {};

    data.forEach((item, index) => {
      // Time-based patterns
      const hour = new Date(item.timestamp).getHours();
      const timeSlot = Math.floor(hour / 3);
      timePatterns[timeSlot] = timePatterns[timeSlot] || [];
      timePatterns[timeSlot].push(item.action);

      // Day-based patterns
      const day = new Date(item.timestamp).getDay();
      dayPatterns[day] = dayPatterns[day] || [];
      dayPatterns[day].push(item.action);

      // Sequence patterns (what usually follows what)
      if (index > 0) {
        const prevAction = data[index - 1].action;
        sequencePatterns[prevAction] = sequencePatterns[prevAction] || {};
        sequencePatterns[prevAction][item.action] = 
          (sequencePatterns[prevAction][item.action] || 0) + 1;
      }
    });

    return { timePatterns, dayPatterns, sequencePatterns };
  }, []);

  // Update patterns when history changes
  useEffect(() => {
    if (history.length > 10) {
      setPatterns(analyzePatterns(history));
    }
  }, [history, analyzePatterns]);

  // Add event to history
  const recordEvent = useCallback((event) => {
    const newEvent = {
      ...event,
      timestamp: event.timestamp || new Date(),
    };
    
    setHistory(prev => {
      const updated = [...prev, newEvent];
      return updated.slice(-historySize);
    });
  }, [historySize]);

  // Predict next action
  const predictNextAction = useCallback((currentContext = {}) => {
    if (!enabled || Object.keys(patterns).length === 0) {
      return { action: null, confidence: 0 };
    }

    const currentHour = new Date().getHours();
    const timeSlot = Math.floor(currentHour / 3);
    const currentDay = new Date().getDay();

    const candidates = {};

    // Time-based prediction
    if (patterns.timePatterns?.[timeSlot]) {
      patterns.timePatterns[timeSlot].forEach(action => {
        candidates[action] = (candidates[action] || 0) + 1;
      });
    }

    // Day-based prediction
    if (patterns.dayPatterns?.[currentDay]) {
      patterns.dayPatterns[currentDay].forEach(action => {
        candidates[action] = (candidates[action] || 0) + 1;
      });
    }

    // Sequence-based prediction
    if (currentContext.lastAction && patterns.sequencePatterns?.[currentContext.lastAction]) {
      Object.entries(patterns.sequencePatterns[currentContext.lastAction]).forEach(([action, count]) => {
        candidates[action] = (candidates[action] || 0) + count * 2;
      });
    }

    // Find best prediction
    const sorted = Object.entries(candidates).sort((a, b) => b[1] - a[1]);
    if (sorted.length === 0) {
      return { action: null, confidence: 0 };
    }

    const total = sorted.reduce((sum, [, count]) => sum + count, 0);
    const [bestAction, bestCount] = sorted[0];
    const confidence = bestCount / total;

    return {
      action: confidence >= minConfidence ? bestAction : null,
      confidence,
      alternatives: sorted.slice(1, 4).map(([action, count]) => ({
        action,
        confidence: count / total,
      })),
    };
  }, [enabled, patterns, minConfidence]);

  // Predict optimal time for task
  const predictOptimalTime = useCallback((taskType) => {
    const taskHistory = history.filter(h => h.type === taskType && h.completed);
    if (taskHistory.length < 5) {
      return { hour: 9, confidence: 0.5 };
    }

    const hourCounts = {};
    taskHistory.forEach(task => {
      const hour = new Date(task.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const bestHour = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      hour: parseInt(bestHour?.[0]) || 9,
      confidence: (bestHour?.[1] || 0) / taskHistory.length,
    };
  }, [history]);

  // Get suggestions based on patterns
  const getSuggestions = useCallback((count = 3) => {
    setIsProcessing(true);
    
    const suggestions = [];
    const prediction = predictNextAction();
    
    if (prediction.action && prediction.confidence >= minConfidence) {
      suggestions.push({
        type: 'action',
        suggestion: prediction.action,
        confidence: prediction.confidence,
      });
    }

    // Add alternatives
    prediction.alternatives?.forEach(alt => {
      if (alt.confidence >= minConfidence * 0.7) {
        suggestions.push({
          type: 'action',
          suggestion: alt.action,
          confidence: alt.confidence,
        });
      }
    });

    setPredictions(suggestions.slice(0, count));
    setIsProcessing(false);
    
    return suggestions.slice(0, count);
  }, [predictNextAction, minConfidence]);

  return {
    predictions,
    isProcessing,
    patterns,
    recordEvent,
    predictNextAction,
    predictOptimalTime,
    getSuggestions,
  };
};

export default usePredictiveAI;


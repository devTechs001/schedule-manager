// Predictive AI Engine Service

class PredictiveEngineService {
  constructor() {
    this.history = [];
    this.patterns = {};
    this.maxHistory = 1000;
  }

  // Record user action
  recordAction(action) {
    const entry = {
      ...action,
      timestamp: new Date(),
      dayOfWeek: new Date().getDay(),
      hourOfDay: new Date().getHours(),
    };

    this.history.push(entry);
    
    // Trim history if needed
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }

    this.updatePatterns(entry);
  }

  // Update learned patterns
  updatePatterns(entry) {
    const { type, dayOfWeek, hourOfDay } = entry;

    // Time-based patterns
    if (!this.patterns.timePatterns) {
      this.patterns.timePatterns = {};
    }
    const timeKey = `${dayOfWeek}-${Math.floor(hourOfDay / 3)}`;
    if (!this.patterns.timePatterns[timeKey]) {
      this.patterns.timePatterns[timeKey] = {};
    }
    this.patterns.timePatterns[timeKey][type] = (this.patterns.timePatterns[timeKey][type] || 0) + 1;

    // Sequence patterns
    if (!this.patterns.sequences) {
      this.patterns.sequences = {};
    }
    const lastAction = this.history[this.history.length - 2]?.type;
    if (lastAction) {
      if (!this.patterns.sequences[lastAction]) {
        this.patterns.sequences[lastAction] = {};
      }
      this.patterns.sequences[lastAction][type] = (this.patterns.sequences[lastAction][type] || 0) + 1;
    }
  }

  // Predict next action
  predictNextAction(context = {}) {
    const predictions = [];
    const currentDay = new Date().getDay();
    const currentHour = new Date().getHours();
    const timeKey = `${currentDay}-${Math.floor(currentHour / 3)}`;

    // Time-based prediction
    if (this.patterns.timePatterns?.[timeKey]) {
      const timeActions = this.patterns.timePatterns[timeKey];
      const total = Object.values(timeActions).reduce((a, b) => a + b, 0);
      
      for (const [action, count] of Object.entries(timeActions)) {
        predictions.push({
          action,
          confidence: count / total,
          reason: 'time-based',
        });
      }
    }

    // Sequence-based prediction
    if (context.lastAction && this.patterns.sequences?.[context.lastAction]) {
      const seqActions = this.patterns.sequences[context.lastAction];
      const total = Object.values(seqActions).reduce((a, b) => a + b, 0);
      
      for (const [action, count] of Object.entries(seqActions)) {
        const existing = predictions.find(p => p.action === action);
        const confidence = count / total;
        
        if (existing) {
          existing.confidence = (existing.confidence + confidence) / 2;
        } else {
          predictions.push({
            action,
            confidence,
            reason: 'sequence-based',
          });
        }
      }
    }

    // Sort by confidence
    return predictions.sort((a, b) => b.confidence - a.confidence);
  }

  // Predict optimal time for task type
  predictOptimalTime(taskType) {
    const taskHistory = this.history.filter(h => 
      h.type === taskType && h.completed
    );

    if (taskHistory.length < 5) {
      return { hour: 9, confidence: 0.5, reason: 'insufficient-data' };
    }

    const hourCounts = {};
    taskHistory.forEach(task => {
      const hour = new Date(task.timestamp).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const [bestHour, count] = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])[0];

    return {
      hour: parseInt(bestHour),
      confidence: count / taskHistory.length,
      reason: 'historical-data',
    };
  }

  // Predict task duration
  predictTaskDuration(taskType, taskTitle = '') {
    const similarTasks = this.history.filter(h => 
      h.type === 'task_completed' && 
      (h.taskType === taskType || h.title?.toLowerCase().includes(taskTitle.toLowerCase()))
    );

    if (similarTasks.length < 3) {
      return { duration: 30, confidence: 0.5, unit: 'minutes' };
    }

    const durations = similarTasks.map(t => t.duration).filter(Boolean);
    const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    return {
      duration: Math.round(avgDuration),
      confidence: Math.min(0.9, durations.length / 20),
      unit: 'minutes',
    };
  }

  // Get productivity insights
  getProductivityInsights() {
    const taskCompletions = this.history.filter(h => h.type === 'task_completed');
    
    if (taskCompletions.length < 10) {
      return { insights: [], reason: 'insufficient-data' };
    }

    const hourlyProductivity = {};
    const dailyProductivity = {};

    taskCompletions.forEach(task => {
      const hour = new Date(task.timestamp).getHours();
      const day = new Date(task.timestamp).getDay();
      
      hourlyProductivity[hour] = (hourlyProductivity[hour] || 0) + 1;
      dailyProductivity[day] = (dailyProductivity[day] || 0) + 1;
    });

    const bestHour = Object.entries(hourlyProductivity)
      .sort((a, b) => b[1] - a[1])[0];
    const bestDay = Object.entries(dailyProductivity)
      .sort((a, b) => b[1] - a[1])[0];

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return {
      insights: [
        { type: 'peak-hour', value: bestHour[0], message: `You're most productive around ${bestHour[0]}:00` },
        { type: 'peak-day', value: bestDay[0], message: `${days[bestDay[0]]} is your most productive day` },
      ],
      hourlyProductivity,
      dailyProductivity,
    };
  }

  // Get suggestions
  getSuggestions(count = 5) {
    const predictions = this.predictNextAction();
    return predictions.slice(0, count);
  }

  // Clear history
  clearHistory() {
    this.history = [];
    this.patterns = {};
  }
}

export const predictiveEngine = new PredictiveEngineService();
export default predictiveEngine;


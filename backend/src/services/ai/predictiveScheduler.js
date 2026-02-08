import Task from '../../models/Task.js';
import CalendarEvent from '../../models/CalendarEvent.js';
import { startOfDay, endOfDay, addDays, addHours, parseISO } from 'date-fns';

/**
 * Predictive Scheduling Service
 * Uses ML and historical data to suggest optimal task scheduling
 */
class PredictiveScheduler {
  /**
   * Analyze user's productivity patterns
   * @param {string} userId - User ID
   * @returns {Object} Productivity patterns
   */
  async analyzeUserPatterns(userId) {
    try {
      // Get completed tasks from last 30 days
      const thirtyDaysAgo = addDays(new Date(), -30);
      const completedTasks = await Task.find({
        user: userId,
        status: 'completed',
        completedAt: { $gte: thirtyDaysAgo },
      });

      // Analyze completion times
      const hourlyCompletions = new Array(24).fill(0);
      const dayOfWeekCompletions = new Array(7).fill(0);
      const taskTypePreferences = {};

      completedTasks.forEach(task => {
        if (task.completedAt) {
          const hour = task.completedAt.getHours();
          const dayOfWeek = task.completedAt.getDay();
          
          hourlyCompletions[hour]++;
          dayOfWeekCompletions[dayOfWeek]++;

          // Track task types
          const type = task.tags?.[0] || 'general';
          taskTypePreferences[type] = (taskTypePreferences[type] || 0) + 1;
        }
      });

      // Find productivity peaks
      const productivityPeaks = this.findPeaks(hourlyCompletions);
      const bestDays = this.findPeaks(dayOfWeekCompletions);

      return {
        productivityPeaks,
        bestDays,
        taskTypePreferences,
        averageTasksPerDay: completedTasks.length / 30,
        totalCompleted: completedTasks.length,
      };
    } catch (error) {
      console.error('Error analyzing user patterns:', error);
      return this.getDefaultPatterns();
    }
  }

  /**
   * Find peaks in an array
   * @param {Array} data - Array of numbers
   * @returns {Array} Indices of peaks
   */
  findPeaks(data) {
    const peaks = [];
    const threshold = Math.max(...data) * 0.7; // 70% of max

    data.forEach((value, index) => {
      if (value >= threshold) {
        peaks.push(index);
      }
    });

    return peaks;
  }

  /**
   * Get default productivity patterns
   * @returns {Object} Default patterns
   */
  getDefaultPatterns() {
    return {
      productivityPeaks: [9, 10, 14, 15], // 9-10am, 2-3pm
      bestDays: [1, 2, 3, 4], // Mon-Thu
      taskTypePreferences: {},
      averageTasksPerDay: 5,
      totalCompleted: 0,
    };
  }

  /**
   * Suggest optimal schedule for tasks
   * @param {string} userId - User ID
   * @param {Array} tasks - Tasks to schedule
   * @param {Date} startDate - Start date for scheduling
   * @returns {Array} Scheduled tasks with suggested times
   */
  async suggestSchedule(userId, tasks, startDate = new Date()) {
    try {
      const patterns = await this.analyzeUserPatterns(userId);
      const existingEvents = await this.getExistingEvents(userId, startDate);
      
      const scheduledTasks = [];
      let currentDate = startOfDay(startDate);

      for (const task of tasks) {
        const duration = task.estimatedDuration || 60; // minutes
        const suggestedSlot = await this.findOptimalSlot(
          userId,
          currentDate,
          duration,
          patterns,
          existingEvents,
          task
        );

        scheduledTasks.push({
          ...task.toObject(),
          suggestedStart: suggestedSlot.start,
          suggestedEnd: suggestedSlot.end,
          confidence: suggestedSlot.confidence,
          reason: suggestedSlot.reason,
        });

        // Add to existing events to avoid conflicts
        existingEvents.push({
          start: suggestedSlot.start,
          end: suggestedSlot.end,
        });
      }

      return scheduledTasks;
    } catch (error) {
      console.error('Error suggesting schedule:', error);
      return tasks;
    }
  }

  /**
   * Get existing calendar events
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @returns {Array} Existing events
   */
  async getExistingEvents(userId, startDate) {
    const endDate = addDays(startDate, 7); // Look ahead 7 days
    
    const events = await CalendarEvent.find({
      user: userId,
      start: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' },
    }).select('start end');

    return events.map(e => ({
      start: e.start,
      end: e.end,
    }));
  }

  /**
   * Find optimal time slot for a task
   * @param {string} userId - User ID
   * @param {Date} startDate - Start date
   * @param {number} duration - Duration in minutes
   * @param {Object} patterns - User patterns
   * @param {Array} existingEvents - Existing events
   * @param {Object} task - Task object
   * @returns {Object} Optimal slot
   */
  async findOptimalSlot(userId, startDate, duration, patterns, existingEvents, task) {
    const workHours = { start: 9, end: 17 }; // 9am - 5pm
    let currentDate = new Date(startDate);
    let daysChecked = 0;
    const maxDays = 14;

    while (daysChecked < maxDays) {
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends unless task is urgent
      if ((dayOfWeek === 0 || dayOfWeek === 6) && task.priority !== 'urgent') {
        currentDate = addDays(currentDate, 1);
        daysChecked++;
        continue;
      }

      // Try productivity peak hours first
      for (const hour of patterns.productivityPeaks) {
        if (hour < workHours.start || hour >= workHours.end) continue;

        const slotStart = new Date(currentDate);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = addHours(slotStart, duration / 60);

        // Check for conflicts
        const hasConflict = existingEvents.some(event => 
          (slotStart < event.end && slotEnd > event.start)
        );

        if (!hasConflict) {
          return {
            start: slotStart,
            end: slotEnd,
            confidence: 0.9,
            reason: `Scheduled during your peak productivity hour (${hour}:00)`,
          };
        }
      }

      // If no peak hours available, find any available slot
      for (let hour = workHours.start; hour < workHours.end; hour++) {
        const slotStart = new Date(currentDate);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = addHours(slotStart, duration / 60);

        const hasConflict = existingEvents.some(event => 
          (slotStart < event.end && slotEnd > event.start)
        );

        if (!hasConflict) {
          return {
            start: slotStart,
            end: slotEnd,
            confidence: 0.6,
            reason: `Available time slot`,
          };
        }
      }

      currentDate = addDays(currentDate, 1);
      daysChecked++;
    }

    // Fallback: schedule at next available time
    const fallbackStart = addDays(new Date(), 1);
    fallbackStart.setHours(9, 0, 0, 0);
    
    return {
      start: fallbackStart,
      end: addHours(fallbackStart, duration / 60),
      confidence: 0.3,
      reason: 'Scheduled at next available time',
    };
  }
}

export default new PredictiveScheduler();


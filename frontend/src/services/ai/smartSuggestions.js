// Smart Suggestions Service
class SmartSuggestions {
  constructor() {
    this.suggestionTypes = {
      task: {
        priority: 'priority_suggestion',
        timing: 'timing_suggestion',
        delegation: 'delegation_suggestion',
        breakdown: 'breakdown_suggestion',
      },
      schedule: {
        optimal_time: 'optimal_time_suggestion',
        conflict_resolution: 'conflict_resolution',
        buffer_time: 'buffer_time_suggestion',
        recurring_pattern: 'recurring_pattern_suggestion',
      },
      productivity: {
        focus_time: 'focus_time_suggestion',
        break_time: 'break_time_suggestion',
        energy_management: 'energy_management_suggestion',
        workflow_optimization: 'workflow_optimization_suggestion',
      },
    };

    this.productivityPatterns = {
      morning_person: {
        peak_hours: [8, 9, 10, 11],
        deep_work_tasks: ['development', 'writing', 'analysis', 'design'],
        light_tasks: ['email', 'planning', 'organization'],
      },
      afternoon_person: {
        peak_hours: [14, 15, 16, 17],
        deep_work_tasks: ['development', 'problem-solving', 'meetings'],
        light_tasks: ['admin', 'communication', 'review'],
      },
      evening_person: {
        peak_hours: [18, 19, 20, 21],
        deep_work_tasks: ['learning', 'creative work', 'planning'],
        light_tasks: ['cleanup', 'organization', 'preparation'],
      },
    };

    this.taskComplexity = {
      simple: ['email', 'call', 'quick meeting', 'review', 'approval'],
      medium: ['report', 'presentation', 'research', 'development task'],
      complex: ['project planning', 'system design', 'feature development', 'analysis'],
    };

    this.urgencyIndicators = {
      high: ['urgent', 'asap', 'critical', 'immediate', 'emergency'],
      medium: ['soon', 'this week', 'important', 'priority'],
      low: ['when possible', 'eventually', 'low priority', 'nice to have'],
    };
  }

  // Generate smart suggestions based on user context
  generateSuggestions(context) {
    const suggestions = [];
    
    // Task suggestions
    if (context.tasks) {
      suggestions.push(...this.generateTaskSuggestions(context.tasks, context.user));
    }

    // Schedule suggestions
    if (context.schedule) {
      suggestions.push(...this.generateScheduleSuggestions(context.schedule, context.user));
    }

    // Productivity suggestions
    if (context.productivity) {
      suggestions.push(...this.generateProductivitySuggestions(context.productivity, context.user));
    }

    // Prioritize and rank suggestions
    return this.rankSuggestions(suggestions, context);
  }

  generateTaskSuggestions(tasks, user) {
    const suggestions = [];

    tasks.forEach(task => {
      // Priority suggestions
      const prioritySuggestion = this.suggestTaskPriority(task, tasks);
      if (prioritySuggestion) {
        suggestions.push({
          type: this.suggestionTypes.task.priority,
          task_id: task.id,
          suggestion: prioritySuggestion,
          confidence: this.calculatePriorityConfidence(task, tasks),
          impact: 'high',
        });
      }

      // Timing suggestions
      const timingSuggestion = this.suggestOptimalTiming(task, user);
      if (timingSuggestion) {
        suggestions.push({
          type: this.suggestionTypes.task.timing,
          task_id: task.id,
          suggestion: timingSuggestion,
          confidence: this.calculateTimingConfidence(task, user),
          impact: 'medium',
        });
      }

      // Breakdown suggestions for complex tasks
      const breakdownSuggestion = this.suggestTaskBreakdown(task);
      if (breakdownSuggestion) {
        suggestions.push({
          type: this.suggestionTypes.task.breakdown,
          task_id: task.id,
          suggestion: breakdownSuggestion,
          confidence: this.calculateBreakdownConfidence(task),
          impact: 'high',
        });
      }

      // Delegation suggestions
      const delegationSuggestion = this.suggestDelegation(task, user);
      if (delegationSuggestion) {
        suggestions.push({
          type: this.suggestionTypes.task.delegation,
          task_id: task.id,
          suggestion: delegationSuggestion,
          confidence: this.calculateDelegationConfidence(task, user),
          impact: 'medium',
        });
      }
    });

    return suggestions;
  }

  generateScheduleSuggestions(schedule, user) {
    const suggestions = [];

    // Optimal time suggestions
    const optimalTimeSuggestion = this.suggestOptimalScheduleTime(schedule, user);
    if (optimalTimeSuggestion) {
      suggestions.push({
        type: this.suggestionTypes.schedule.optimal_time,
        suggestion: optimalTimeSuggestion,
        confidence: 0.8,
        impact: 'high',
      });
    }

    // Conflict resolution
    const conflicts = this.detectScheduleConflicts(schedule);
    conflicts.forEach(conflict => {
      suggestions.push({
        type: this.suggestionTypes.schedule.conflict_resolution,
        suggestion: this.resolveConflict(conflict),
        confidence: 0.9,
        impact: 'high',
        conflict_id: conflict.id,
      });
    });

    // Buffer time suggestions
    const bufferSuggestion = this.suggestBufferTime(schedule);
    if (bufferSuggestion) {
      suggestions.push({
        type: this.suggestionTypes.schedule.buffer_time,
        suggestion: bufferSuggestion,
        confidence: 0.7,
        impact: 'medium',
      });
    }

    return suggestions;
  }

  generateProductivitySuggestions(productivity, user) {
    const suggestions = [];

    // Focus time suggestions
    if (productivity.distractions > 5) {
      suggestions.push({
        type: this.suggestionTypes.productivity.focus_time,
        suggestion: 'Consider scheduling 2-hour focus blocks during your peak productivity hours',
        confidence: 0.8,
        impact: 'high',
      });
    }

    // Break time suggestions
    if (productivity.working_hours > 8) {
      suggestions.push({
        type: this.suggestionTypes.productivity.break_time,
        suggestion: 'Take regular 15-minute breaks every 90 minutes to maintain productivity',
        confidence: 0.9,
        impact: 'medium',
      });
    }

    // Energy management
    if (productivity.energy_level < 0.5) {
      suggestions.push({
        type: this.suggestionTypes.productivity.energy_management,
        suggestion: 'Schedule demanding tasks during your peak energy hours and save routine tasks for low-energy periods',
        confidence: 0.7,
        impact: 'high',
      });
    }

    return suggestions;
  }

  suggestTaskPriority(task, allTasks) {
    const urgency = this.assessTaskUrgency(task);
    const importance = this.assessTaskImportance(task);
    const deadline = this.assessDeadlinePressure(task, allTasks);

    // Eisenhower Matrix logic
    if (urgency > 0.8 && importance > 0.8) {
      return {
        action: 'increase_priority',
        new_priority: 'high',
        reason: 'This task is both urgent and important - prioritize immediately',
        current_priority: task.priority,
      };
    } else if (urgency < 0.3 && importance < 0.3) {
      return {
        action: 'decrease_priority',
        new_priority: 'low',
        reason: 'This task is neither urgent nor important - consider delegating or postponing',
        current_priority: task.priority,
      };
    } else if (deadline.pressure > 0.7) {
      return {
        action: 'increase_priority',
        new_priority: 'high',
        reason: 'Deadline approaching - increase priority to ensure completion',
        current_priority: task.priority,
      };
    }

    return null;
  }

  suggestOptimalTiming(task, user) {
    const userPattern = this.getUserProductivityPattern(user);
    const taskComplexity = this.assessTaskComplexity(task);

    // Find optimal time slot based on user pattern and task complexity
    const optimalSlot = this.findOptimalTimeSlot(userPattern, taskComplexity, task.estimated_duration);

    if (optimalSlot) {
      return {
        action: 'reschedule',
        suggested_time: optimalSlot.time,
        duration: optimalSlot.duration,
        reason: `This ${taskComplexity} task aligns with your peak productivity hours (${optimalSlot.time})`,
        confidence: optimalSlot.confidence,
      };
    }

    return null;
  }

  suggestTaskBreakdown(task) {
    const complexity = this.assessTaskComplexity(task);
    const estimatedHours = task.estimated_duration || 0;

    if (complexity === 'complex' || estimatedHours > 8) {
      const subtasks = this.generateSubtasks(task);
      return {
        action: 'breakdown',
        subtasks,
        reason: 'Complex task should be broken down into manageable subtasks for better tracking and motivation',
        estimated_subtasks: subtasks.length,
      };
    }

    return null;
  }

  suggestDelegation(task, user) {
    const userSkills = user.skills || [];
    const taskRequirements = this.assessTaskRequirements(task);

    // Check if task requires skills the user doesn't have
    const missingSkills = taskRequirements.filter(skill => !userSkills.includes(skill));
    
    if (missingSkills.length > 0) {
      return {
        action: 'delegate',
        suggested_delegatee: this.findBestDelegatee(taskRequirements, user.team),
        reason: `Task requires ${missingSkills.join(', ')} skills - consider delegating to team member with expertise`,
        missing_skills: missingSkills,
      };
    }

    // Check if user is overloaded
    if (user.current_workload > 0.8) {
      return {
        action: 'delegate',
        suggested_delegatee: this.findAvailableTeamMember(user.team),
        reason: 'Your current workload is high - consider delegating to balance team workload',
        workload_level: user.current_workload,
      };
    }

    return null;
  }

  suggestOptimalScheduleTime(schedule, user) {
    const pattern = this.getUserProductivityPattern(user);
    const currentSchedule = this.analyzeCurrentSchedule(schedule);

    // Find gaps and optimization opportunities
    const gaps = this.findScheduleGaps(currentSchedule, pattern);
    
    if (gaps.length > 0) {
      return {
        action: 'optimize_schedule',
        suggestions: gaps.map(gap => ({
          time: gap.time,
          duration: gap.duration,
          task_type: gap.recommended_task_type,
          reason: gap.reason,
        })),
      };
    }

    return null;
  }

  detectScheduleConflicts(schedule) {
    const conflicts = [];
    const events = schedule.events || [];

    // Check for overlapping events
    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        if (this.eventsOverlap(events[i], events[j])) {
          conflicts.push({
            id: `conflict_${i}_${j}`,
            type: 'overlap',
            events: [events[i], events[j]],
            severity: this.calculateConflictSeverity(events[i], events[j]),
          });
        }
      }
    }

    // Check for insufficient travel time
    for (let i = 0; i < events.length - 1; i++) {
      const travelTime = this.calculateRequiredTravelTime(events[i], events[i + 1]);
      const actualGap = this.getTimeBetweenEvents(events[i], events[i + 1]);
      
      if (actualGap < travelTime) {
        conflicts.push({
          id: `travel_conflict_${i}`,
          type: 'insufficient_travel_time',
          events: [events[i], events[i + 1]],
          required_time: travelTime,
          actual_gap: actualGap,
        });
      }
    }

    return conflicts;
  }

  suggestBufferTime(schedule) {
    const events = schedule.events || [];
    const backToBackEvents = events.filter((event, index) => {
      if (index === 0) return false;
      const previousEvent = events[index - 1];
      const gap = this.getTimeBetweenEvents(previousEvent, event);
      return gap < 15; // Less than 15 minutes between events
    });

    if (backToBackEvents.length > 2) {
      return {
        action: 'add_buffers',
        events_affected: backToBackEvents.length,
        suggestion: 'Add 15-minute buffer periods between back-to-back meetings to prevent fatigue and allow preparation',
        buffer_duration: 15,
      };
    }

    return null;
  }

  // Helper methods
  assessTaskUrgency(task) {
    const urgency = task.title.toLowerCase() + ' ' + (task.description || '').toLowerCase();
    
    for (const [level, keywords] of Object.entries(this.urgencyIndicators)) {
      for (const keyword of keywords) {
        if (urgency.includes(keyword)) {
          return level === 'high' ? 0.9 : level === 'medium' ? 0.6 : 0.3;
        }
      }
    }

    // Check deadline proximity
    if (task.due_date) {
      const daysUntilDue = (new Date(task.due_date) - new Date()) / (1000 * 60 * 60 * 24);
      if (daysUntilDue < 1) return 0.9;
      if (daysUntilDue < 3) return 0.7;
      if (daysUntilDue < 7) return 0.5;
    }

    return 0.3;
  }

  assessTaskImportance(task) {
    // This would typically involve user preferences, project importance, etc.
    // For now, use a simple heuristic
    const importanceKeywords = ['important', 'critical', 'key', 'essential', 'strategic'];
    const taskText = (task.title + ' ' + (task.description || '')).toLowerCase();
    
    const matches = importanceKeywords.filter(keyword => taskText.includes(keyword));
    return Math.min(0.9, 0.3 + (matches.length * 0.2));
  }

  assessTaskComplexity(task) {
    const taskText = (task.title + ' ' + (task.description || '')).toLowerCase();
    
    for (const [complexity, keywords] of Object.entries(this.taskComplexity)) {
      for (const keyword of keywords) {
        if (taskText.includes(keyword)) {
          return complexity;
        }
      }
    }

    // Default to medium if no keywords match
    return 'medium';
  }

  getUserProductivityPattern(user) {
    const preferredHours = user.preferred_working_hours || [9, 10, 11, 14, 15, 16];
    
    // Determine if user is morning, afternoon, or evening person
    if (preferredHours.some(hour => [8, 9, 10, 11].includes(hour))) {
      return this.productivityPatterns.morning_person;
    } else if (preferredHours.some(hour => [14, 15, 16, 17].includes(hour))) {
      return this.productivityPatterns.afternoon_person;
    } else {
      return this.productivityPatterns.evening_person;
    }
  }

  rankSuggestions(suggestions, context) {
    // Sort by impact and confidence
    return suggestions.sort((a, b) => {
      const impactWeight = { high: 3, medium: 2, low: 1 };
      const aScore = impactWeight[a.impact] * a.confidence;
      const bScore = impactWeight[b.impact] * b.confidence;
      return bScore - aScore;
    });
  }

  // Additional helper methods would be implemented here...
  eventsOverlap(event1, event2) {
    const start1 = new Date(event1.start);
    const end1 = new Date(event1.end);
    const start2 = new Date(event2.start);
    const end2 = new Date(event2.end);
    
    return (start1 < end2 && start2 < end1);
  }

  getTimeBetweenEvents(event1, event2) {
    const end1 = new Date(event1.end);
    const start2 = new Date(event2.start);
    return (start2 - end1) / (1000 * 60); // Return minutes
  }

  calculateRequiredTravelTime(event1, event2) {
    // Simple heuristic - would be enhanced with actual location data
    if (event1.location && event2.location && event1.location !== event2.location) {
      return 30; // 30 minutes default travel time
    }
    return 0;
  }

  calculateConflictSeverity(event1, event2) {
    const overlapDuration = Math.min(
      new Date(event1.end),
      new Date(event2.end)
    ) - Math.max(
      new Date(event1.start),
      new Date(event2.start)
    );
    
    return overlapDuration > 60000 ? 'high' : 'medium'; // > 1 minute is high severity
  }
}

export const smartSuggestions = new SmartSuggestions();
export default smartSuggestions;
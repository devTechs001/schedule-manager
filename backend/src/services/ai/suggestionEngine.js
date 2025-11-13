import Task from '../../models/Task.js';
import { getChatCompletion } from './openAIService.js';

export const generateSuggestions = async (userId, context) => {
  try {
    const tasks = await Task.find({ user: userId, status: { $ne: 'completed' } })
      .sort({ dueDate: 1 })
      .limit(10);

    const prompt = `
      Based on these tasks:
      ${tasks.map(t => `- ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate || 'No due date'})`).join('\n')}
      
      Context: ${context || 'General productivity advice'}
      
      Provide 3 specific, actionable suggestions to help improve productivity.
      Format each suggestion as a JSON object with: title, description, confidence (0-100).
      Return only a JSON array.
    `;

    const response = await getChatCompletion(prompt);
    
    try {
      const suggestions = JSON.parse(response.content);
      return suggestions;
    } catch {
      // Fallback if AI doesn't return valid JSON
      return [
        {
          title: 'Prioritize High-Priority Tasks',
          description: 'Focus on completing high-priority tasks first to maximize impact.',
          confidence: 85,
        },
        {
          title: 'Break Down Large Tasks',
          description: 'Split complex tasks into smaller, manageable subtasks.',
          confidence: 80,
        },
        {
          title: 'Set Time Blocks',
          description: 'Allocate specific time blocks for focused work on important tasks.',
          confidence: 75,
        },
      ];
    }
  } catch (error) {
    console.error('Suggestion Generation Error:', error);
    throw error;
  }
};
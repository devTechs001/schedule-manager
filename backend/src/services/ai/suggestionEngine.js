import Task from '../../models/Task.js';
import { getChatCompletion } from './openAIService.js';

/**
 * Pull a JSON array out of a model response that may be wrapped in prose or
 * markdown fences. Returns [] rather than invented suggestions when the model
 * produced something we cannot parse.
 */
const parseSuggestionArray = (raw) => {
  if (typeof raw !== 'string' || !raw.trim()) return [];

  let text = raw.trim();

  // Strip ```json ... ``` fences if present.
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) text = fenced[1].trim();

  // Locate the outermost array if the model added commentary.
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start !== -1 && end > start) text = text.slice(start, end + 1);

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return [];
  }

  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter((item) => item && typeof item === 'object')
    .map((item) => ({
      title: typeof item.title === 'string' ? item.title : '',
      description: typeof item.description === 'string' ? item.description : '',
      confidence: Number.isFinite(Number(item.confidence))
        ? Math.max(0, Math.min(100, Number(item.confidence)))
        : null,
    }))
    .filter((item) => item.title && item.description)
    .slice(0, 5);
};

export const generateSuggestions = async (userId, context) => {
  const tasks = await Task.find({ user: userId, status: { $ne: 'completed' } })
    .sort({ dueDate: 1 })
    .limit(10);

  const prompt = `
    Based on these tasks:
    ${tasks.map((t) => `- ${t.title} (Priority: ${t.priority}, Due: ${t.dueDate || 'No due date'})`).join('\n') || '- (no open tasks)'}

    Context: ${context || 'General productivity advice'}

    Provide 3 specific, actionable suggestions to help improve productivity.
    Format each suggestion as a JSON object with: title, description, confidence (0-100).
    Return only a JSON array.
  `;

  const response = await getChatCompletion(prompt, [], { temperature: 0.4 });

  // A parse failure is a real failure — returning hard-coded advice would
  // present invented content as if it had been reasoned about.
  return parseSuggestionArray(response.content);
};

export { parseSuggestionArray };

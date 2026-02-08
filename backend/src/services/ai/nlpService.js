import OpenAI from 'openai';
import aiConfig from '../../config/ai.js';

const openai = new OpenAI({ apiKey: aiConfig.openaiApiKey });

/**
 * Natural Language Processing Service
 * Handles command parsing, intent recognition, and entity extraction
 */
class NLPService {
  /**
   * Parse natural language command
   * @param {string} text - User input text
   * @param {Object} context - Additional context (user, workspace, etc.)
   * @returns {Object} Parsed command with intent and entities
   */
  async parseCommand(text, context = {}) {
    try {
      const systemPrompt = `You are an AI assistant that parses natural language commands for a task management system.
Extract the following information from user commands:
- intent: create_task, update_task, delete_task, schedule_meeting, query_tasks, set_reminder, etc.
- entities: dates, times, priorities, assignees, task titles, descriptions
- confidence: 0-1 score

Respond ONLY with valid JSON in this format:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "entities": {
    "title": "extracted title",
    "dueDate": "ISO date string",
    "priority": "high|medium|low",
    "assignees": ["name1", "name2"],
    "description": "extracted description"
  }
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const response = completion.choices[0].message.content;
      const parsed = JSON.parse(response);

      return {
        success: true,
        ...parsed,
        originalText: text,
        context,
      };
    } catch (error) {
      console.error('NLP parsing error:', error);
      return {
        success: false,
        error: error.message,
        intent: 'unknown',
        confidence: 0,
        entities: {},
      };
    }
  }

  /**
   * Extract action items from text (e.g., meeting notes)
   * @param {string} text - Text to analyze
   * @returns {Array} List of action items
   */
  async extractActionItems(text) {
    try {
      const systemPrompt = `Extract action items from the following text.
For each action item, identify:
- title: what needs to be done
- assignee: who should do it (if mentioned)
- dueDate: when it should be done (if mentioned)
- priority: estimated priority (high/medium/low)

Respond with JSON array of action items.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        temperature: 0.3,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error('Action item extraction error:', error);
      return [];
    }
  }

  /**
   * Categorize email content
   * @param {Object} email - Email object with subject and body
   * @returns {Object} Categorization result
   */
  async categorizeEmail(email) {
    try {
      const systemPrompt = `Analyze this email and provide:
- category: urgent, important, normal, low, spam
- requiresAction: boolean
- suggestedActions: array of suggested actions
- extractedTasks: array of potential tasks
- sentiment: positive, neutral, negative

Respond with JSON only.`;

      const emailText = `Subject: ${email.subject}\n\nBody: ${email.body}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: emailText },
        ],
        temperature: 0.3,
      });

      const response = completion.choices[0].message.content;
      return JSON.parse(response);
    } catch (error) {
      console.error('Email categorization error:', error);
      return {
        category: 'normal',
        requiresAction: false,
        suggestedActions: [],
        extractedTasks: [],
        sentiment: 'neutral',
      };
    }
  }

  /**
   * Generate smart email reply
   * @param {Object} email - Original email
   * @param {string} tone - Desired tone (professional, casual, friendly)
   * @returns {string} Generated reply
   */
  async generateSmartReply(email, tone = 'professional') {
    try {
      const systemPrompt = `Generate a ${tone} email reply to the following email.
Keep it concise and appropriate. Include a greeting and closing.`;

      const emailText = `From: ${email.from}\nSubject: ${email.subject}\n\n${email.body}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: emailText },
        ],
        temperature: 0.7,
        max_tokens: 300,
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('Smart reply generation error:', error);
      return '';
    }
  }
}

export default new NLPService();


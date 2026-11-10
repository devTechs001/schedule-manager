import OpenAI from 'openai';
import aiConfig from '../../config/ai.js';

// Initialise the OpenAI client only when a usable key is present. Without one
// the service is "unavailable" — callers must surface that to the user rather
// than inventing plausible-looking output.
let openai = null;
if (aiConfig.openaiApiKey && aiConfig.openaiApiKey.startsWith('sk-')) {
  openai = new OpenAI({
    apiKey: aiConfig.openaiApiKey,
  });
}

export const isAIConfigured = () => Boolean(openai);

/**
 * Raised when a caller asks for AI output but no provider is configured.
 * The HTTP layer maps this to 503 + `code: 'AI_UNAVAILABLE'` so the UI can
 * show an honest "AI is not configured" state instead of fake results.
 */
export class AIUnavailableError extends Error {
  constructor(message = 'AI features are not configured on this server') {
    super(message);
    this.name = 'AIUnavailableError';
    this.code = 'AI_UNAVAILABLE';
    this.statusCode = 503;
  }
}

const assertConfigured = () => {
  if (!openai) throw new AIUnavailableError();
};

/**
 * @param {string} message
 * @param {Array<{role: string, content: string}>} context
 * @param {{json?: boolean, temperature?: number, maxTokens?: number}} options
 */
export const getChatCompletion = async (message, context = [], options = {}) => {
  assertConfigured();

  const { json = false, temperature = aiConfig.temperature, maxTokens = aiConfig.maxTokens } = options;

  const messages = [
    {
      role: 'system',
      content:
        'You are a helpful AI assistant for a productivity and schedule management application. ' +
        'Provide concise, actionable advice to help users manage their tasks, emails, and schedule effectively.' +
        (json ? ' Respond with valid JSON only — no prose, no markdown fences.' : ''),
    },
    ...context,
    { role: 'user', content: message },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: aiConfig.model,
      messages,
      temperature,
      max_tokens: maxTokens,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    });

    return {
      content: completion.choices[0].message.content,
      model: completion.model,
      usage: {
        prompt: completion.usage?.prompt_tokens ?? 0,
        completion: completion.usage?.completion_tokens ?? 0,
        total: completion.usage?.total_tokens ?? 0,
      },
    };
  } catch (error) {
    console.error('OpenAI API Error:', error?.message || error);
    throw new Error('Failed to get AI response');
  }
};

export const getEmbedding = async (text) => {
  assertConfigured();

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('OpenAI Embedding Error:', error?.message || error);
    throw new Error('Failed to generate embedding');
  }
};

export const moderateContent = async (text) => {
  assertConfigured();

  try {
    const response = await openai.moderations.create({
      input: text,
    });

    return response.results[0];
  } catch (error) {
    console.error('OpenAI Moderation Error:', error?.message || error);
    throw new Error('Failed to moderate content');
  }
};

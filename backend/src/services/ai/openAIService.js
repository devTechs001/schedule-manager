import OpenAI from 'openai';
import aiConfig from '../../config/ai.js';

// Initialize OpenAI client only if API key is provided
let openai = null;
if (aiConfig.openaiApiKey && aiConfig.openaiApiKey.startsWith('sk-')) {
  openai = new OpenAI({
    apiKey: aiConfig.openaiApiKey,
  });
}

export const getChatCompletion = async (message, context = []) => {
  // Return mock response if OpenAI is not configured
  if (!openai) {
    console.warn('OpenAI not configured. Returning mock response.');
    return {
      content: 'Mock AI response: This is a simulated response since OpenAI API key is not configured. Please add your OpenAI API key to the .env file to enable real AI functionality.',
      model: 'mock-model',
      usage: {
        prompt: 0,
        completion: 0,
        total: 0,
      },
    };
  }

  try {
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant for a productivity and schedule management application. Provide concise, actionable advice to help users manage their tasks, emails, and schedule effectively.',
      },
      ...context,
      {
        role: 'user',
        content: message,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: aiConfig.model,
      messages,
      temperature: aiConfig.temperature,
      max_tokens: aiConfig.maxTokens,
    });

    return {
      content: completion.choices[0].message.content,
      model: completion.model,
      usage: {
        prompt: completion.usage.prompt_tokens,
        completion: completion.usage.completion_tokens,
        total: completion.usage.total_tokens,
      },
    };
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw new Error('Failed to get AI response');
  }
};

export const getEmbedding = async (text) => {
  // Return mock embedding if OpenAI is not configured
  if (!openai) {
    console.warn('OpenAI not configured. Returning mock embedding.');
    // Return a mock embedding array (1536 dimensions for text-embedding-ada-002)
    return Array(1536).fill(0.1);
  }

  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('OpenAI Embedding Error:', error);
    throw new Error('Failed to generate embedding');
  }
};

export const moderateContent = async (text) => {
  // Return mock moderation result if OpenAI is not configured
  if (!openai) {
    console.warn('OpenAI not configured. Returning mock moderation result.');
    // Return a mock moderation result (safe content)
    return {
      flagged: false,
      categories: {
        hate: false,
        'hate/threatening': false,
        'self-harm': false,
        sexual: false,
        'sexual/minors': false,
        violence: false,
        'violence/graphic': false,
      },
      category_scores: {
        hate: 0.0,
        'hate/threatening': 0.0,
        'self-harm': 0.0,
        sexual: 0.0,
        'sexual/minors': 0.0,
        violence: 0.0,
        'violence/graphic': 0.0,
      },
    };
  }

  try {
    const response = await openai.moderations.create({
      input: text,
    });

    return response.results[0];
  } catch (error) {
    console.error('OpenAI Moderation Error:', error);
    throw new Error('Failed to moderate content');
  }
};
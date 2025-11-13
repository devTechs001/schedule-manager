import OpenAI from 'openai';
import aiConfig from '../../config/ai.js';

const openai = new OpenAI({
  apiKey: aiConfig.openaiApiKey,
});

export const getChatCompletion = async (message, context = []) => {
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
import { useState } from 'react';
import aiAPI from '@services/api/aiAPI';
import toast from 'react-hot-toast';

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);

  const sendMessage = async (content) => {
    try {
      setLoading(true);
      const userMessage = { role: 'user', content };
      setMessages(prev => [...prev, userMessage]);

      const response = await aiAPI.chat(content);
      const aiMessage = { role: 'assistant', content: response.message };
      setMessages(prev => [...prev, aiMessage]);

      return response;
    } catch (err) {
      toast.error('Failed to get AI response');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getSuggestions = async (context) => {
    try {
      const suggestions = await aiAPI.getSuggestions(context);
      return suggestions;
    } catch (err) {
      toast.error('Failed to get AI suggestions');
      throw err;
    }
  };

  const getPriority = async (taskId) => {
    try {
      const priority = await aiAPI.calculatePriority(taskId);
      return priority;
    } catch (err) {
      toast.error('Failed to calculate priority');
      throw err;
    }
  };

  const getInsights = async () => {
    try {
      const insights = await aiAPI.getInsights();
      return insights;
    } catch (err) {
      toast.error('Failed to get insights');
      throw err;
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return {
    loading,
    messages,
    sendMessage,
    getSuggestions,
    getPriority,
    getInsights,
    clearChat,
  };
};
import React, { createContext, useContext, useState, useEffect } from 'react';
import aiAPI from '@services/api/aiAPI';

const AIContext = createContext();

export const useAIContext = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAIContext must be used within AIProvider');
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch initial insights when AI is enabled
  useEffect(() => {
    if (aiEnabled) {
      fetchInsights();
    }
  }, []); // Empty dependency array to run only once

  const fetchInsights = async () => {
    try {
      const response = await aiAPI.getInsights();
      setInsights(response);
    } catch (error) {
      console.error('Failed to fetch AI insights:', error);
    }
  };

  const addSuggestion = (suggestion) => {
    setSuggestions(prev => [...prev, suggestion]);
  };

  const removeSuggestion = (id) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const addInsight = (insight) => {
    setInsights(prev => [...prev, insight]);
  };

  const clearInsights = () => {
    setInsights([]);
  };

  // AI Chat functionality
  const sendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message to chat
    const userMessage = { role: 'user', content: message };
    setChatMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await aiAPI.chat(message);

      // Add AI response to chat
      const aiMessage = { role: 'assistant', content: response.message };
      setChatMessages(prev => [...prev, aiMessage]);

      return response;
    } catch (error) {
      console.error('Failed to send message to AI:', error);

      // Add error message to chat
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setChatMessages(prev => [...prev, errorMessage]);

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getAISuggestions = async (context) => {
    try {
      const response = await aiAPI.getSuggestions(context);
      setSuggestions(response);
      return response;
    } catch (error) {
      console.error('Failed to get AI suggestions:', error);
      throw error;
    }
  };

  const calculatePriority = async (taskId) => {
    try {
      const response = await aiAPI.calculatePriority(taskId);
      return response;
    } catch (error) {
      console.error('Failed to calculate priority:', error);
      throw error;
    }
  };

  const resetChat = () => {
    setChatMessages([]);
  };

  return (
    <AIContext.Provider
      value={{
        suggestions,
        insights,
        aiEnabled,
        setAiEnabled,
        addSuggestion,
        removeSuggestion,
        addInsight,
        clearInsights,
        chatMessages,
        isLoading,
        sendMessage,
        getAISuggestions,
        calculatePriority,
        resetChat,
        fetchInsights,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};
import React, { createContext, useContext, useState } from 'react';

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
      }}
    >
      {children}
    </AIContext.Provider>
  );
};
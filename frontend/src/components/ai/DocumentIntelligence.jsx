import React, { useState, useCallback } from 'react';
import { FaFileAlt, FaUpload, FaSearch, FaTags, FaSpinner } from 'react-icons/fa';

const DocumentIntelligence = ({ onAnalyze }) => {
  const [document, setDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [textInput, setTextInput] = useState('');

  const handleFileUpload = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocument(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setTextInput(event.target?.result || '');
      };
      reader.readAsText(file);
    }
  }, []);

  const analyzeDocument = async () => {
    if (!textInput) return;
    setIsAnalyzing(true);

    // Simulate AI analysis
    setTimeout(() => {
      const mockAnalysis = {
        summary: 'This document outlines key project requirements and deliverables for Q2 2026.',
        keyTopics: ['Project Planning', 'Resource Allocation', 'Timeline Management', 'Risk Assessment'],
        entities: {
          dates: ['March 15, 2026', 'April 30, 2026'],
          people: ['John Smith', 'Sarah Johnson'],
          organizations: ['Acme Corp', 'Tech Solutions'],
        },
        sentiment: 'neutral',
        actionItems: [
          'Review budget proposal by March 10',
          'Schedule kickoff meeting with stakeholders',
          'Prepare resource allocation plan',
        ],
        wordCount: textInput.split(/\s+/).length,
        readingTime: Math.ceil(textInput.split(/\s+/).length / 200),
      };
      setAnalysis(mockAnalysis);
      onAnalyze?.(mockAnalysis);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <FaFileAlt className="text-primary-600 text-xl" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Document Intelligence
        </h3>
      </div>

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
          <input
            type="file"
            id="doc-upload"
            accept=".txt,.md,.doc,.docx,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label htmlFor="doc-upload" className="cursor-pointer">
            <FaUpload className="mx-auto text-3xl text-gray-400 mb-2" />
            <p className="text-gray-600 dark:text-gray-400">
              Drop a document or click to upload
            </p>
            {document && (
              <p className="mt-2 text-sm text-primary-600">{document.name}</p>
            )}
          </label>
        </div>

        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Or paste your document text here..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />

        <button
          onClick={analyzeDocument}
          disabled={!textInput || isAnalyzing}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50"
        >
          {isAnalyzing ? <FaSpinner className="animate-spin" /> : <FaSearch />}
          {isAnalyzing ? 'Analyzing...' : 'Analyze Document'}
        </button>

        {analysis && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Summary</h4>
              <p className="text-gray-700 dark:text-gray-300">{analysis.summary}</p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FaTags /> Key Topics
              </h4>
              <div className="flex flex-wrap gap-2">
                {analysis.keyTopics.map((topic, i) => (
                  <span key={i} className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded text-sm">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{analysis.wordCount}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Words</p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{analysis.readingTime} min</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Read Time</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentIntelligence;


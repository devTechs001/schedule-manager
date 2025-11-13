import React, { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';
import Button from '@components/ui/Button';
import LoadingSpinner from '@components/ui/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const AIChat = ({ onSendMessage, messages, loading }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    await onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
          <FaRobot className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Powered by GPT-4</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FaRobot size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Start a conversation with your AI assistant
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
              Ask about tasks, schedules, or get productivity tips
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  flex items-start space-x-2 max-w-[80%]
                  ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}
                `}
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${message.role === 'user'
                      ? 'bg-primary-600'
                      : 'bg-gradient-to-r from-primary-600 to-secondary-600'
                    }
                  `}
                >
                  {message.role === 'user' ? (
                    <FaUser className="text-white" size={14} />
                  ) : (
                    <FaRobot className="text-white" size={14} />
                  )}
                </div>
                <div
                  className={`
                    px-4 py-2 rounded-lg
                    ${message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }
                  `}
                >
                  {message.role === 'assistant' ? (
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          return !inline && match ? (
                            <SyntaxHighlighter
                              style={vscDarkPlus}
                              language={match[1]}
                              PreTag="div"
                              {...props}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <LoadingSpinner size="sm" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
          />
          <Button
            type="submit"
            variant="primary"
            icon={<FaPaperPlane />}
            disabled={!input.trim() || loading}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
import React, { useState, useRef, useEffect } from 'react';
import { FaComments, FaPaperPlane, FaSmile, FaPaperclip, FaSearch } from 'react-icons/fa';

const MessageCenter = ({ conversations = [], currentUser, onSend }) => {
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages]);

  const sendMessage = () => {
    if (!message.trim() || !activeConversation) return;
    onSend?.(activeConversation.id, message);
    setMessage('');
  };

  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg flex h-[600px]">
      {/* Conversations List */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <FaComments className="text-primary-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Messages</h3>
          </div>
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversation(conv)}
              className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-left ${
                activeConversation?.id === conv.id ? 'bg-primary-50 dark:bg-primary-900/20' : ''
              }`}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-primary-500 flex items-center justify-center text-white font-medium">
                  {conv.avatar || conv.name[0]}
                </div>
                {conv.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-white">{conv.name}</span>
                  <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
              </div>
              {conv.unread > 0 && (
                <span className="px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                  {conv.unread}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                {activeConversation.name[0]}
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">{activeConversation.name}</h4>
                <span className="text-sm text-green-500">{activeConversation.online ? 'Online' : 'Offline'}</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeConversation.messages?.map((msg, i) => {
                const isOwn = msg.senderId === currentUser?.id;
                return (
                  <div key={i} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      isOwn
                        ? 'bg-primary-600 text-white rounded-br-none'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`text-xs ${isOwn ? 'text-primary-200' : 'text-gray-500'} mt-1 block`}>
                        {msg.time}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <FaPaperclip />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <FaSmile />
                </button>
                <button
                  onClick={sendMessage}
                  className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageCenter;


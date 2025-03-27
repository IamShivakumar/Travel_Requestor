import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import useapiclient from '../apiclient/apiclient'
import { useNavigate } from 'react-router-dom';

const ChatBot = () => {
  const apiclient=useapiclient()
  const navigate=useNavigate()
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const messagesContainerRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  // Track previous messages length to detect new messages
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    if (isOpen && messages.length > prevMessagesLengthRef.current) {
      scrollToBottom();
      prevMessagesLengthRef.current = messages.length;
    }
  }, [isOpen, messages.length]); // Only scroll when messages length increases

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Add welcome message when chat is opened
      const welcomeMessage = {
        type: 'bot',
        content: `👋 Welcome to Travel Request Assistant!\n\nHow can I can help you ?`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {

      const response = await apiclient.post('users/chat/', 
        { message: inputMessage },
        navigate
      );

      const botMessage = {
        type: 'bot',
        content: response.data.response,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error.response?.status === 401) {
        errorMessage = 'Please log in again to continue.';
      } else if (error.response?.status === 403) {
        errorMessage = 'You do not have permission to use the chat.';
      }

      const errorBotMessage = {
        type: 'bot',
        content: errorMessage,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickCommand = (command) => {
    setInputMessage(command);
  };

  // Mini Icon Component
  const ChatIcon = () => (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110 z-50"
      aria-label="Open chat"
    >
      <svg 
        className="w-6 h-6" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth="2" 
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" 
        />
      </svg>
    </button>
  );

  // Chat Window Component
  const ChatWindow = () => (
    <div className="fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl z-50 animate-slide-up">
      {/* Chat Header */}
      <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
        <h3 className="font-semibold">Travel Request Assistant</h3>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Chat Messages */}
      <div 
        ref={messagesContainerRef}
        className="h-96 overflow-y-auto p-4 space-y-4"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.type === 'user'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p className="text-sm whitespace-pre-line">{message.content}</p>
              <span className="text-xs mt-1 block opacity-70">
                {message.timestamp}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Commands */}
      {/* {messages.length === 1 && (
        <div className="px-4 py-2 bg-gray-50 border-t">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickCommand("Show total requests")}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
            >
              Total Requests
            </button>
            <button
              onClick={() => handleQuickCommand("Pending requests")}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
            >
              Pending
            </button>
            <button
              onClick={() => handleQuickCommand("Recent requests")}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
            >
              Recent
            </button>
            <button
              onClick={() => handleQuickCommand("Travel mode")}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
            >
              Travel Mode
            </button>
            <button
              onClick={() => handleQuickCommand("Status overview")}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
            >
              Status
            </button>
            <button
              onClick={() => handleQuickCommand("Request percentages")}
              className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm hover:bg-indigo-200 transition-colors"
            >
              Percentages
            </button>
          </div>
        </div>
      )} */}

      {/* Chat Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about travel requests..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <>
      {!isOpen && <ChatIcon />}
      {isOpen && <ChatWindow />}
    </>
  );
};

export default ChatBot; 
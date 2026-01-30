import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiUser, FiCamera, FiShoppingCart, FiHeart, FiSearch, FiTrendingUp, FiStar, FiClock, FiPackage, FiCreditCard, FiSettings, FiHelpCircle, FiGift, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useSelector } from 'react-redux';
// REMOVED: import { api } from '../utils/api';
// ADDED: Gemini Service
import geminiService from '../services/geminiService';
import VisualSearchModal from './VisualSearchModal';

const AIChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVisualSearch, setShowVisualSearch] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const messagesEndRef = useRef(null);
  const { user, isAuthenticated } = useAuth();
  const { cartItems, totalItems } = useSelector(state => state.cart);
  const { products } = useSelector(state => state.products);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Initialize with comprehensive welcome message
      const welcomeMessages = [
        `Hey ${user?.name || 'there'} 👋 Welcome back to Seekon Apparel! I'm Seekon, your intelligent shopping companion. I can help with shopping, orders, account management, and style advice. What can I assist you with today?`,
        `Hi ${user?.name || 'there'}! I'm Seekon, your personal shopping assistant. I can help you navigate our site, find products, and provide personalized recommendations. How can I help?`,
        `Welcome back, ${user?.name || 'friend'}! I'm Seekon and I know everything about our latest drops. I'm here to make your shopping experience amazing! What interests you today?`
      ];
      
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)],
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, user?.name, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 🚀 UPDATED: Use Gemini Service
      // Create context to help the AI be smarter
      const context = {
        user: user || { name: 'Guest' },
        cartItems: cartItems || [],
        products: products || [] // Optional: Pass product list if not too huge
      };

      const response = await geminiService.generateResponse(inputMessage, context);
      
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: response.message,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: "Sorry, I'm Seekon and I'm having a little trouble connecting right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleVisualSearch = (results) => {
    const aiMessage = {
      id: Date.now(),
      sender: 'ai',
      text: `I'm Seekon and I found ${results.length} similar products! Here are the best matches based on your image:`,
      timestamp: new Date(),
      searchResults: results,
    };
    setMessages(prev => [...prev, aiMessage]);
  };

  const quickActions = {
    shopping: [
      { text: 'Show me Nike shoes', icon: FiSearch, category: 'shopping' },
      { text: 'Best running shoes', icon: FiTrendingUp, category: 'shopping' },
      { text: 'New arrivals', icon: FiStar, category: 'shopping' },
      { text: 'Sale items', icon: FiShoppingCart, category: 'shopping' },
      { text: 'Size guide', icon: FiHelpCircle, category: 'shopping' },
      { text: 'Style recommendations', icon: FiHeart, category: 'shopping' }
    ],
    orders: [
      { text: 'Track my order', icon: FiPackage, category: 'orders' },
      { text: 'Order history', icon: FiClock, category: 'orders' },
      { text: 'Shipping info', icon: FiTruck, category: 'orders' },
      { text: 'Returns & exchanges', icon: FiRefreshCw, category: 'orders' }
    ],
    account: [
      { text: 'Account settings', icon: FiSettings, category: 'account' },
      { text: 'Payment methods', icon: FiCreditCard, category: 'account' },
      { text: 'Wishlist', icon: FiHeart, category: 'account' },
      { text: 'Gift cards', icon: FiGift, category: 'account' }
    ],
    support: [
      { text: 'Help center', icon: FiHelpCircle, category: 'support' },
      { text: 'Technical support', icon: FiShield, category: 'support' },
      { text: 'Contact us', icon: FiMessageCircle, category: 'support' },
      { text: 'Website features', icon: FiSettings, category: 'support' }
    ]
  };

  const getQuickActionsForCategory = (category) => {
    if (category === 'all') {
      return Object.values(quickActions).flat();
    }
    return quickActions[category] || [];
  };

  return (
    <>
      {/* Chat Button - Glassmorphic Design */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 md:bottom-5 md:right-5 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-white/40 backdrop-blur-xl border border-white/50 hover:bg-white/50 hover:border-white/60 text-white rounded-full shadow-2xl flex items-center justify-center z-40 transition-all duration-300"
        aria-label="Open Seekon AI Assistant"
      >
        <div className="relative">
          <FiMessageCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7" />
          {totalItems > 0 && (
            <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 md:-top-1.5 md:-right-1.5 w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 bg-gradient-to-r from-[#00A676] to-[#008A5E] text-white rounded-full flex items-center justify-center font-bold animate-pulse text-[9px] sm:text-[10px] md:text-[11px] shadow-lg">
              {totalItems}
            </div>
          )}
        </div>
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setIsOpen(false)}
            />

            {/* Chat Window - Full Overlay on Mobile, Corner Window on Desktop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[600px] h-[calc(100vh-2rem)] bg-seekon-midnight/95 backdrop-blur-xl rounded-2xl sm:rounded-2xl shadow-2xl border border-white/20 z-[9999] flex flex-col overflow-hidden"
            >
              {/* Header - Enhanced Responsive */}
              <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 border-b border-white/20 bg-gradient-to-r from-seekon-electricRed/20 to-seekon-neonCyan/20">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-r from-seekon-electricRed to-seekon-neonCyan rounded-full flex items-center justify-center">
                    <FiMessageCircle className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-seekon-pureWhite" />
                  </div>
                  <div>
                    <h3 className="font-bold text-seekon-pureWhite text-sm sm:text-base md:text-lg">
                      Seekon AI
                    </h3>
                    <p className="text-xs text-seekon-softWhite hidden sm:block">
                      Your intelligent shopping companion
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
                  aria-label="Close chat"
                >
                  <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-seekon-softWhite" />
                </button>
              </div>

              {/* Messages - Enhanced Responsive */}
              <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 space-y-2 sm:space-y-3 md:space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[90%] sm:max-w-[85%] md:max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        message.sender === 'user' 
                          ? 'bg-gradient-to-r from-seekon-electricRed to-seekon-electricRed/80' 
                          : 'bg-gradient-to-r from-seekon-neonCyan to-seekon-neonCyan/80'
                      }`}>
                        {message.sender === 'user' ? (
                          <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-seekon-pureWhite" />
                        ) : (
                          <FiMessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-seekon-midnight" />
                        )}
                      </div>
                      <div className={`rounded-xl px-3 sm:px-4 py-2 sm:py-3 ${
                        message.sender === 'user'
                          ? 'bg-gradient-to-r from-seekon-electricRed to-seekon-electricRed/80 text-seekon-pureWhite'
                          : 'bg-white/10 backdrop-blur-sm text-seekon-pureWhite border border-white/20'
                      }`}>
                        <p className="text-xs sm:text-sm leading-relaxed">{message.text}</p>
                        {message.suggestions && (
                          <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                            {message.suggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className="block w-full text-left text-xs text-seekon-neonCyan hover:text-seekon-pureWhite transition-colors duration-200 bg-white/5 hover:bg-white/10 rounded-lg px-2 sm:px-3 py-1 sm:py-2"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gradient-to-r from-seekon-neonCyan to-seekon-neonCyan/80 rounded-full flex items-center justify-center">
                        <FiMessageCircle className="w-3 h-3 sm:w-4 sm:h-4 text-seekon-midnight" />
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 sm:px-4 py-2 sm:py-3 border border-white/20">
                        <div className="flex space-x-1">
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-seekon-neonCyan rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-seekon-neonCyan rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-seekon-neonCyan rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Category Tabs - Enhanced Responsive */}
              {messages.length === 1 && (
                <div className="px-2 sm:px-3 md:px-4 pb-2">
                  <div className="flex space-x-1 mb-2 sm:mb-3 overflow-x-auto scrollbar-hide">
                    {['all', 'shopping', 'orders', 'account', 'support'].map((category) => (
                      <button
                        key={category}
                        onClick={() => setActiveCategory(category)}
                        className={`px-2 sm:px-3 py-1 text-xs rounded-full transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                          activeCategory === category
                            ? 'bg-gradient-to-r from-seekon-electricRed to-seekon-neonCyan text-seekon-pureWhite'
                            : 'bg-white/10 text-seekon-softWhite hover:bg-white/20'
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-2">
                    {getQuickActionsForCategory(activeCategory).map((action, index) => {
                      const IconComponent = action.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(action.text)}
                          className="flex items-center space-x-2 text-xs bg-white/5 hover:bg-white/10 text-seekon-softWhite hover:text-seekon-pureWhite px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20"
                        >
                          <IconComponent className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{action.text}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Input - Enhanced Responsive */}
              <div className="p-2 sm:p-3 md:p-4 border-t border-white/20 bg-gradient-to-r from-seekon-electricRed/10 to-seekon-neonCyan/10">
                <form onSubmit={handleSendMessage} className="flex space-x-1 sm:space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask Seekon anything..."
                    className="flex-1 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-3 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-seekon-electricRed/50 bg-white/10 backdrop-blur-sm text-seekon-pureWhite placeholder-seekon-softWhite text-xs sm:text-sm"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowVisualSearch(true)}
                    className="p-1.5 sm:p-2 md:p-3 bg-white/10 hover:bg-white/20 text-seekon-softWhite hover:text-seekon-pureWhite rounded-xl transition-all duration-200 border border-white/20"
                    title="Visual Search"
                    aria-label="Open visual search"
                  >
                    <FiCamera className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-seekon-electricRed to-seekon-electricRed/80 hover:from-seekon-electricRed/90 hover:to-seekon-electricRed/70 disabled:bg-white/10 disabled:cursor-not-allowed text-seekon-pureWhite rounded-xl transition-all duration-200 disabled:text-seekon-softWhite"
                    aria-label="Send message"
                  >
                    <FiSend className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Visual Search Modal */}
      <VisualSearchModal
        isOpen={showVisualSearch}
        onClose={() => setShowVisualSearch(false)}
        onSearch={handleVisualSearch}
      />
    </>
  );
};

export default AIChatAssistant;
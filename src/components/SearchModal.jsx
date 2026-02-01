import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiArrowRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    // Close on scroll
    let scrollTimeout;
    const handleScroll = () => {
      // Clear previous timeout
      if (scrollTimeout) clearTimeout(scrollTimeout);
      // Set new timeout to close modal after scrolling stops
      scrollTimeout = setTimeout(() => {
        onClose();
      }, 100);
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('scroll', handleScroll, { passive: true });
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('scroll', handleScroll);
      document.body.style.overflow = 'unset';
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [isOpen, onClose]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    
    // Navigate to collection with search query
    navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
    onClose();
    setSearchQuery('');
    setIsSearching(false);
  };

  const handleQuickSearch = (term) => {
    navigate(`/collection?search=${encodeURIComponent(term)}`);
    onClose();
    setSearchQuery('');
  };

  const popularSearches = [
    'Nike Air Jordan',
    'Running Shoes',
    'Adidas Ultraboost',
    'Hoodies',
    'Sneakers'
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-x-0 top-0 w-full bg-white shadow-lg border-b border-gray-100 z-[60]"
        >
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="flex items-center px-4 md:px-6 py-6">
              <FiSearch className="w-5 h-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for products, brands, or categories..."
                className="flex-1 text-lg text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors mr-2"
                >
                  <FiX className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Button */}
            {searchQuery && (
              <div className="px-4 md:px-6 pb-4">
                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded-lg"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      Search for "{searchQuery}"
                      <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {/* Popular Searches */}
          <div className="px-4 md:px-6 pb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Popular Searches
            </p>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleQuickSearch(term)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 rounded-full transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;

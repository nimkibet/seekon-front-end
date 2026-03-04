import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiArrowRight, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SearchModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  
  // Get products from Redux store for live search
  const { items: products } = useSelector(state => state.products);
  const searchTimeoutRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Close on scroll
    let scrollTimeout;
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
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

  // Live search - filter products as user types
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true);
      setShowSuggestions(true);
      
      // Debounce search to avoid too many updates
      searchTimeoutRef.current = setTimeout(() => {
        const query = searchQuery.toLowerCase();
        const filtered = products
          .filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.brand?.toLowerCase().includes(query) ||
            product.category?.toLowerCase().includes(query)
          )
          .slice(0, 8); // Limit to 8 suggestions
        setSuggestions(filtered);
        setIsSearching(false);
      }, 200); // 200ms debounce
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, products]);

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;
    
    // Navigate to collection with search query
    navigate(`/collection?search=${encodeURIComponent(searchQuery.trim())}`);
    onClose();
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleQuickSearch = (term) => {
    navigate(`/collection?search=${encodeURIComponent(term)}`);
    onClose();
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleSuggestionClick = (product) => {
    navigate(`/product/${product.id}`);
    onClose();
    setSearchQuery('');
    setSuggestions([]);
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
          className="fixed inset-x-0 top-0 w-full bg-white shadow-lg border-b border-gray-100 z-[99999]"
          style={{ zIndex: 99999 }}
        >
          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="flex items-center px-4 md:px-6 py-6">
              {isSearching ? (
                <FiLoader className="w-5 h-5 text-gray-400 mr-3 animate-spin" />
              ) : (
                <FiSearch className="w-5 h-5 text-gray-400 mr-3" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length >= 2 && setShowSuggestions(true)}
                placeholder="Search for products, brands, or categories..."
                className="flex-1 text-lg text-gray-900 placeholder-gray-400 outline-none bg-transparent"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
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

            {/* Live Search Suggestions */}
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100"
                >
                  <div className="px-4 md:px-6 py-3">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Products
                    </p>
                    <div className="space-y-1">
                      {suggestions.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          onClick={() => handleSuggestionClick(product)}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <img
                            src={product.image || product.images?.[0]}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.brand} • {product.category}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">
                            KSh {product.price?.toLocaleString()}
                          </p>
                        </button>
                      ))}
                    </div>
                    <button
                      type="submit"
                      className="w-full mt-3 px-4 py-2 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 rounded-lg"
                    >
                      Search for "{searchQuery}"
                      <FiArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Button (when no suggestions) */}
            {!showSuggestions && searchQuery && (
              <div className="px-4 md:px-6 pb-4">
                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 rounded-lg"
                >
                  <>
                    Search for "{searchQuery}"
                    <FiArrowRight className="w-4 h-4" />
                  </>
                </button>
              </div>
            )}
          </form>

          {/* Popular Searches */}
          {!showSuggestions && (
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
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModal;

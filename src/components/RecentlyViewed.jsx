import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import ProductCard from './ProductCard';

const RecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Load recently viewed products from localStorage
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      } catch (e) {
        console.error('Error parsing recently viewed:', e);
        setRecentlyViewed([]);
      }
    }
  }, []);

  if (!isVisible || recentlyViewed.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-16"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiClock className="w-5 h-5 text-[#00A676]" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Recently Viewed
          </h2>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Hide
        </button>
      </div>

      {/* Horizontal scrolling container */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
          {recentlyViewed.slice(0, 4).map((product, index) => (
            <div 
              key={`${product._id}-${index}`} 
              className="flex-shrink-0 w-64 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* View All Link */}
      <div className="mt-6 text-center">
        <Link 
          to="/collection" 
          className="inline-flex items-center gap-2 text-[#00A676] hover:text-[#008A5E] font-medium transition-colors"
        >
          View All Products
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default RecentlyViewed;

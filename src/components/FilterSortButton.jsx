import React from 'react';
import { motion } from 'framer-motion';
import { FiSliders } from 'react-icons/fi';

const FilterSortButton = ({ onClick, activeFilterCount }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`
        flex items-center space-x-3 px-6 py-3 rounded-xl font-semibold
        transition-all duration-300 relative overflow-hidden
        ${activeFilterCount > 0
          ? 'bg-[#00A676] text-white shadow-lg shadow-[#00A676]/30'
          : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
        }
        border border-gray-200 dark:border-gray-700
        hover:shadow-xl
      `}
    >
      {/* Animated background */}
      {activeFilterCount > 0 && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-[#00A676] to-[#008A5E]"
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex items-center space-x-3">
        <FiSliders className={`w-5 h-5 ${activeFilterCount > 0 ? 'animate-pulse' : ''}`} />
        <span className="text-sm sm:text-base">
          Filter and Sort{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </span>
      </div>

      {/* Active indicator */}
      {activeFilterCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
        >
          <span className="text-white text-xs font-bold">{activeFilterCount}</span>
        </motion.div>
      )}
    </motion.button>
  );
};

export default FilterSortButton;



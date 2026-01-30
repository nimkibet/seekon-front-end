import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiGrid, FiList, FiFilter } from 'react-icons/fi';

const ViewToggle = ({ viewMode, onViewModeChange, onStockFilterChange }) => {
  const [showStockOptions, setShowStockOptions] = useState(false);
  const [selectedStockFilter, setSelectedStockFilter] = useState('all');

  const stockOptions = [
    { value: 'all', label: 'All Items', icon: '📦' },
    { value: 'in-stock', label: 'In Stock', icon: '✅' },
    { value: 'low-stock', label: 'Low Stock (🔥 Almost Gone)', icon: '🔥' },
    { value: 'sold-out', label: 'Sold Out', icon: '❌' },
    { value: 'coming-soon', label: 'Coming Soon', icon: '⏰' },
    { value: 'pre-order', label: 'Pre-Order', icon: '🎯' },
    { value: 'back-in-stock', label: 'Back in Stock Alerts', icon: '🔔' }
  ];

  const handleStockFilterChange = (value) => {
    setSelectedStockFilter(value);
    setShowStockOptions(false);
    onStockFilterChange(value);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Stock Filter Dropdown */}
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowStockOptions(!showStockOptions)}
          className="flex items-center space-x-2 px-4 py-2 bg-seekon-platinumSilver hover:bg-seekon-charcoalGray text-seekon-midnight rounded-lg transition-colors duration-200 border border-seekon-charcoalGray"
        >
          <FiFilter className="w-4 h-4" />
          <span className="text-sm font-medium">
            {stockOptions.find(option => option.value === selectedStockFilter)?.label || 'All Items'}
          </span>
          <motion.div
            animate={{ rotate: showStockOptions ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </motion.button>

        {/* Stock Options Dropdown */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ 
            opacity: showStockOptions ? 1 : 0, 
            y: showStockOptions ? 0 : -10,
            scale: showStockOptions ? 1 : 0.95
          }}
          transition={{ duration: 0.2 }}
          className={`absolute top-full left-0 mt-2 w-64 bg-seekon-pureWhite rounded-lg shadow-lg border border-seekon-charcoalGray z-50 ${
            showStockOptions ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          <div className="py-2">
            {stockOptions.map((option) => (
              <motion.button
                key={option.value}
                whileHover={{ backgroundColor: '#E5E8EC' }}
                onClick={() => handleStockFilterChange(option.value)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors duration-200 ${
                  selectedStockFilter === option.value
                    ? 'bg-seekon-electricRed text-seekon-pureWhite'
                    : 'text-seekon-midnight hover:bg-seekon-platinumSilver'
                }`}
              >
                <span className="text-lg">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
                {selectedStockFilter === option.value && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center bg-seekon-platinumSilver rounded-lg p-1 border border-seekon-charcoalGray">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewModeChange('grid')}
          className={`p-2 rounded-md transition-all duration-200 ${
            viewMode === 'grid'
              ? 'bg-seekon-electricRed text-seekon-pureWhite shadow-sm'
              : 'text-seekon-midnight hover:text-seekon-electricRed hover:bg-seekon-charcoalGray'
          }`}
        >
          <FiGrid className="w-4 h-4" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewModeChange('list')}
          className={`p-2 rounded-md transition-all duration-200 ${
            viewMode === 'list'
              ? 'bg-seekon-electricRed text-seekon-pureWhite shadow-sm'
              : 'text-seekon-midnight hover:text-seekon-electricRed hover:bg-seekon-charcoalGray'
          }`}
        >
          <FiList className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

export default ViewToggle;

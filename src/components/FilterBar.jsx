import React, { useState } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FilterBar = () => {
  const [selectedCategory, setSelectedCategory] = useState('Sneakers');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedPrice, setSelectedPrice] = useState('All Prices');
  const [selectedSort, setSelectedSort] = useState('Featured');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  const categories = [
    'Sneakers',
    'Running Shoes',
    'Basketball',
    'Lifestyle',
    'Apparel',
    'Accessories'
  ];

  const brands = [
    'All Brands',
    'Nike',
    'Adidas',
    'Jordan',
    'Puma',
    'New Balance',
    'Converse',
    'Vans'
  ];

  const priceRanges = [
    'All Prices',
    'Under KSh 5,000',
    'KSh 5,000 - KSh 10,000',
    'KSh 10,000 - KSh 15,000',
    'KSh 15,000 - KSh 20,000',
    'KSh 20,000 - KSh 30,000',
    'Over KSh 30,000'
  ];

  const sortOptions = [
    'Featured',
    'Price: Low to High',
    'Price: High to Low',
    'Newest',
    'Best Selling',
    'Most Popular',
    'Customer Rating'
  ];

  const clearFilters = () => {
    setSelectedCategory('Sneakers');
    setSelectedBrand('All Brands');
    setSelectedPrice('All Prices');
    setSelectedSort('Featured');
  };

  const Dropdown = ({ isOpen, onClose, options, selectedValue, onSelect, label }) => (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={onClose}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full left-0 mt-2 w-full bg-seekon-pureWhite rounded-xl shadow-2xl border border-seekon-charcoalGray/20 z-50 overflow-hidden"
          >
            <div className="p-2">
              {options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelect(option);
                    onClose();
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                    selectedValue === option
                      ? 'bg-gradient-to-r from-seekon-electricRed to-seekon-electricRed/80 text-seekon-pureWhite'
                      : 'text-seekon-midnight hover:bg-seekon-smokeWhite hover:text-seekon-electricRed'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-seekon-pureWhite border-b border-seekon-smokeWhite shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Filter Options */}
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <div className="relative">
              <label className="text-sm font-medium text-seekon-midnight mb-1 block">
                Category:
              </label>
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="flex items-center justify-between w-28 sm:w-32 px-3 py-2 bg-seekon-pureWhite border border-seekon-smokeWhite rounded-lg text-seekon-midnight text-xs sm:text-sm hover:border-seekon-electricRed/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-seekon-electricRed/20"
              >
                <span className="truncate">{selectedCategory}</span>
                <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`} />
              </button>
              <Dropdown
                isOpen={isCategoryOpen}
                onClose={() => setIsCategoryOpen(false)}
                options={categories}
                selectedValue={selectedCategory}
                onSelect={setSelectedCategory}
                label="Category"
              />
            </div>

            {/* Brand Filter */}
            <div className="relative">
              <label className="text-sm font-medium text-seekon-midnight mb-1 block">
                Brand:
              </label>
              <button
                onClick={() => setIsBrandOpen(!isBrandOpen)}
                className="flex items-center justify-between w-28 sm:w-32 px-3 py-2 bg-seekon-pureWhite border border-seekon-smokeWhite rounded-lg text-seekon-midnight text-xs sm:text-sm hover:border-seekon-electricRed/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-seekon-electricRed/20"
              >
                <span className="truncate">{selectedBrand}</span>
                <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isBrandOpen ? 'rotate-180' : ''}`} />
              </button>
              <Dropdown
                isOpen={isBrandOpen}
                onClose={() => setIsBrandOpen(false)}
                options={brands}
                selectedValue={selectedBrand}
                onSelect={setSelectedBrand}
                label="Brand"
              />
            </div>

            {/* Price Filter */}
            <div className="relative">
              <label className="text-sm font-medium text-seekon-midnight mb-1 block">
                Price:
              </label>
              <button
                onClick={() => setIsPriceOpen(!isPriceOpen)}
                className="flex items-center justify-between w-36 sm:w-48 px-3 py-2 bg-seekon-pureWhite border border-seekon-smokeWhite rounded-lg text-seekon-midnight text-xs sm:text-sm hover:border-seekon-electricRed/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-seekon-electricRed/20"
              >
                <span className="truncate">{selectedPrice}</span>
                <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isPriceOpen ? 'rotate-180' : ''}`} />
              </button>
              <Dropdown
                isOpen={isPriceOpen}
                onClose={() => setIsPriceOpen(false)}
                options={priceRanges}
                selectedValue={selectedPrice}
                onSelect={setSelectedPrice}
                label="Price"
              />
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <label className="text-sm font-medium text-seekon-midnight mb-1 block">
                Sort by:
              </label>
              <button
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center justify-between w-28 sm:w-32 px-3 py-2 bg-seekon-pureWhite border border-seekon-smokeWhite rounded-lg text-seekon-midnight text-xs sm:text-sm hover:border-seekon-electricRed/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-seekon-electricRed/20"
              >
                <span className="truncate">{selectedSort}</span>
                <FiChevronDown className={`w-4 h-4 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} />
              </button>
              <Dropdown
                isOpen={isSortOpen}
                onClose={() => setIsSortOpen(false)}
                options={sortOptions}
                selectedValue={selectedSort}
                onSelect={setSelectedSort}
                label="Sort"
              />
            </div>
          </div>

          {/* Clear Filters Button - Glassmorphism */}
          <button
            onClick={clearFilters}
            className="relative flex items-center space-x-2 px-4 py-2 text-seekon-electricRed hover:text-seekon-pureWhite font-medium transition-all duration-300 rounded-xl overflow-hidden group"
          >
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-seekon-electricRed/10 via-seekon-electricRed/5 to-seekon-electricRed/10 backdrop-blur-sm border border-seekon-electricRed/20 rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-seekon-electricRed/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-seekon-electricRed/20 to-seekon-electricRed/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
            
            {/* Content */}
            <div className="relative z-10 flex items-center space-x-2">
              <div className="relative">
                <FiX className="w-4 h-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-90" />
                <div className="absolute inset-0 bg-seekon-electricRed/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
              <span className="transition-all duration-300 group-hover:font-semibold">Clear Filters</span>
            </div>
            
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;

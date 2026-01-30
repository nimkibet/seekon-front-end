import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronDown, FiCheck, FiSliders } from 'react-icons/fi';

const FilterSidebar = ({ isOpen, onClose, onApplyFilters, filters, onFilterChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    type: false,
    gender: false,
    color: false,
    size: false,
    price: false,
  });

  const sidebarRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCheckboxChange = (filterType, value) => {
    const currentValues = filters[filterType] || [];
    if (currentValues.includes(value)) {
      onFilterChange(filterType, currentValues.filter(v => v !== value));
    } else {
      onFilterChange(filterType, [...currentValues, value]);
    }
  };

  const handlePriceChange = (type, value) => {
    onFilterChange('priceRange', {
      ...filters.priceRange,
      [type]: value
    });
  };

  const clearAllFilters = () => {
    onFilterChange('category', []);
    onFilterChange('brand', []);
    onFilterChange('type', []);
    onFilterChange('gender', []);
    onFilterChange('color', []);
    onFilterChange('size', []);
    onFilterChange('priceRange', { min: 0, max: 100000 });
    onFilterChange('sortBy', 'newest');
  };

  const categories = ['Footwear', 'Apparel', 'Accessories'];
  const brands = ['Nike', 'Adidas', 'Puma', 'Converse', 'Jordan', 'Vans', 'New Balance'];
  const types = ['Running Shoes', 'Basketball', 'Lifestyle', 'Hoodies', 'T-Shirts', 'Jackets'];
  const genders = ['Men', 'Women', 'Unisex', 'Kids'];
  const colors = ['Black', 'White', 'Red', 'Blue', 'Gray', 'Green', 'Yellow'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '7', '8', '9', '10', '11', '12'];

  const CheckboxItem = ({ label, checked, onChange }) => (
    <button
      onClick={onChange}
      className="flex items-center space-x-3 w-full py-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
    >
      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
        checked 
          ? 'bg-[#00A676] border-[#00A676]' 
          : 'border-gray-300 dark:border-gray-600'
      }`}>
        {checked && <FiCheck className="w-4 h-4 text-white" />}
      </div>
      <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );

  const CollapsibleSection = ({ title, expanded, onToggle, children }) => (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <FiChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>
      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="pb-4 space-y-2"
        >
          {children}
        </motion.div>
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            ref={sidebarRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Filter & Sort
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <FiX className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Category Filter */}
              <CollapsibleSection
                title="Category"
                expanded={expandedSections.category}
                onToggle={() => toggleSection('category')}
              >
                {categories.map((category) => (
                  <CheckboxItem
                    key={category}
                    label={category}
                    checked={filters.category?.includes(category) || false}
                    onChange={() => handleCheckboxChange('category', category)}
                  />
                ))}
              </CollapsibleSection>

              {/* Brand Filter */}
              <CollapsibleSection
                title="Brand"
                expanded={expandedSections.brand}
                onToggle={() => toggleSection('brand')}
              >
                {brands.map((brand) => (
                  <CheckboxItem
                    key={brand}
                    label={brand}
                    checked={filters.brand?.includes(brand) || false}
                    onChange={() => handleCheckboxChange('brand', brand)}
                  />
                ))}
              </CollapsibleSection>

              {/* Type Filter */}
              <CollapsibleSection
                title="Type"
                expanded={expandedSections.type}
                onToggle={() => toggleSection('type')}
              >
                {types.map((type) => (
                  <CheckboxItem
                    key={type}
                    label={type}
                    checked={filters.type?.includes(type) || false}
                    onChange={() => handleCheckboxChange('type', type)}
                  />
                ))}
              </CollapsibleSection>

              {/* Gender Filter */}
              <CollapsibleSection
                title="Gender"
                expanded={expandedSections.gender}
                onToggle={() => toggleSection('gender')}
              >
                {genders.map((gender) => (
                  <CheckboxItem
                    key={gender}
                    label={gender}
                    checked={filters.gender?.includes(gender) || false}
                    onChange={() => handleCheckboxChange('gender', gender)}
                  />
                ))}
              </CollapsibleSection>

              {/* Color Filter */}
              <CollapsibleSection
                title="Color"
                expanded={expandedSections.color}
                onToggle={() => toggleSection('color')}
              >
                <div className="grid grid-cols-4 gap-3">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleCheckboxChange('color', color)}
                      className="relative"
                    >
                      <div className={`w-12 h-12 rounded-full border-2 transition-all ${
                        filters.color?.includes(color)
                          ? 'border-[#00A676] ring-2 ring-[#00A676]/30 scale-110'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      style={{ backgroundColor: getColorValue(color) }}
                      />
                      <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {color}
                      </span>
                    </button>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Size Filter */}
              <CollapsibleSection
                title="Size"
                expanded={expandedSections.size}
                onToggle={() => toggleSection('size')}
              >
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleCheckboxChange('size', size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        filters.size?.includes(size)
                          ? 'bg-[#00A676] text-white border-[#00A676]'
                          : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-[#00A676]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </CollapsibleSection>

              {/* Price Range Filter */}
              <CollapsibleSection
                title="Price Range"
                expanded={expandedSections.price}
                onToggle={() => toggleSection('price')}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>KSh {filters.priceRange?.min || 0}</span>
                    <span>KSh {filters.priceRange?.max || 100000}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={filters.priceRange?.min || 0}
                    onChange={(e) => handlePriceChange('min', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00A676]"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={filters.priceRange?.max || 100000}
                    onChange={(e) => handlePriceChange('max', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#00A676]"
                  />
                </div>
              </CollapsibleSection>

              {/* Sort Options */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Sort By</h3>
                {['newest', 'price-low', 'price-high', 'alphabetical'].map((sort) => (
                  <CheckboxItem
                    key={sort}
                    label={getSortLabel(sort)}
                    checked={filters.sortBy === sort}
                    onChange={() => onFilterChange('sortBy', sort)}
                  />
                ))}
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 space-y-3">
              <button
                onClick={() => {
                  onApplyFilters();
                  onClose();
                }}
                className="w-full bg-[#00A676] hover:bg-[#008A5E] text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FiCheck className="w-5 h-5" />
                <span>Apply Filters</span>
              </button>
              <button
                onClick={clearAllFilters}
                className="w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <FiX className="w-5 h-5" />
                <span>Clear All</span>
              </button>
              <button
                onClick={onClose}
                className="w-full border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const getColorValue = (color) => {
  const colors = {
    'Black': '#000000',
    'White': '#ffffff',
    'Red': '#ef4444',
    'Blue': '#3b82f6',
    'Gray': '#6b7280',
    'Green': '#22c55e',
    'Yellow': '#eab308',
  };
  return colors[color] || '#000000';
};

const getSortLabel = (sort) => {
  const labels = {
    'newest': 'Newest First',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    'alphabetical': 'Alphabetical (A-Z)',
  };
  return labels[sort] || sort;
};

export default FilterSidebar;



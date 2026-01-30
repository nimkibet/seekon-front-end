import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts, setFilters, applyFilters } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import FilterSortButton from '../components/FilterSortButton';
import FilterSidebar from '../components/FilterSidebar';
import { FiFilter, FiX } from 'react-icons/fi';

const categories = [
  { name: 'All Products', value: 'all' },
  { name: 'All Footwear', value: 'Footwear' },
  { name: 'All Apparel', value: 'Apparel' },
  { name: 'All Accessories', value: 'Accessories' }
];

const Collection = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { filteredProducts, isLoading, products } = useSelector(state => state.products);
  const [activeCategory, setActiveCategory] = useState(categories[0]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  
  // Filter state
  const [filters, setFilters] = useState({
    category: [],
    brand: [],
    type: [],
    gender: [],
    color: [],
    size: [],
    priceRange: { min: 0, max: 100000 },
    sortBy: 'newest'
  });

  useEffect(() => {
    dispatch(fetchProducts());
    
    // Listen for product updates from admin
    const handleProductsUpdated = () => {
      console.log('📢 Products updated event received in Collection, refreshing...');
      dispatch(fetchProducts());
    };
    
    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, [dispatch]);

  useEffect(() => {
    // Apply URL parameters from navbar dropdowns
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const gender = searchParams.get('gender');
    const product = searchParams.get('product');
    
    // Set active category based on URL
    if (category) {
      const foundCategory = categories.find(c => 
        c.value.toLowerCase() === category.toLowerCase()
      );
      if (foundCategory) {
        setActiveCategory(foundCategory);
      } else if (category.toLowerCase() === 'sneakers') {
        setActiveCategory(categories[1]); // All Footwear
      } else if (category.toLowerCase() === 'apparel') {
        setActiveCategory(categories[2]); // All Apparel
      }
    }
  }, [searchParams]);

  // Load filters from localStorage
  useEffect(() => {
    const savedFilters = localStorage.getItem('collectionFilters');
    if (savedFilters) {
      setFilters(JSON.parse(savedFilters));
    }
  }, []);

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem('collectionFilters', JSON.stringify(filters));
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically through the filtering logic
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category?.length > 0) count += filters.category.length;
    if (filters.brand?.length > 0) count += filters.brand.length;
    if (filters.type?.length > 0) count += filters.type.length;
    if (filters.gender?.length > 0) count += filters.gender.length;
    if (filters.color?.length > 0) count += filters.color.length;
    if (filters.size?.length > 0) count += filters.size.length;
    if (filters.priceRange?.min > 0 || filters.priceRange?.max < 100000) count += 1;
    return count;
  };

  // Get filtered products based on active category and URL params
  const getFilteredProducts = () => {
    let filtered = [...products];
    
    // Get URL parameters (for navbar navigation)
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const gender = searchParams.get('gender');
    const product = searchParams.get('product');
    const search = searchParams.get('search');
    
    // Apply search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchTerm) ||
        p.brand.toLowerCase().includes(searchTerm) ||
        p.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply filter sidebar selections
    if (filters.category?.length > 0) {
      filtered = filtered.filter(p => 
        filters.category.includes(p.category)
      );
    } else if (category || (activeCategory.value !== 'all')) {
      // Apply category filter from URL or active category if no sidebar filter
      const categoryFilter = category || (activeCategory.value !== 'all' ? activeCategory.value : null);
      if (categoryFilter && categoryFilter.toLowerCase() !== 'all') {
        filtered = filtered.filter(p => {
          const prodCategory = p.category?.toLowerCase();
          return prodCategory === categoryFilter.toLowerCase() ||
                 prodCategory === 'sneakers' ||
                 prodCategory === 'footwear';
        });
      }
    }
    
    // Apply brand filter (sidebar or URL)
    if (filters.brand?.length > 0) {
      filtered = filtered.filter(p => filters.brand.includes(p.brand));
    } else if (brand) {
      filtered = filtered.filter(p => 
        p.brand?.toLowerCase() === brand.toLowerCase()
      );
    }
    
    // Apply gender filter (sidebar or URL)
    if (filters.gender?.length > 0) {
      filtered = filtered.filter(p => filters.gender.includes(p.gender));
    } else if (gender) {
      filtered = filtered.filter(p => 
        p.gender?.toLowerCase() === gender.toLowerCase()
      );
    }
    
    // Apply size filter
    if (filters.size?.length > 0) {
      filtered = filtered.filter(p => 
        filters.size.some(size => p.sizes?.includes(size))
      );
    }
    
    // Apply color filter
    if (filters.color?.length > 0) {
      filtered = filtered.filter(p => 
        filters.color.some(color => p.colors?.includes(color))
      );
    }
    
    // Apply price range filter
    if (filters.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
      );
    }
    
    // Apply sorting
    const sortType = filters.sortBy || sortBy;
    if (sortType === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortType === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortType === 'alphabetical') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortType === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
    }

    return filtered;
  };

  const displayProducts = getFilteredProducts();
  const productCount = displayProducts.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      {/* Dynamic Title - Only show when there's a category/filter active */}
      {(() => {
        const brand = searchParams.get('brand');
        const gender = searchParams.get('gender');
        const product = searchParams.get('product');
        const category = searchParams.get('category');
        
        // Only show title section if there's a filter active
        if (!category && !brand && !gender && !product) return null;
        
        return (
          <div className="container mx-auto px-4 py-6 text-center">
            <motion.h1
              key={activeCategory.name}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2"
            >
              {(() => {
                // Show category titles only for main category views
                if (category) {
                  const categoryTitles = {
                    'sneakers': 'ALL FOOTWEAR',
                    'running': 'RUNNING SHOES',
                    'basketball': 'BASKETBALL',
                    'lifestyle': 'LIFESTYLE',
                    'apparel': 'ALL APPAREL',
                    'accessories': 'ALL ACCESSORIES',
                    'footwear': 'ALL FOOTWEAR',
                    'tshirts': 'T-SHIRTS',
                    'hoodies': 'HOODIES',
                    'jackets': 'JACKETS',
                    'bags': 'BAGS',
                    'hats': 'HATS',
                    'socks': 'SOCKS'
                  };
                  
                  // Check if it's a main category view (not a sub-filter)
                  if (categoryTitles[category.toLowerCase()] && !brand && !gender && !product) {
                    return categoryTitles[category.toLowerCase()];
                  }
                }
                
                // For sub-filters (brand, gender, product), show them as titles
                if (brand) return brand.toUpperCase();
                if (gender) return gender.toUpperCase();
                if (product) {
                  return product.split('-').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ');
                }
                
                return '';
              })()}
            </motion.h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              {productCount} {productCount === 1 ? 'product' : 'products'} found
            </p>
          </div>
        );
      })()}

      {/* Filter and Sort Bar - Kicks Kenya Style */}
      <div className="bg-white dark:bg-gray-800 border-y border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <FilterSortButton 
              onClick={() => setShowFilters(true)}
              activeFilterCount={getActiveFilterCount()}
            />
            <select 
              value={filters.sortBy || sortBy} 
              onChange={(e) => {
                const newSort = e.target.value;
                handleFilterChange('sortBy', newSort);
                setSortBy(newSort);
              }}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-xs sm:text-sm font-medium"
            >
              <option value="newest">DATE, NEWEST</option>
              <option value="price-low">PRICE, LOW TO HIGH</option>
              <option value="price-high">PRICE, HIGH TO LOW</option>
              <option value="alphabetical">NAME, A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid with Animation */}
      <div id="products-section" className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : displayProducts.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory.value}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {displayProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600 dark:text-gray-400">No products found</p>
            <button 
              onClick={() => setActiveCategory(categories[0])}
              className="mt-4 px-6 py-2 bg-[#00A676] text-white rounded-lg hover:bg-[#008A5E] transition-colors"
            >
              View All Products
            </button>
          </div>
        )}
      </div>
      
      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApplyFilters={handleApplyFilters}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
};

export default Collection;

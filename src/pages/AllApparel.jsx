import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFilter, FiX } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';

const AllApparel = () => {
  const dispatch = useDispatch();
  const { products, isLoading } = useSelector(state => state.products);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeFilter, setActiveFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  
  // Load More pagination state
  const [displayedCount, setDisplayedCount] = useState(20); // Initial display
  const breakpoint = 20; // Number of products to load per batch
  
  // Listen for product updates from admin
  useEffect(() => {
    const handleProductsUpdated = () => {
      console.log('📢 Products updated event received in AllApparel, refreshing...');
      dispatch(fetchProducts());
    };
    
    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, [dispatch]);
  
  useEffect(() => {
    const apparel = products.filter(p => p.category === 'Apparel' || p.category === 'apparel');
    setFilteredProducts(apparel);
    setDisplayedCount(20); // Reset to initial count when products change
  }, [products]);
  
  // Load More handler
  const handleLoadMore = () => {
    setDisplayedCount(prev => Math.min(prev + breakpoint, filteredProducts.length));
  };

  // Get products to display
  const displayedProducts = filteredProducts.slice(0, displayedCount);
  const hasMoreProducts = displayedCount < filteredProducts.length;
  
  // Generate placeholder cards to ALWAYS fill the grid to 20 cards
  const totalVisible = 20; // Always show exactly 20 cards
  const neededPlaceholders = totalVisible - displayedProducts.length;
  const placeholders = Array.from({ length: Math.max(0, neededPlaceholders) }, (_, i) => ({ id: `placeholder-${i}`, isPlaceholder: true }));

  const handleFilter = (filterType, filterValue) => {
    let filtered = products.filter(p => p.category === 'Apparel' || p.category === 'apparel');
    
    if (filterType === 'brand') {
      filtered = filtered.filter(p => p.brand?.toLowerCase() === filterValue.toLowerCase());
    } else if (filterType === 'gender') {
      filtered = filtered.filter(p => p.gender?.toLowerCase() === filterValue.toLowerCase());
    } else if (filterType === 'type') {
      if (filterValue === 'tshirts') {
        filtered = filtered.filter(p => p.name?.toLowerCase().includes('shirt') || p.name?.toLowerCase().includes('tee'));
      } else if (filterValue === 'hoodies') {
        filtered = filtered.filter(p => p.name?.toLowerCase().includes('hoodie'));
      } else if (filterValue === 'jackets') {
        filtered = filtered.filter(p => p.name?.toLowerCase().includes('jacket'));
      }
    }
    
    setFilteredProducts(filtered);
    setActiveFilter(filterValue);
  };

  const handleSort = (sortValue) => {
    setSortBy(sortValue);
    let sorted = [...filteredProducts];
    
    if (sortValue === 'price-low') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-high') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortValue === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortValue === 'date') {
      sorted.sort((a, b) => new Date(b.createdAt || b.id) - new Date(a.createdAt || a.id));
    }
    
    setFilteredProducts(sorted);
  };

  const clearFilter = () => {
    const apparel = products.filter(p => p.category === 'Apparel' || p.category === 'apparel');
    setFilteredProducts(apparel);
    setActiveFilter('');
  };

  const getHeading = () => {
    if (activeFilter) {
      return activeFilter.toUpperCase();
    }
    return 'ALL APPAREL';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-6">
        <nav className="text-sm text-gray-600 dark:text-gray-400">
          <a href="/" className="hover:text-[#00A676] underline">Home</a>
          <span className="mx-2">/</span>
          <a href="/collection" className="hover:text-[#00A676] underline">Shop</a>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-gray-100">All Apparel</span>
        </nav>
      </div>

      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {getHeading()}
        </h1>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
          {activeFilter ? `Showing ${activeFilter} apparel products.` : 'Shop premium apparel and activewear from top brands like Nike, Adidas, Puma, and more. Find your perfect fit with our curated selection of t-shirts, hoodies, joggers, and athletic wear.'}
        </p>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-500 mt-4">
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </p>
        {activeFilter && (
          <button 
            onClick={clearFilter}
            className="mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2 mx-auto"
          >
            <FiX className="w-4 h-4" />
            <span>Clear Filter</span>
          </button>
        )}
      </div>

      <div className="container mx-auto px-4 py-4 border-t border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <FiFilter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100">
              FILTER AND SORT
            </span>
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => handleSort(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
          >
            <option value="date">DATE, NEWEST</option>
            <option value="price-low">PRICE, LOW TO HIGH</option>
            <option value="price-high">PRICE, HIGH TO LOW</option>
            <option value="name">NAME, A-Z</option>
          </select>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-4">
          {/* Type Filters */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Type</h3>
            <button 
              onClick={() => handleFilter('type', 'tshirts')} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeFilter === 'tshirts' ? 'bg-[#00A676] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              T-Shirts
            </button>
            <button 
              onClick={() => handleFilter('type', 'hoodies')} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeFilter === 'hoodies' ? 'bg-[#00A676] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Hoodies
            </button>
            <button 
              onClick={() => handleFilter('type', 'jackets')} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeFilter === 'jackets' ? 'bg-[#00A676] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Jackets
            </button>
          </div>

          {/* Brand Filters */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Brand</h3>
            <button 
              onClick={() => handleFilter('brand', 'nike')} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeFilter === 'nike' ? 'bg-[#00A676] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Nike
            </button>
            <button 
              onClick={() => handleFilter('brand', 'adidas')} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeFilter === 'adidas' ? 'bg-[#00A676] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Adidas
            </button>
            <button 
              onClick={() => handleFilter('brand', 'puma')} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeFilter === 'puma' ? 'bg-[#00A676] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Puma
            </button>
            <button 
              onClick={() => handleFilter('brand', 'jordan')} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeFilter === 'jordan' ? 'bg-[#00A676] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Jordan
            </button>
          </div>

          {/* Gender Filters */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Gender</h3>
            <button 
              onClick={() => handleFilter('gender', 'mens')} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeFilter === 'mens' ? 'bg-[#00A676] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Mens
            </button>
            <button 
              onClick={() => handleFilter('gender', 'womens')} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeFilter === 'womens' ? 'bg-[#00A676] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Womens
            </button>
            <button 
              onClick={() => handleFilter('gender', 'kids')} 
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeFilter === 'kids' ? 'bg-[#00A676] text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
            >
              Kids
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
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
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedProducts.map((product) => (
                <ProductCard key={product._id || product.id} product={product} />
              ))}
              {placeholders.map((placeholder, index) => {
                const productToShow = displayedProducts.length > 0 ? displayedProducts[index % displayedProducts.length] : null;
                return (
                  <ProductSkeleton 
                    key={placeholder.id}
                    imageUrl={productToShow?.image || null}
                  />
                );
              })}
            </div>
            
            {/* Load More Button */}
            {hasMoreProducts && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  className="px-12 py-4 bg-black hover:bg-gray-900 text-white font-bold text-sm uppercase tracking-wide transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  LOAD MORE
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-lg text-gray-600 dark:text-gray-400">No products found for this filter</p>
            <button 
              onClick={clearFilter}
              className="mt-4 px-6 py-2 bg-[#00A676] text-white rounded-lg hover:bg-[#008A5E] transition-colors"
            >
              Clear Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllApparel;

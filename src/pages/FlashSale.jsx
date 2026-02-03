import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import FlashSaleCountdown from '../components/FlashSaleCountdown';
import FilterBar from '../components/FilterBar';
import { ProductCardSkeleton, EmptyState } from '../components/Fallbacks';
import toast from 'react-hot-toast';

const FlashSale = () => {
  const dispatch = useDispatch();
  const { products, isLoading, error } = useSelector(state => state.products);
  const [sortBy, setSortBy] = useState('ending-soon');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    dispatch(fetchProducts())
      .unwrap()
      .then(() => {
        toast.success('Flash sale products loaded!');
      })
      .catch((err) => {
        console.error('Error loading products:', err);
        toast.error('Failed to load flash sale products');
      });
  }, [dispatch]);

  // Filter only flash sale products
  const flashSaleProducts = products.filter(product => 
    product.isFlashSale && 
    product.flashSalePrice && 
    product.saleStartTime && 
    product.saleEndTime
  );

  // Sort flash sale products
  const sortedProducts = [...flashSaleProducts].sort((a, b) => {
    switch (sortBy) {
      case 'ending-soon':
        return new Date(a.saleEndTime) - new Date(b.saleEndTime);
      case 'price-low':
        return (a.flashSalePrice || a.price) - (b.flashSalePrice || b.price);
      case 'price-high':
        return (b.flashSalePrice || b.price) - (a.flashSalePrice || a.price);
      case 'discount':
        const discountA = ((a.price - (a.flashSalePrice || a.price)) / a.price) * 100;
        const discountB = ((b.price - (b.flashSalePrice || b.price)) / b.price) * 100;
        return discountB - discountA;
      default:
        return 0;
    }
  });

  // Calculate stats
  const totalSavings = flashSaleProducts.reduce((sum, product) => {
    return sum + (product.price - (product.flashSalePrice || product.price));
  }, 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Flash Sale</h2>
          <p className="text-gray-600 dark:text-gray-400">{error}</p>
          <button 
            onClick={() => dispatch(fetchProducts())}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-yellow-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12">
          {/* Back button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>

          {/* Title Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <motion.div 
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-xl font-bold text-lg mb-4 shadow-lg"
              >
                🔥 FLASH SALE
              </motion.div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2">
                MEGA DISCOUNT EVENT
              </h1>
              <p className="text-red-100 text-lg">
                Up to {flashSaleProducts.length > 0 ? Math.max(...flashSaleProducts.map(p => Math.round(((p.price - (p.flashSalePrice || p.price)) / p.price) * 100))) : 0}% OFF on selected items
              </p>
            </div>

            {/* Stats & Countdown */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Stats Cards */}
              <div className="flex gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-white">{flashSaleProducts.length}</div>
                  <div className="text-xs text-red-100">Products</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 text-center">
                  <div className="text-2xl font-bold text-white">KSh {totalSavings.toLocaleString()}</div>
                  <div className="text-xs text-red-100">Total Savings</div>
                </div>
              </div>
              
              {/* Countdown */}
              <div className="bg-white rounded-xl p-4 shadow-lg min-w-[200px]">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <FiClock className="w-4 h-4" />
                  <span className="text-sm font-medium">Ending Soon</span>
                </div>
                <FlashSaleCountdown products={flashSaleProducts} variant="large" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Products */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Flash Sale Products
            </h2>
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              {flashSaleProducts.length} items
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="ending-soon">Ending Soon</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="discount">Biggest Discount</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500'}`}
              >
                <FiGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow' : 'text-gray-500'}`}
              >
                <FiList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}>
            {[...Array(10)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : flashSaleProducts.length === 0 ? (
          <EmptyState 
            title="No Flash Sale Products"
            description="Check back later for amazing deals!"
            icon="🔥"
          />
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'}`}
          >
            {sortedProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FlashSale;

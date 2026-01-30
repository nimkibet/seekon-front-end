import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { fetchProducts } from '../store/slices/productSlice';
import HeroBanner from '../components/HeroBanner';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import PromotionalBanner from '../components/PromotionalBanner';
import { SectionFallback, ProductCardSkeleton, EmptyState } from '../components/Fallbacks';
import toast from 'react-hot-toast';

const Home = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { products, isLoading, error } = useSelector(state => state.products);
  const [email, setEmail] = useState('');
  const isAdminView = new URLSearchParams(location.search).get('admin') === 'true';

  useEffect(() => {
    dispatch(fetchProducts())
      .unwrap()
      .then(() => {
        // Only show toast on initial load, not on updates
        if (products.length === 0) {
          toast.success('Products loaded successfully!');
        }
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products. Please try again.');
      });
    
    // Listen for product updates from admin
    const handleProductsUpdated = () => {
      dispatch(fetchProducts());
    };
    
    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, [dispatch, products.length]);

  const handleNewsletterSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    // Simulate newsletter subscription
    toast.success('Successfully subscribed to newsletter!');
    setEmail('');
  };

  // Simple test render first
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Loading Seekon Apparel...</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Please wait while we load the latest products</p>
        </div>
      </div>
    );
  }

  // Get different product categories for sections - limit to 6 each
  const trendingProducts = products.filter(product => product.isFeatured).slice(0, 6);
  const newProducts = products.filter(product => product.newProduct).slice(0, 6);
  const saleProducts = products.filter(product => product.discount > 0).slice(0, 6);
  
  // FIXED: Use case-insensitive category filtering - limit to 6 each
  const sneakers = products.filter(product => product.category?.toLowerCase() === 'sneakers').slice(0, 6);
  const apparel = products.filter(product => product.category?.toLowerCase() === 'apparel').slice(0, 6);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-seekon-platinumSilver">
      {/* Admin Mode Banner */}
      {isAdminView && (
        <div className="bg-gradient-to-r from-[#00A676] to-[#008A5E] text-white p-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Admin Shop View Mode</span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">You're viewing as admin</span>
          </div>
          <Link 
            to="/admin/dashboard"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium"
          >
            Back to Admin Dashboard
          </Link>
        </div>
      )}

      {/* Promotional Banner */}
      <PromotionalBanner 
        message="Seekon Apparel — Live bold. Dress sharper. Walk your story. • NEW ARRIVALS: LIMITED TIME OFFER - UPTO 30% OFF ON SELECTED ITEMS!"
        backgroundColor="bg-gradient-primary"
        textColor="text-seekon-pureWhite"
        showIcons={true}
        animated={true}
        scrollSpeed="slow"
      />
      
      {/* Hero Banner */}
      <HeroBanner />

      {/* Main Content */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-12 bg-seekon-platinumSilver">
        {/* Trending Now Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <motion.h2
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              >
                Trending Now
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
              >
                Discover the most popular sneakers and apparel that everyone's talking about
              </motion.p>
            </div>
            <Link
              to="/collection?filter=featured"
              className="text-[#00A676] hover:text-[#008A5E] font-medium whitespace-nowrap ml-4"
            >
              See All →
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-300 dark:bg-gray-700 rounded-xl h-64 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-4 md:gap-6"
            >
              {trendingProducts.map((product) => (
                <motion.div key={product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        {/* Categories Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <motion.h2
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
            >
              Shop by Category
            </motion.h2>
            <motion.p
              variants={itemVariants}
              className="text-lg text-gray-600 dark:text-gray-400"
            >
              Find exactly what you're looking for
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sneakers */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Sneakers
                </h3>
                <Link
                  to="/collection/sneakers"
                  className="text-[#00A676] hover:text-[#008A5E] text-sm font-medium"
                >
                  See All →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {sneakers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.div>

            {/* Apparel */}
            <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Apparel
                </h3>
                <Link
                  to="/collection/apparel"
                  className="text-[#00A676] hover:text-[#008A5E] text-sm font-medium"
                >
                  See All →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {apparel.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* New Arrivals Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <motion.h2
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              >
                New Arrivals
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-lg text-gray-600 dark:text-gray-400"
              >
                Be the first to get your hands on the latest drops
              </motion.p>
            </div>
            <Link
              to="/collection?filter=new"
              className="text-[#00A676] hover:text-[#008A5E] font-medium whitespace-nowrap ml-4"
            >
              See All →
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6"
          >
            {newProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Sale Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <motion.h2
                variants={itemVariants}
                className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4"
              >
                Limited Time Offers
              </motion.h2>
              <motion.p
                variants={itemVariants}
                className="text-lg text-gray-600 dark:text-gray-400"
              >
                Don't miss out on these amazing deals
              </motion.p>
            </div>
            <Link
              to="/collection?filter=sale"
              className="text-[#00A676] hover:text-[#008A5E] font-medium whitespace-nowrap ml-4"
            >
              See All →
            </Link>
          </div>

          <motion.div
            variants={containerVariants}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6"
          >
            {saleProducts.map((product) => (
              <motion.div key={product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Newsletter Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 text-center"
          style={{
            background: 'linear-gradient(135deg, #FAFAFA 0%, #1F1F1F 100%)'
          }}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-[#FAFAFA]"
                style={{ textShadow: '0 2px 4px rgba(31,31,31,0.5)' }}>
              Stay in the Loop
            </h2>
            <p className="text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto text-[#FAFAFA]"
               style={{ textShadow: '0 2px 4px rgba(31,31,31,0.5)' }}>
              Get exclusive access to new drops, special offers, and style tips delivered straight to your inbox.
            </p>
            <div className="max-w-sm sm:max-w-md mx-auto flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-[#1F1F1F] bg-[#FAFAFA] border-2 border-[#00A676] focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 placeholder:text-gray-600"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewsletterSubscribe}
                className="px-6 py-3 bg-[#00A676] text-[#FAFAFA] font-semibold rounded-lg hover:bg-[#008A5E] transition-colors duration-200"
              >
                Subscribe
              </motion.button>
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  );
};

export default Home;


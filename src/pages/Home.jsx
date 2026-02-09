import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiZap } from 'react-icons/fi';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/ProductCard';
import PromotionalBanner from '../components/PromotionalBanner';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';

const Home = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { products, isLoading, error } = useSelector(state => state.products);
  const { flashSaleSettings } = useSettings();
  const [email, setEmail] = useState('');
  // Force flash sale for testing - set to true to always show
  const [endTime, setEndTime] = useState(Date.now() + 86400000); // DEBUG: 24 hours from now
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(true); // DEBUG: Force true for testing
  const isAdminView = new URLSearchParams(location.search).get('admin') === 'true';

  // Dynamic hero settings from backend
  const [heroSettings, setHeroSettings] = useState({
    heroVideoUrl: "https://res.cloudinary.com/demo/video/upload/v1689264426/running_shoes_promo.mp4",
    heroHeading: "STEP INTO THE FUTURE",
    heroSubtitle: "Discover the latest drops from Nike, Adidas, Jordan, and more.",
    heroOverlayOpacity: 50,
    heroHeight: 85,
    heroHeadingSize: 'large',
    showHeroBadge: true
  });

  const SETTINGS_URL = 'https://seekoon-backend-production.up.railway.app/api/settings/flash-sale';
  const HOME_SETTINGS_URL = 'https://seekoon-backend-production.up.railway.app/api/settings/home';

  const isVideo = (url) => url && (url.includes('/video/') || url.endsWith('.mp4') || url.endsWith('.webm'));
  const fontSizeClasses = {
    small: 'text-3xl md:text-5xl',
    medium: 'text-4xl md:text-6xl',
    large: 'text-5xl md:text-7xl',
    xlarge: 'text-6xl md:text-8xl'
  };

  useEffect(() => {
    dispatch(fetchProducts())
      .unwrap()
      .then(() => {
        if (products.length === 0) {
          toast.success('Products loaded successfully!');
        }
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products. Please try again.');
      });
    
    const handleProductsUpdated = () => {
      dispatch(fetchProducts());
    };
    
    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, [dispatch, products.length]);

  // Sync with SettingsContext for flash sale state
  useEffect(() => {
    if (flashSaleSettings) {
      setIsFlashSaleActive(flashSaleSettings.isActive === true);
      if (flashSaleSettings.endTime) {
        setEndTime(new Date(flashSaleSettings.endTime).getTime());
      }
    }
  }, [flashSaleSettings]);

  // Fetch hero and flash sale settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Fetch hero settings
        try {
          const homeRes = await axios.get(HOME_SETTINGS_URL);
          console.log("Hero settings response:", homeRes.data);
          if (homeRes.data) {
            setHeroSettings(prev => ({ ...prev, ...homeRes.data }));
          }
        } catch (e) {
          console.log("Using default hero settings", e.message);
        }

        // Fetch flash sale settings - direct access without .value wrapper
        const settingsRes = await axios.get(SETTINGS_URL);
        console.log("Flash sale settings response:", settingsRes.data);
        const settingsData = settingsRes.data;
        
        // Also try SettingsContext if available
        if (settingsData && typeof settingsData === 'object') {
          setIsFlashSaleActive(settingsData.isActive === true);
          if (settingsData.endTime) {
            setEndTime(new Date(settingsData.endTime).getTime());
          }
        }
      } catch (error) {
        console.error("Error fetching settings:", error.message);
      }
    };
    fetchSettings();
  }, []);

  // Timer logic
  useEffect(() => {
    if (!endTime || !isFlashSaleActive) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;
      if (distance < 0) {
        clearInterval(timer);
        setEndTime(null);
        setIsFlashSaleActive(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime, isFlashSaleActive]);

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
    toast.success('Successfully subscribed to newsletter!');
    setEmail('');
  };

  // Get different product categories for sections
  const trendingProducts = products.filter(product => product.isFeatured).slice(0, 8);
  const newProducts = products.filter(product => product.newProduct).slice(0, 8);
  const saleProducts = products.filter(product => product.discount > 0).slice(0, 8);
  const sneakers = products.filter(product => product.category?.toLowerCase() === 'sneakers').slice(0, 4);
  const apparel = products.filter(product => product.category?.toLowerCase() === 'apparel').slice(0, 4);
  
  // Flash sale products - use demo products if none found
  const rawFlashSaleProducts = products.filter(p => 
    p.onFlashSale === true || (p.flashSalePrice && p.flashSalePrice > 0)
  ).slice(0, 6);
  
  // Demo products for testing when no flash sale products exist
  const demoFlashSaleProducts = [
    { _id: 'demo1', name: 'Nike Air Max', price: 15000, flashSalePrice: 9999, images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' }] },
    { _id: 'demo2', name: 'Adidas Ultraboost', price: 18000, flashSalePrice: 12999, images: [{ url: 'https://images.unsplash.com/photo-1520256862855-398228c41684?w=400' }] },
    { _id: 'demo3', name: 'Nike Air Jordan 1', price: 25000, flashSalePrice: 19999, images: [{ url: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400' }] },
    { _id: 'demo4', name: 'Puma RS-X', price: 12000, flashSalePrice: 7999, images: [{ url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400' }] },
    { _id: 'demo5', name: 'New Balance 574', price: 14000, flashSalePrice: 9999, images: [{ url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=400' }] },
    { _id: 'demo6', name: 'Reebok Classic', price: 10000, flashSalePrice: 6999, images: [{ url: 'https://images.unsplash.com/photo-1552346154-21d32cc4bc09?w=400' }] }
  ];
  
  // Use real products if available, otherwise demo products
  const flashSaleProducts = rawFlashSaleProducts.length > 0 ? rawFlashSaleProducts : demoFlashSaleProducts;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Custom Hero Section with dynamic settings
  const CustomHeroSection = () => (
    <div 
      className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden"
      style={{ minHeight: `${heroSettings.heroHeight}vh` }}
    >
      {/* Dynamic Background Media */}
      <div className="absolute inset-0 z-0">
        {isVideo(heroSettings.heroVideoUrl) ? (
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover opacity-50"
          >
            <source src={heroSettings.heroVideoUrl} type="video/mp4" />
          </video>
        ) : (
          <img 
            src={heroSettings.heroVideoUrl} 
            alt="Hero Background"
            className="w-full h-full object-cover opacity-50"
          />
        )}
      </div>
      
      {/* Dynamic Overlay */}
      <div 
        className="absolute inset-0 z-1"
        style={{ backgroundColor: `rgba(0,0,0,${heroSettings.heroOverlayOpacity / 100})` }}
      ></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10" style={{ paddingTop: `${heroSettings.heroHeight * 0.15}px`, paddingBottom: `${heroSettings.heroHeight * 0.15}px` }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center md:text-left">
            {heroSettings.showHeroBadge && (
              <div className="inline-flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                <FiZap size={16} /> New Collection 2025
              </div>
            )}
            <h1 className={`${fontSizeClasses[heroSettings.heroHeadingSize]} font-black mb-6 leading-tight tracking-tighter uppercase drop-shadow-lg transition-all duration-500`}>
              {heroSettings.heroHeading}
            </h1>
            <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-lg">
              {heroSettings.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link 
                to="/collection" 
                className="inline-flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-full font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-xl"
              >
                Shop Now
              </Link>
              {isFlashSaleActive && (
                <Link 
                  to="/flash-sale" 
                  className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-4 rounded-full font-bold hover:bg-red-700 transition-all hover:scale-105 shadow-xl"
                >
                  🔥 Flash Sale
                </Link>
              )}
            </div>
          </div>
          
          {/* Timer Card - Only show when flash sale is active */}
          {isFlashSaleActive && heroSettings.heroHeight > 60 && (
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center gap-2 mb-4 text-sm font-bold uppercase tracking-widest opacity-80">
                <FiClock size={16} /> Ending In
              </div>
              <div className="flex gap-3">
                {['Days', 'Hours', 'Mins', 'Secs'].map((label) => {
                  const values = { Days: Math.floor((endTime - new Date().getTime()) / (1000 * 60 * 60 * 24)), Hours: Math.floor(((endTime - new Date().getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), Mins: Math.floor(((endTime - new Date().getTime()) % (1000 * 60 * 60)) / (1000 * 60)), Secs: Math.floor(((endTime - new Date().getTime()) % (1000 * 60)) / 1000) };
                  return (
                    <div key={label} className="bg-white text-red-600 rounded-lg p-3 min-w-[70px] text-center">
                      <div className="text-2xl md:text-3xl font-black">{String(Math.max(0, values[label] || 0)).padStart(2, '0')}</div>
                      <div className="text-[10px] font-bold uppercase text-gray-500">{label}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00A676] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading Seekon Apparel...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Mode Banner */}
      {isAdminView && (
        <div className="bg-gradient-to-r from-[#00A676] to-[#008A5E] text-white p-3 flex items-center justify-between shadow-lg sticky top-0 z-50">
          <div className="flex items-center space-x-3">
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Admin Shop View Mode</span>
          </div>
          <Link to="/admin/dashboard" className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors font-medium">
            Back to Dashboard
          </Link>
        </div>
      )}

      {/* Promotional Banner */}
      <PromotionalBanner 
        message="Seekon Apparel — Live bold. Dress sharper. Walk your story. • NEW ARRIVALS: LIMITED TIME OFFER - UPTO 30% OFF ON SELECTED ITEMS!"
        backgroundColor="bg-gradient-to-r from-red-600 to-orange-500"
        textColor="text-white"
        showIcons={true}
        animated={true}
        scrollSpeed="slow"
      />
      
      {/* Custom Hero Section with dynamic settings */}
      <CustomHeroSection />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-8">
        {/* Flash Sale Section - Only when active */}
        {isFlashSaleActive && flashSaleProducts.length > 0 && (
          <motion.section
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="mb-16"
          >
            {/* Flash Sale Banner */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-orange-500 rounded-2xl p-6 mb-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full animate-pulse">
                  <FiZap size={32} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold">Flash Sale</h2>
                  <p className="text-white/80">Limited time offers - up to 70% OFF!</p>
                </div>
              </div>
              {endTime && (
                <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-lg">
                  <FiClock size={20} />
                  <span className="font-semibold">Ends in:</span>
                  <div className="flex gap-2">
                    {['Days', 'Hours', 'Mins', 'Secs'].map((label) => {
                      const values = { 
                        Days: Math.floor((endTime - new Date().getTime()) / (1000 * 60 * 60 * 24)), 
                        Hours: Math.floor(((endTime - new Date().getTime()) % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)), 
                        Mins: Math.floor(((endTime - new Date().getTime()) % (1000 * 60 * 60)) / (1000 * 60)), 
                        Secs: Math.floor(((endTime - new Date().getTime()) % (1000 * 60)) / 1000) 
                      };
                      return (
                        <div key={label} className="bg-white text-red-600 rounded px-2 py-1 text-center min-w-[50px]">
                          <div className="text-xl font-black">{String(Math.max(0, values[label] || 0)).padStart(2, '0')}</div>
                          <div className="text-[10px] font-bold uppercase">{label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* Flash Sale Products */}
            <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {flashSaleProducts.map((product) => (
                <motion.div key={product._id || product.id} variants={itemVariants}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </motion.div>
            <div className="text-center mt-6">
              <Link to="/flash-sale" className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg">
                See All Flash Sale Items →
              </Link>
            </div>
          </motion.section>
        )}

        {/* Trending Now Section */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="text-center flex-1">
              <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Trending Now
              </motion.h2>
              <motion.p variants={itemVariants} className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover the most popular sneakers and apparel
              </motion.p>
            </div>
            <Link to="/collection?filter=featured" className="text-[#00A676] hover:text-[#008A5E] font-medium ml-4">
              See All →
            </Link>
          </div>
          <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {trendingProducts.map((product) => (
              <motion.div key={product._id || product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Shop by Category */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <div className="text-center mb-8">
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Shop by Category
            </motion.h2>
            <motion.p variants={itemVariants} className="text-lg text-gray-600">
              Find exactly what you're looking for
            </motion.p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Sneakers</h3>
                <Link to="/collection/sneakers" className="text-[#00A676] hover:text-[#008A5E] text-sm font-medium">
                  See All →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {sneakers.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            </motion.div>
            <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Apparel</h3>
                <Link to="/collection/apparel" className="text-[#00A676] hover:text-[#008A5E] text-sm font-medium">
                  See All →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {apparel.map((product) => (
                  <ProductCard key={product._id || product.id} product={product} />
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* New Arrivals */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">New Arrivals</h2>
            <Link to="/collection?filter=new" className="text-[#00A676] hover:text-[#008A5E] font-medium">
              See All →
            </Link>
          </div>
          <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {newProducts.map((product) => (
              <motion.div key={product._id || product.id} variants={itemVariants}>
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Limited Time Offers</h2>
            <Link to="/collection?filter=sale" className="text-[#00A676] hover:text-[#008A5E] font-medium">
              See All →
            </Link>
          </div>
          <motion.div variants={containerVariants} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {saleProducts.map((product) => (
              <motion.div key={product._id || product.id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        </motion.section>

        {/* Newsletter */}
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="rounded-2xl p-6 md:p-12 text-center bg-gradient-to-r from-gray-900 to-gray-800 text-white"
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Stay in the Loop</h2>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Get exclusive access to new drops, special offers, and style tips.
            </p>
            <div className="max-w-md mx-auto flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 bg-white border-2 border-[#00A676] focus:outline-none"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewsletterSubscribe}
                className="px-6 py-3 bg-[#00A676] text-white font-semibold rounded-lg hover:bg-[#008A5E] transition-colors"
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

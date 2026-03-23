import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye, FiZap, FiCheckCircle } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
// 👇 NEW: Import the API-ready action
import { addToCartAPI } from '../store/slices/cartSlice';
import { addToWishlistLocal, removeFromWishlistLocal } from '../store/slices/wishlistSlice';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import FlashSaleCountdown from './FlashSaleCountdown';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  
  // Selectors
  const wishlist = useSelector(state => state.wishlist.items) || [];
  const cart = useSelector(state => state.cart.items) || [];
  
  // 👇 SAFETY CHECK: Prevent crashes if data is missing
  const safeColors = product?.colors || []; 
  const safeImage = product?.image || '/images/sample.jpg'; // Fallback image
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState(safeColors[0] || 'black');

  // Update selectedColor when product colors change
  useEffect(() => {
    if (safeColors.length > 0 && !safeColors.includes(selectedColor)) {
      setSelectedColor(safeColors[0]);
    }
  }, [safeColors, selectedColor]);

  // Check if product is on flash sale (handle both property naming conventions)
  const isOnFlashSale = product?.isOnFlashSale || product?.onFlashSale || 
    (product?.flashSalePrice && product.flashSalePrice > 0 && product.flashSalePrice < product.price) || false;
  const activePrice = product?.flashSalePrice || product?.activePrice || product?.price || 0;
  const flashSaleEndTime = product?.saleEndTime || product?.flashSaleEndTime || null;

  // Strict check: Is it actually on sale?
  const hasDiscount = product.discount > 0 || (product.originalPrice && product.originalPrice > product.price);
  
  // Calculate correct old price without decimals
  const originalPriceToDisplay = product.originalPrice 
    ? product.originalPrice 
    : (hasDiscount ? Math.round(product.price / (1 - (product.discount / 100))) : null);

  // Check wishlist status
  useEffect(() => {
    const productId = product?._id || product?.id;
    if (productId) {
      const inWishlist = wishlist.some(item => item.id === productId);
      setIsWishlisted(inWishlist);
    }
  }, [wishlist, product]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check authentication first
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      toast('Please login to add items to your cart', { icon: '🔐' });
      navigate(`/login?redirect=${window.location.pathname}`);
      return;
    }
    
    /**
     * SECURITY FIX: Updated to match new secure API structure
     * The backend now only needs productId - it fetches all other data
     * (name, price, image, brand) from the database to prevent tampering
     */
    const cartItem = {
      product: {
        id: productId,
        _id: productId, // Support both id formats
        name: product.name,
        price: activePrice, // Use the already calculated activePrice (handles flash sale)
        image: safeImage,
        brand: product.brand,
        isOnFlashSale,
        flashSalePrice: isOnFlashSale ? product.flashSalePrice : null,
        originalPrice: originalPrice
      },
      color: selectedColor,
      size: null, 
      quantity: 1
    };

    try {
      console.log('🛒 ADD_TO_CART: Dispatching with item:', cartItem);
      // 👇 DISPATCH TO API (Cloud Sync)
      await dispatch(addToCartAPI(cartItem)).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error('🛒 ADD_TO_CART: Failed', err);
      toast.error(err.message || 'Could not add item to cart');
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${productId}`);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check authentication first
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      toast('Please login to add items to your wishlist', { icon: '🔐' });
      navigate(`/login?redirect=${window.location.pathname}`);
      return;
    }
    
    if (isWishlisted) {
      dispatch(removeFromWishlistLocal({ productId }));
      toast.success('Removed from wishlist');
    } else {
      dispatch(addToWishlistLocal(product));
      toast.success('Added to wishlist');
    }
  };

  const handleColorSelect = (e, color) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedColor(color);
  };

  // Helper for color dots with Tailwind-matched hex codes
  const getColorValue = (colorName) => {
    const colors = {
      black: '#000000',
      white: '#ffffff',
      red: '#ef4444',
      blue: '#3b82f6',
      green: '#22c55e',
      yellow: '#eab308',
      orange: '#f97316',
      purple: '#a855f7',
      pink: '#ec4899',
      brown: '#78350f',
      gray: '#6b7280',
      grey: '#6b7280',
      navy: '#1e3a8a',
      beige: '#f5f5dc',
      cream: '#fffdd0',
      tan: '#d2b48c',
      maroon: '#800000',
      burgundy: '#800020',
      turquoise: '#40e0d0',
      teal: '#008080',
      coral: '#ff7f50',
      salmon: '#fa8072',
      olive: '#808000',
      lime: '#84cc16',
      mint: '#98fb98',
      lavender: '#e6e6fa',
      indigo: '#4b0082',
      gold: '#ffd700',
      silver: '#c0c0c0',
      charcoal: '#36454f',
    };
    
    if (!colorName) return '#cccccc'; // Fallback for undefined
    const normalizedColor = colorName.toLowerCase().trim();
    return colors[normalizedColor] || colorName; // Fallback to raw string if custom hex is provided
  };

  // If product is empty/loading, return nothing (or skeleton if you prefer)
  if (!product) return null;

  // SAFETY CHECK: Get the ID, trying multiple common formats
  const productId = product._id || product.id || product.productId;

  // If no ID exists, don't render a broken link
  if (!productId) return null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <Link to={`/product/${productId}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={getOptimizedImageUrl(safeImage, { width: 400, height: 400, quality: 'auto' })}
            alt={product.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {isOnFlashSale && (
              <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                <FiZap className="w-3 h-3" />
                FLASH SALE
              </span>
            )}
            {product.discount > 0 && !isOnFlashSale && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                -{product.discount}%
              </span>
            )}
            {product.newProduct && !isOnFlashSale && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                NEW
              </span>
            )}
          </div>

          {/* Flash Sale Countdown */}
          {isOnFlashSale && flashSaleEndTime && (
            <div className="absolute top-2 right-2">
              <FlashSaleCountdown endTime={flashSaleEndTime} />
            </div>
          )}

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-3">
              <button
                onClick={handleQuickView}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-black shadow-lg"
              >
                <FiEye className="w-5 h-5" />
              </button>
              <button
                onClick={handleAddToWishlist}
                className={`w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg ${
                  isWishlisted ? 'text-red-500' : 'text-gray-700 hover:text-red-500'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <p className="text-xs text-black font-semibold uppercase tracking-wide mb-1">
            {product.brand}
          </p>
          
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 line-clamp-1">
            {product.name}
          </h3>
          
          {/* Verified Reviews Badge */}
          {product.reviews && product.reviews > 0 && (
            <div className="flex items-center space-x-1 mb-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3 h-3 ${i < Math.round(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({product.reviews})
              </span>
              {product.verifiedReviews && product.verifiedReviews > 0 && (
                <span className="flex items-center text-xs text-black dark:text-gray-300">
                  <FiCheckCircle className="w-3 h-3 mr-0.5" />
                  Verified
                </span>
              )}
            </div>
          )}
          
          {/* Price */}
          <div className="flex items-center space-x-2 mt-1">
            {/* Current / Sale Price (Always show) */}
            <span className="font-bold text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            
            {/* Crossed-out Original Price (ONLY show if it's a valid sale) */}
            {hasDiscount && originalPriceToDisplay && (
              <span className="text-sm text-gray-400 dark:text-gray-500 line-through font-medium">
                {formatPrice(originalPriceToDisplay)}
              </span>
            )}
          </div>

          {/* Colors & Button Row */}
          <div className="flex items-center justify-between">
            {/* Colors */}
            <div className="flex space-x-1">
              {safeColors.slice(0, 3).map((color, idx) => (
                <button
                  key={`${productId}-${color}-${idx}`}
                  onClick={(e) => handleColorSelect(e, color)}
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                    selectedColor === color 
                      ? 'border-black ring-2 ring-gray-500 ring-offset-2 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: getColorValue(color) }}
                  title={color}
                />
              ))}
            </div>

            {/* Add to Cart (Small) */}
            <button
              onClick={handleAddToCart}
              className="bg-black hover:bg-gray-800 text-white p-2 rounded-lg shadow-md transition-colors"
            >
              <FiShoppingCart className="w-5 h-5" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiStar, FiHeart, FiShare2, FiMinus, FiPlus, FiShoppingCart, FiArrowLeft, FiX, FiCheckCircle } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, addToCartAPI } from '../store/slices/cartSlice';
import { fetchProducts } from '../store/slices/productSlice';
import { addToWishlistLocal, removeFromWishlistLocal } from '../store/slices/wishlistSlice';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import ProductCard from '../components/ProductCard';
import { formatPrice, calculateDiscount, getRatingStars } from '../utils/formatPrice';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import FlashSaleCountdown from '../components/FlashSaleCountdown';
import { getOptimizedImageUrl } from '../utils/cloudinary';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isFromFlashSale = searchParams.get('from') === 'flashsale';
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();
  
  // Snap to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);
  
  const { products, isLoading: isProductsLoading } = useSelector(state => state.products);
  const wishlist = useSelector(state => state.wishlist.items);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [apiProduct, setApiProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch product directly from API for robust handling
  useEffect(() => {
    const fetchProductFromApi = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(false);
      
      try {
        const response = await api.getProduct(id);
        // ROBUST DATA HANDLING: Check both response.data.product and response.data
        const fetchedProduct = response.product || response;
        
        if (fetchedProduct) {
          setApiProduct(fetchedProduct);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductFromApi();
  }, [id]);

  // Use API fetched product, fallback to Redux product
  const product = apiProduct || products.find(p => p.id === id);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.colors[0] || '');
      
      // Track recently viewed products
      try {
        const stored = localStorage.getItem('recentlyViewed');
        let viewed = stored ? JSON.parse(stored) : [];
        
        // Remove current product if already in list (to avoid duplicates)
        viewed = viewed.filter(p => p._id !== product._id && p.id !== product.id);
        
        // Add current product to the front
        viewed.unshift({
          _id: product._id,
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || product.image,
          brand: product.brand,
          category: product.category
        });
        
        // Keep only top 10 items
        viewed = viewed.slice(0, 10);
        
        localStorage.setItem('recentlyViewed', JSON.stringify(viewed));
      } catch (e) {
        console.error('Error tracking recently viewed:', e);
      }
    }
  }, [product]);

  // Check if product is in wishlist
  useEffect(() => {
    if (product) {
      const inWishlist = wishlist.some(item => item.id === product.id);
      setIsWishlisted(inWishlist);
    }
  }, [product, wishlist]);

  // Check if product is in flash sale (use regular function, not useMemo - hooks can't be after early returns)
  // Check for isFlashSale (from admin), onFlashSale, isOnFlashSale, and flashSalePrice
  // Also check if user came from flash sale page (via ?from=flashsale)
  const isFlashSaleProduct = product ? (
    product.isFlashSale === true ||
    product.onFlashSale === true ||
    product.isOnFlashSale === true ||
    isFromFlashSale ||
    (product.flashSalePrice && 
     product.flashSalePrice > 0 && 
     product.flashSalePrice < product.price)
  ) : false;

  // Calculate flash sale price and discount
  const flashSalePrice = isFlashSaleProduct ? (product.flashSalePrice || product.price) : null;
  const originalPrice = product?.price || 0;
  const flashSaleDiscount = flashSalePrice ? Math.round((1 - flashSalePrice / originalPrice) * 100) : 0;
  
  // Effective price to use (flash sale price if available)
  const effectivePrice = isFlashSaleProduct ? flashSalePrice : product?.price;

  if (isLoading || isProductsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || (!product && products.length > 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Product not found
          </h2>
          <button
            onClick={() => navigate('/collection')}
            className="btn-primary"
          >
            Back to Collection
          </button>
        </div>
      </div>
    );
  }

  // Handle Add to Cart - use flash sale price if applicable
  const handleAddToCart = async () => {
    // Check authentication FIRST - redirect to login if not authenticated
    if (!isAuthenticated) {
      // Store redirect path for after login
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      // Store product in sessionStorage for pending action
      const pendingItem = {
        product: { ...product, price: effectivePrice }, // Use flash sale price!
        size: selectedSize,
        color: selectedColor,
        quantity
      };
      sessionStorage.setItem('pendingCartItem', JSON.stringify(pendingItem));
      
      toast.info('Please login to add items to your cart', {
        icon: '🔐',
        duration: 2500,
      });
      
      // Navigate to login immediately with redirect
      navigate(`/login?redirect=${window.location.pathname}`);
      return;
    }
    
    try {
      // Only validate size if the product actually has sizes configured
      if (product.sizes && product.sizes.length > 0 && !selectedSize) {
        toast.error('Please select a size');
        return;
      }
      
      // Only validate color if the product actually has colors configured
      if (product.colors && product.colors.length > 0 && !selectedColor) {
        toast.error('Please select a color');
        return;
      }

      // Get the product ID (support both _id and id formats)
      const productId = product._id || product.id;

      // Use addToCartAPI to sync with database (same as ProductCard.jsx)
      await dispatch(addToCartAPI({
        product: {
          id: productId,
          _id: productId,
          name: product.name,
          price: effectivePrice,
          image: product.images?.[0] || product.image,
          brand: product.brand
        },
        size: selectedSize,
        color: selectedColor,
        quantity
      })).unwrap();

      toast.success(`${product.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart. Please try again.');
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleWishlist = () => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      // Store redirect path for after login
      const currentPath = window.location.pathname;
      localStorage.setItem('redirectAfterLogin', currentPath);
      
      // Store product to add to wishlist after login
      sessionStorage.setItem('pendingWishlistItem', JSON.stringify(product));
      toast.info('Please login to add items to your wishlist', {
        icon: '🔐',
        duration: 2500,
      });
      navigate(`/login?redirect=${window.location.pathname}`);
      return;
    }
    
    if (isWishlisted) {
      // Remove from wishlist
      dispatch(removeFromWishlistLocal({ productId: product.id }));
      setIsWishlisted(false);
      toast.success(`${product.name} removed from wishlist!`, {
        icon: '💔',
      });
    } else {
      // Add to wishlist
      dispatch(addToWishlistLocal({ product }));
      setIsWishlisted(true);
      toast.success(`${product.name} added to wishlist!`, {
        icon: '❤️',
      });
    }
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
    
    if (!colorName) return '#cccccc';
    const normalizedColor = colorName.toLowerCase().trim();
    return colors[normalizedColor] || colorName;
  };

  // WhatsApp Inquiry Button Handler
  const handleWhatsAppClick = (e) => {
    e.preventDefault();
    const phoneNumber = "254727672772";
    const currentUrl = window.location.href;
    const message = `Hi Seekon, I am interested in this product: ${currentUrl}`;
    
    // Encode the message to ensure URLs and spaces format correctly in WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Open in a new tab
    window.open(whatsappUrl, '_blank');
  };

  const discountPercentage = calculateDiscount(product.originalPrice, product.price);
  const stars = getRatingStars(product.rating);
  // Filter related products - exclude flash sale products and current product
  const checkIsFlashSale = (p) => 
    p.isFlashSale || p.onFlashSale || p.isOnFlashSale || 
    (p.flashSalePrice && p.flashSalePrice > 0 && p.flashSalePrice < p.price);
  
  // Get the current product's ID (check both _id and id for API vs Redux products)
  const currentProductId = product._id || product.id;
  
  const relatedProducts = products.filter(p =>
    p.category === product.category && 
    (p._id !== currentProductId && p.id !== currentProductId) && 
    !checkIsFlashSale(p)
  ).slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200 mb-4 sm:mb-6 md:mb-8"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg">
              <img
                src={getOptimizedImageUrl(product.images?.[selectedImage] || product.image, { width: 800, height: 800, quality: 'auto' })}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(product.images || [product.image]).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors duration-200 ${
                    selectedImage === index
                      ? 'border-primary-600'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <img
                    src={getOptimizedImageUrl(image, { width: 200, height: 200, quality: 'auto' })}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Brand & Name */}
            <div>
              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium mb-1 sm:mb-2">
                {product.brand}
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-4">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-3 sm:mb-4">
                <div className="flex items-center">
                  {stars.map((star, index) => (
                    <FiStar
                      key={index}
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${
                        star === 'full' 
                          ? 'text-yellow-400 fill-current' 
                          : star === 'half'
                          ? 'text-yellow-400 fill-current opacity-50'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  ({product.reviews} reviews)
                </span>
                {product.verifiedReviews && product.verifiedReviews > 0 && (
                  <span className="flex items-center text-xs sm:text-sm text-green-600 dark:text-green-400 ml-2">
                    <FiCheckCircle className="w-3 h-3 mr-1" />
                    {product.verifiedReviews} Verified
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Flash Sale Price Display */}
              {isFlashSaleProduct ? (
                <>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                    <span className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">
                      {formatPrice(flashSalePrice)}
                    </span>
                    <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </span>
                    <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs sm:text-sm font-medium animate-pulse">
                      🔥 Save {flashSaleDiscount}%
                    </span>
                  </div>
                  {/* Flash Sale Countdown Timer */}
                  {product.saleEndTime && (
                    <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 mt-2">
                      <span className="text-sm text-red-600 dark:text-red-400 font-medium">🔥 Flash Sale ends:</span>
                      <FlashSaleCountdown endTime={product.saleEndTime} />
                    </div>
                  )}
                </>
              ) : (
                /* Regular Price Display */
                <>
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                      <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs sm:text-sm font-medium">
                        Save {discountPercentage}%
                      </span>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Description
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <div className="flex justify-between items-center mb-2 sm:mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Size
                </h3>
                <button 
                  onClick={() => setShowSizeGuide(true)} 
                  className="text-sm text-gray-500 underline hover:text-black flex items-center gap-1"
                >
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg border text-sm transition-colors duration-200 ${
                      selectedSize === size
                        ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                Color: <span className="font-normal">{selectedColor}</span>
              </h3>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-full border-2 transition-all duration-200 ${
                      selectedColor === color
                        ? 'w-14 h-14 sm:w-16 sm:h-16 border-gray-900 dark:border-white shadow-lg scale-110 ring-2 ring-offset-2 ring-gray-900 dark:ring-white'
                        : 'w-10 h-10 sm:w-12 sm:h-12 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105'
                    }`}
                    style={{
                      backgroundColor: getColorValue(color)
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">
                Quantity
              </h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#00A676] bg-[#FAFAFA] text-[#1F1F1F] flex items-center justify-center hover:bg-[#00A676] hover:text-[#FAFAFA] transition-all duration-200"
                >
                  <FiMinus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className="w-12 sm:w-16 text-center font-medium text-[#1F1F1F] text-lg sm:text-xl">
                  {quantity}
                </span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#00A676] bg-[#FAFAFA] text-[#1F1F1F] flex items-center justify-center hover:bg-[#00A676] hover:text-[#FAFAFA] transition-all duration-200"
                >
                  <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="flex-1 bg-black text-white hover:bg-gray-800 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base shadow-lg"
                >
                  <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlist}
                  className={`p-2.5 sm:p-3 rounded-lg border transition-colors duration-200 ${
                    isWishlisted
                      ? 'border-[#00A676] bg-[#00A676]/10 text-[#00A676]'
                      : 'border-[#00A676]/30 hover:border-[#00A676] text-[#1F1F1F] hover:bg-[#00A676]/5'
                  }`}
                >
                  <FiHeart className={`w-4 h-4 sm:w-5 sm:h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    const productLink = window.location.href;
                    try {
                      // Try native share first (mobile)
                      if (navigator.share) {
                        await navigator.share({
                          title: product.name,
                          text: product.description,
                          url: productLink,
                        });
                        toast.success('Product shared successfully!', { icon: '📤', duration: 2000 });
                      }
                    } catch (error) {
                      // User cancelled share, fall through to copy
                    }
                    
                    // Always copy to clipboard as fallback
                    try {
                      await navigator.clipboard.writeText(productLink);
                      toast.success('Product link copied to clipboard!', { 
                        icon: '📋',
                        duration: 3000,
                      });
                    } catch (err) {
                      toast.error('Failed to copy link. Please try again.', { duration: 2000 });
                    }
                  }}
                  className="p-2.5 sm:p-3 rounded-lg border border-[#00A676]/30 text-[#1F1F1F] hover:border-[#00A676] hover:bg-[#00A676]/5 transition-colors duration-200"
                  title="Share or copy product link"
                >
                  <FiShare2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </div>

              {/* Stock Status */}
              <div className="text-sm">
                {product.inStock ? (
                  <span className="text-green-600 dark:text-green-400">
                    ✓ In stock and ready to ship
                  </span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">
                    ✗ Currently out of stock
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* Customer Reviews Section */}
          {(product.reviewDetails?.length > 0 || product.reviews > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                <FiStar className="w-5 h-5 text-yellow-400" />
                Customer Reviews
              </h3>

              {/* Overall Rating */}
              <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {product.rating?.toFixed(1) || '0.0'}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FiStar
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(product.rating || 0)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Based on {product.reviews || product.reviewDetails?.length || 0} reviews
                  </p>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {product.reviewDetails?.slice().reverse().map((review, index) => {
                  // Compute display name: userName (from backend) -> user.name -> firstName -> email prefix -> Anonymous
                  const displayName = review.userName || review.user?.name || review.user?.firstName || (review.user?.email ? review.user.email.split('@')[0] : "Anonymous");
                  return (
                    <div
                      key={index}
                      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#00A676] rounded-full flex items-center justify-center text-white font-medium text-sm">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                              {displayName}
                            </p>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.isVerifiedPurchase && (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <FiCheckCircle className="w-3 h-3" />
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">
                      {review.comment}
                    </p>
                    {review.createdAt && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    )}
                  </div>
                )}
              )}
              </div>

              {(!product.reviewDetails || product.reviewDetails.length === 0) && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No reviews yet. Be the first to review this product!
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Size Guide Modal */}
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowSizeGuide(false)}>
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
                <h3 className="text-xl font-bold">Sizing Chart</h3>
                <button onClick={() => setShowSizeGuide(false)} className="p-2 hover:bg-gray-100 rounded-full"><FiX size={20} /></button>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600 mb-6">Use the chart below to determine your size. If you are between sizes, we recommend sizing up.</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-700 uppercase tracking-wider">
                        <th className="p-3 border">US</th>
                        <th className="p-3 border">UK</th>
                        <th className="p-3 border">EU</th>
                        <th className="p-3 border">CM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { us: '5.5', uk: '3', eu: '36', cm: '22.5' },
                        { us: '6.5', uk: '4', eu: '37.5', cm: '23.5' },
                        { us: '7', uk: '4.5', eu: '38', cm: '24' },
                        { us: '8', uk: '5.5', eu: '39', cm: '25' },
                        { us: '8.5', uk: '6', eu: '40', cm: '25.5' },
                        { us: '9.5', uk: '7', eu: '41', cm: '26.5' },
                        { us: '10', uk: '7.5', eu: '42', cm: '27' },
                        { us: '11', uk: '8.5', eu: '43', cm: '28' },
                        { us: '12', uk: '9.5', eu: '44', cm: '28.5' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="p-3 border font-bold">{row.us}</td>
                          <td className="p-3 border">{row.uk}</td>
                          <td className="p-3 border">{row.eu}</td>
                          <td className="p-3 border">{row.cm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
              You might also like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* FLOATING WHATSAPP BUTTON */}
      <button 
        onClick={handleWhatsAppClick}
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center group"
        aria-label="Contact us on WhatsApp"
      >
        {/* Standard WhatsApp SVG Icon */}
        <svg 
          viewBox="0 0 24 24" 
          width="28" 
          height="28" 
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
        
        {/* Tooltip on hover */}
        <span className="absolute right-16 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Chat with us
        </span>
      </button>
    </div>
  );
};

export default ProductDetail;


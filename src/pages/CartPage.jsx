import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart, removeFromCartAPI, updateQuantityAPI, clearCartAPI } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';

// Color mapping helper
const getColorHex = (colorName) => {
  const color = colorName?.toLowerCase() || '';
  const colorMap = {
    'black': '#000000',
    'white': '#FFFFFF',
    'red': '#EF4444',
    'blue': '#3B82F6',
    'green': '#10B981',
    'gray': '#6B7280',
    'grey': '#6B7280',
    'navy': '#1E3A8A',
    'beige': '#F5F5DC',
    'brown': '#92400E',
    'orange': '#F97316',
    'yellow': '#EAB308',
    'pink': '#EC4899',
    'purple': '#A855F7',
    'silver': '#94A3B8',
    'gold': '#F59E0B',
    'tan': '#D2B48C',
    'olive': '#84CC16'
  };
  
  if (colorMap[color]) return colorMap[color];
  
  for (const [key, hex] of Object.entries(colorMap)) {
    if (color.includes(key)) return hex;
  }
  
  return '#000000';
};

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  
  // Get cart from Redux store (single source of truth)
  const { items, totalItems, totalPrice, isLoading, error } = useSelector((state) => state.cart);
  
  // Auth loading check - prevent false redirects during initial auth check
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    if (!authLoading) {
      setIsReady(true);
    }
  }, [authLoading]);
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (isReady && !isAuthenticated) {
      navigate('/login?redirect=cart');
    }
  }, [isReady, isAuthenticated, navigate]);
  
  // Snap to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);
  
  // Fetch cart from Redux on mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  
  // Use Redux totals directly
  const cart = { items, totalItems, totalPrice };
  
  // Handle quantity update with Redux Thunk
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity <= 0 || newQuantity > 99) return;
    
    // FIX: Safely extract productId - handle both populated object and string
    const productId = item.productId?._id || item.productId || item.product?._id || item._id;
    
    if (!productId || typeof productId !== 'string') {
      toast.error('Invalid product ID');
      return;
    }

    try {
      await dispatch(updateQuantityAPI({ 
        productId, 
        size: item.size, 
        color: item.color, 
        quantity: newQuantity 
      })).unwrap();
      toast.success(`Quantity updated to ${newQuantity}`);
    } catch(err) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };
  
  // Handle item removal with Redux Thunk
  const handleRemoveItem = async (item) => {
    // FIX: Safely extract productId - handle both populated object and string
    const productId = item.productId?._id || item.productId || item.product?._id || item._id;
    
    if (!productId || typeof productId !== 'string') {
      toast.error('Failed to remove item: invalid product ID');
      return;
    }

    try {
      await dispatch(removeFromCartAPI({ productId, size: item.size, color: item.color })).unwrap();
      toast.success(`${item.name || 'Item'} removed from cart`);
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
    }
  };
  
  // Handle clear cart with Redux Thunk
  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }
    
    try {
      await dispatch(clearCartAPI()).unwrap();
      toast.success('Cart cleared successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to clear cart');
    }
  };
  
  // Animation variants
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
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <FiRefreshCw className="animate-spin h-10 w-10 text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading cart...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Cart</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => dispatch(fetchCart())}
            className="inline-flex items-center px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            <FiRefreshCw className="mr-2" />
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }
  
  // Empty cart
  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag className="h-12 w-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            Continue Shopping
            <FiArrowRight className="ml-2" />
          </Link>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Shopping Cart</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              {totalItems} {totalItems === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <AnimatePresence>
                {cart.items.map((item, index) => {
                  const productId = item.productId?._id || item.productId || item._id;
                  const itemName = item.name || item.productId?.name || item.product?.name || 'Unknown Product';
                  const itemImage = item.image || item.productId?.image || item.product?.image || item.productId?.images?.[0];
                  const itemPrice = item.price || item.productId?.price || item.product?.price || 0;
                  const itemColor = item.color;
                  const itemSize = item.size;
                  const itemQuantity = item.quantity || 1;
                  
                  return (
                    <motion.div
                      key={`${productId}-${itemColor}-${itemSize}-${index}`}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 sm:p-6"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <Link to={`/product/${productId}`} className="block">
                            {itemImage ? (
                              <img
                                src={itemImage}
                                alt={itemName}
                                className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                <FiShoppingBag className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                          </Link>
                        </div>
                        
                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <Link
                                to={`/product/${productId}`}
                                className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                {itemName}
                              </Link>
                              {item.brand && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">{item.brand}</p>
                              )}
                            </div>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              {formatPrice(itemPrice * itemQuantity)}
                            </p>
                          </div>
                          
                          {/* Variants */}
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                            {itemColor && (
                              <div className="flex items-center gap-2">
                                <span>Color:</span>
                                <span
                                  className="inline-block w-4 h-4 rounded-full border border-gray-300"
                                  style={{ backgroundColor: getColorHex(itemColor) }}
                                  title={itemColor}
                                />
                                <span className="capitalize">{itemColor}</span>
                              </div>
                            )}
                            {itemSize && (
                              <div className="flex items-center gap-2">
                                <span>Size:</span>
                                <span className="font-medium uppercase">{itemSize}</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Quantity Controls & Remove */}
                          <div className="mt-4 flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                              <button
                                onClick={() => handleQuantityChange(item, itemQuantity - 1)}
                                disabled={itemQuantity <= 1}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg"
                              >
                                <FiMinus className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-2 text-gray-900 dark:text-white font-medium min-w-[3rem] text-center">
                                {itemQuantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item, itemQuantity + 1)}
                                disabled={itemQuantity >= 99}
                                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg"
                              >
                                <FiPlus className="h-4 w-4" />
                              </button>
                            </div>
                            
                            {/* Remove Button */}
                            <button
                              onClick={() => handleRemoveItem(item)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Remove item"
                            >
                              <FiTrash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              
              <div className="space-y-3 border-b border-gray-200 dark:border-gray-700 pb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal ({totalItems} items)</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Shipping</span>
                  <span className="text-green-600">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between text-lg font-semibold text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>
              
              {/* Checkout Button */}
              <Link
                to="/checkout"
                className="mt-6 w-full inline-flex items-center justify-center px-6 py-3 bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
                <FiArrowRight className="ml-2" />
              </Link>
              
              {/* Continue Shopping */}
              <Link
                to="/"
                className="mt-4 w-full inline-flex items-center justify-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Continue Shopping
              </Link>
              
              {/* Security Note */}
              <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                Secure checkout powered by SeekOn. Your payment information is encrypted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;

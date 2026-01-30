import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag, FiArrowRight, FiEdit2, FiCheck } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart, clearCart, addToCart, updateQuantityAPI, removeFromCartAPI, clearCartAPI, addToCartAPI } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import { useAuth } from '../context/AuthContext';
import ConfirmationModal from '../components/ConfirmationModal';
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
  
  // Try exact match first
  if (colorMap[color]) return colorMap[color];
  
  // Try partial match
  for (const [key, hex] of Object.entries(colorMap)) {
    if (color.includes(key)) return hex;
  }
  
  return '#000000'; // Default to black
};

const Cart = () => {
  const dispatch = useDispatch();
  const { items, totalItems, totalPrice } = useSelector(state => state.cart);
  const { products } = useSelector(state => state.products);
  const { user, isAuthenticated } = useAuth();
  
  const [showClearModal, setShowClearModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [editingColor, setEditingColor] = useState(null);

  // Get product details for color changing
  const getProductDetails = (productId) => {
    return products.find(p => p.id === productId || p._id === productId);
  };

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity <= 0) {
      setItemToDelete(item);
      return;
    }
    
    try {
      if (isAuthenticated && user?.id) {
        // SECURITY: userId removed - backend uses JWT token to identify user
        await dispatch(updateQuantityAPI({
          productId: item.id,
          size: item.size,
          color: item.color,
          quantity: newQuantity
        })).unwrap();
      } else {
    dispatch(updateQuantity({
      id: item.id,
      size: item.size,
      color: item.color,
      quantity: newQuantity
    }));
      }
      toast.success(`Quantity updated to ${newQuantity}`, { duration: 2000 });
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async () => {
    if (!itemToDelete) return;
    
    const item = itemToDelete;
    try {
      if (isAuthenticated && user?.id) {
        // SECURITY: userId removed - backend uses JWT token to identify user
        await dispatch(removeFromCartAPI({
          productId: item.id,
          size: item.size,
          color: item.color
        })).unwrap();
      } else {
    dispatch(removeFromCart({
      id: item.id,
      size: item.size,
      color: item.color
    }));
      }
      toast.success(`${item.name} removed from cart`, { icon: '🗑️', duration: 2000 });
      setItemToDelete(null);
    } catch (error) {
      toast.error('Failed to remove item');
      setItemToDelete(null);
    }
  };

  const handleClearCart = async () => {
    try {
      if (isAuthenticated && user?.id) {
        // SECURITY: userId removed - backend uses JWT token to identify user
        await dispatch(clearCartAPI()).unwrap();
      } else {
    dispatch(clearCart());
      }
      toast.success('Cart cleared successfully!', { icon: '✨', duration: 2000 });
      setShowClearModal(false);
    } catch (error) {
      toast.error('Failed to clear cart');
      setShowClearModal(false);
    }
  };

  const handleColorChange = async (item, newColor) => {
    const product = getProductDetails(item.id);
    if (!product || !product.colors?.includes(newColor)) {
      toast.error('Color not available for this product');
      return;
    }

    try {
      // Remove old item
      if (isAuthenticated && user?.id) {
        // SECURITY: userId removed from both calls - backend uses JWT token to identify user
        await dispatch(removeFromCartAPI({
          productId: item.id,
          size: item.size,
          color: item.color
        })).unwrap();
        
        // Add with new color
        await dispatch(addToCartAPI({
          product: product,
          size: item.size,
          color: newColor,
          quantity: item.quantity
        })).unwrap();
      } else {
        dispatch(removeFromCart({ id: item.id, size: item.size, color: item.color }));
        dispatch(addToCart({ product: product, size: item.size, color: newColor, quantity: item.quantity }));
      }
      
      toast.success(`Color changed to ${newColor}`, { duration: 2000 });
      setEditingColor(null);
    } catch (error) {
      toast.error('Failed to change color');
    }
  };

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

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center"
          >
            <FiShoppingBag className="w-12 h-12 text-gray-400" />
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            to="/collection"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-[#00A676] to-[#008A5E] hover:from-[#008A5E] hover:to-[#006B4D] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <span>Start Shopping</span>
            <FiArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Shopping Cart
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
                {totalItems} {totalItems === 1 ? 'item' : 'items'} • {formatPrice(totalPrice)}
              </p>
            </div>
            <button
              onClick={() => setShowClearModal(true)}
              className="px-4 py-2 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] flex items-center space-x-2"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Clear All</span>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-3 sm:space-y-4"
            >
              {items.map((item) => {
                const product = getProductDetails(item.id);
                const availableColors = product?.colors || [];
                const isEditing = editingColor === `${item.id}-${item.size}-${item.color}`;

                return (
                <motion.div
                  key={`${item.id}-${item.size}-${item.color}`}
                  variants={itemVariants}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-200"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Product Image */}
                      <div className="relative w-20 h-20 sm:w-28 sm:h-28 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-1">
                        {item.name}
                      </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                          {item.brand} • Size {item.size}
                        </p>
                        
                        {/* Color Display/Edit */}
                        <div className="mb-2">
                          {!isEditing ? (
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 shadow-sm"
                                style={{ backgroundColor: getColorHex(item.color) }}
                                title={item.color}
                              />
                              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 capitalize">
                                {item.color}
                              </span>
                              {availableColors.length > 1 && (
                                <button
                                  onClick={() => setEditingColor(`${item.id}-${item.size}-${item.color}`)}
                                  className="ml-2 text-xs text-[#00A676] hover:text-[#008A5E] font-medium flex items-center space-x-1"
                                >
                                  <FiEdit2 className="w-3 h-3" />
                                  <span>Change</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2 flex-wrap">
                              <span className="text-xs text-gray-600 dark:text-gray-400">Select color:</span>
                              {availableColors.map((color) => (
                                <button
                                  key={color}
                                  onClick={() => handleColorChange(item, color)}
                                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                                    item.color === color
                                      ? 'border-gray-900 dark:border-white shadow-lg scale-110'
                                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 hover:scale-105'
                                  }`}
                                  style={{ backgroundColor: getColorHex(color) }}
                                  title={color}
                                >
                                  {item.color === color && (
                                    <FiCheck className="w-4 h-4 text-white m-auto drop-shadow-lg" />
                                  )}
                                </button>
                              ))}
                              <button
                                onClick={() => setEditingColor(null)}
                                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>

                        <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                      {/* Quantity Controls & Actions */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3 sm:gap-4">
                        {/* Modern Quantity Selector */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuantityChange(item, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 shadow-sm"
                      >
                        <FiMinus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </motion.button>
                          <span className="w-10 text-center text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100">
                        {item.quantity}
                      </span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                            disabled={item.quantity >= 10}
                            className="w-8 h-8 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200 shadow-sm"
                      >
                        <FiPlus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </motion.button>
                        </div>

                        {/* Delete Button - Modern Style */}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setItemToDelete(item)}
                          className="p-2.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200 group"
                          title="Remove item"
                        >
                          <FiTrash2 className="w-5 h-5 text-red-500 group-hover:text-red-600" />
                        </motion.button>
                    </div>

                      {/* Item Total - Mobile */}
                      <div className="sm:hidden w-full pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Total:</span>
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                      </div>
                  </div>
                </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Order Summary - Modern Design */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 sticky top-24"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                Order Summary
              </h2>

              {/* Order Details */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'items'})</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping</span>
                  <span className="font-medium text-green-600 dark:text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax</span>
                  <span className="font-medium">{formatPrice(totalPrice * 0.08)}</span>
                </div>
                <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-gray-100">Total</span>
                    <span className="text-xl font-bold text-[#00A676]">{formatPrice(totalPrice * 1.08)}</span>
                  </div>
                </div>
              </div>

              {/* Checkout Button - Premium Design */}
              <Link
                to="/checkout"
                className="w-full inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-[#00A676] to-[#008A5E] hover:from-[#008A5E] hover:to-[#006B4D] text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98] mb-3"
              >
                <span>Proceed to Checkout</span>
                <FiArrowRight className="w-5 h-5" />
              </Link>

              {/* Continue Shopping */}
              <Link
                to="/collection"
                className="w-full text-center block px-6 py-3 border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                Continue Shopping
              </Link>

              {/* Security Notice */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs sm:text-sm text-green-800 dark:text-green-200 font-medium">
                    Secure checkout with SSL encryption
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearCart}
        title="Clear Shopping Cart?"
        message={`Are you sure you want to remove all ${items.length} item${items.length === 1 ? '' : 's'} from your cart? This action cannot be undone.`}
        confirmText="Clear Cart"
        cancelText="Keep Items"
        type="warning"
      />

      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleRemoveItem}
        title="Remove Item?"
        message={`Are you sure you want to remove "${itemToDelete?.name}" from your cart?`}
        confirmText="Remove"
        cancelText="Keep"
        type="danger"
      />
    </div>
  );
};

export default Cart;

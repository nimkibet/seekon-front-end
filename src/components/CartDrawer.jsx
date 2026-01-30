import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMinus, FiPlus, FiShoppingBag, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { closeCart, updateQuantity, removeFromCart, clearCart, updateQuantityAPI, removeFromCartAPI, clearCartAPI } from '../store/slices/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';

const CartDrawer = () => {
  const dispatch = useDispatch();
  const { items, totalItems, totalPrice, isOpen } = useSelector(state => state.cart);
  const user = useSelector(state => state.user.user);

  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item);
      return;
    }
    
    try {
      // If user is logged in, use API
      if (user && user.id) {
        // SECURITY: userId removed - backend uses JWT token to identify user
        await dispatch(updateQuantityAPI({
          productId: item.id,
          size: item.size,
          color: item.color,
          quantity: newQuantity
        })).unwrap();
      } else {
        // If user not logged in, use local Redux store
        dispatch(updateQuantity({
          id: item.id,
          size: item.size,
          color: item.color,
          quantity: newQuantity
        }));
      }
      
      if (newQuantity > item.quantity) {
        toast.success(`Increased ${item.name} quantity to ${newQuantity}`);
      } else {
        toast.success(`Decreased ${item.name} quantity to ${newQuantity}`);
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (item) => {
    try {
      // If user is logged in, use API
      if (user && user.id) {
        // SECURITY: userId removed - backend uses JWT token to identify user
        await dispatch(removeFromCartAPI({
          productId: item.id,
          size: item.size,
          color: item.color
        })).unwrap();
      } else {
        // If user not logged in, use local Redux store
        dispatch(removeFromCart({
          id: item.id,
          size: item.size,
          color: item.color
        }));
      }
      toast.success(`${item.name} removed from cart`, {
        icon: '🗑️',
      });
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleClearCart = async () => {
    if (items.length === 0) {
      toast.error('Your cart is already empty!');
      return;
    }
    
    if (!window.confirm(`Are you sure you want to clear all ${items.length} item(s) from your cart?`)) {
      return;
    }
    
    try {
      // If user is logged in, use API
      if (user && user.id) {
        // SECURITY: userId removed - backend uses JWT token to identify user
        await dispatch(clearCartAPI()).unwrap();
      } else {
        // If user not logged in, use local Redux store
        dispatch(clearCart());
      }
      toast.success('Cart cleared successfully', {
        icon: '✨',
      });
    } catch (error) {
      toast.error('Failed to clear cart');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => dispatch(closeCart())}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 md:max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-gray-100">
                Shopping Cart ({totalItems})
              </h2>
              <button
                onClick={() => dispatch(closeCart())}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              >
                <FiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
                  <FiShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4 sm:mb-6">
                    Looks like you haven't added any items to your cart yet.
                  </p>
                  <Link
                    to="/collection"
                    onClick={() => dispatch(closeCart())}
                    className="btn-primary"
                  >
                    Start Shopping
                  </Link>
                </div>
                ) : (
                <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                  {items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.size}-${item.color}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      {/* Product Image */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {item.brand} • {item.size} • {item.color}
                        </p>
                        <p className="text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Modern Quantity Controls */}
                      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                        >
                          <FiMinus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </motion.button>
                        <span className="w-8 text-center text-xs sm:text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          disabled={item.quantity >= 10}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors shadow-sm"
                        >
                          <FiPlus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </motion.button>
                      </div>

                      {/* Remove Button - Modern Style */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRemoveItem(item)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                        title="Remove item"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-6 space-y-3 sm:space-y-4">
                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Total:
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 sm:space-y-3">
                  <Link
                    to="/checkout"
                    onClick={() => dispatch(closeCart())}
                    className="w-full text-center block py-2.5 sm:py-3 text-sm sm:text-base bg-[#00A676] hover:bg-[#008A5E] text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl active:scale-[0.98]"
                  >
                    Proceed to Checkout
                  </Link>
                  
                  <button
                    onClick={handleClearCart}
                    className="w-full py-2.5 sm:py-3 text-sm sm:text-base bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] flex items-center justify-center space-x-2"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Clear Cart</span>
                  </button>
                  
                  <Link
                    to="/collection"
                    onClick={() => dispatch(closeCart())}
                    className="w-full text-center text-[#00A676] hover:text-[#008A5E] text-sm sm:text-base font-medium transition-colors duration-200"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;


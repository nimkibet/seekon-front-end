import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiX } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import { removeFromWishlistLocal } from '../store/slices/wishlistSlice';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';

const Wishlist = () => {
  const dispatch = useDispatch();
  const wishlist = useSelector(state => state.wishlist.items);
  const cart = useSelector(state => state.cart.items);

  const handleRemoveFromWishlist = (productId, productName) => {
    dispatch(removeFromWishlistLocal({ productId }));
    toast.success(`${productName} removed from wishlist!`, {
      icon: '💔',
    });
  };

  const handleAddToCartFromWishlist = (product) => {
    // Check if item already exists in cart
    const existingItem = cart.find(item => item.id === product.id);
    
    dispatch(addToCart({
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand
      },
      size: null,
      color: 'black',
      quantity: 1
    }));
    
    // Show toast
    if (existingItem) {
      toast.success(`${product.name} - quantity updated!`, {
        icon: '🛒',
      });
    } else {
      toast.success(`${product.name} added to cart!`, {
        icon: '🛒',
      });
    }
  };

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 sm:py-16"
          >
            <FiHeart className="w-16 h-16 sm:w-20 sm:h-20 mx-auto text-gray-400 mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Wishlist
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              No items in your wishlist yet.
            </p>
            <Link 
              to="/collection" 
              className="inline-block bg-[#00A676] hover:bg-[#008A5E] text-white font-semibold px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Start Shopping
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Your Wishlist
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
          </p>
        </motion.div>

        {/* Wishlist Items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden group relative"
            >
              {/* Product Image */}
              <Link to={`/product/${item.id}`}>
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex space-x-3">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleAddToCartFromWishlist(item);
                        }}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-[#00A676] transition-colors duration-200"
                      >
                        <FiShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-4">
                <Link to={`/product/${item.id}`}>
                  <p className="text-xs text-[#00A676] font-semibold uppercase tracking-wide mb-1">
                    {item.brand}
                  </p>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-2 hover:text-[#00A676] transition-colors">
                    {item.name}
                  </h3>
                </Link>
                
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#00A676] text-lg">
                    {formatPrice(item.price)}
                  </span>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.id, item.name)}
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
                    title="Remove from wishlist"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCartFromWishlist(item)}
                  className="w-full mt-3 bg-[#00A676] hover:bg-[#008A5E] text-white font-semibold py-2 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;



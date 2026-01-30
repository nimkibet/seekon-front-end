import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
// 👇 NEW: Import the API-ready action
import { addToCartAPI } from '../store/slices/cartSlice';
import { addToWishlistLocal, removeFromWishlistLocal } from '../store/slices/wishlistSlice';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/formatPrice'; // Ensure this utility exists, or use simple formatter
import toast from 'react-hot-toast';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Selectors
  const wishlist = useSelector(state => state.wishlist.items) || [];
  const cart = useSelector(state => state.cart.items) || [];
  
  // 👇 SAFETY CHECK: Prevent crashes if data is missing
  const safeColors = product?.colors || []; 
  const safeImage = product?.image || '/images/sample.jpg'; // Fallback image
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [selectedColor, setSelectedColor] = useState(safeColors[0] || 'black');

  // Check wishlist status
  useEffect(() => {
    if (product?.id) {
      const inWishlist = wishlist.some(item => item.id === product.id);
      setIsWishlisted(inWishlist);
    }
  }, [wishlist, product]);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    /**
     * SECURITY FIX: Updated to match new secure API structure
     * The backend now only needs productId - it fetches all other data
     * (name, price, image, brand) from the database to prevent tampering
     */
    const cartItem = {
      product: {
        id: product.id,
        _id: product.id, // Support both id formats
        name: product.name,
        price: product.price,
        image: safeImage,
        brand: product.brand,
      },
      color: selectedColor,
      size: null, 
      quantity: 1
    };

    try {
      // 👇 DISPATCH TO API (Cloud Sync)
      await dispatch(addToCartAPI(cartItem)).unwrap();
      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error('Add to cart failed', err);
      toast.error(err.message || 'Could not add item to cart');
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/product/${product.id}`);
  };

  const handleAddToWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      dispatch(removeFromWishlistLocal({ id: product.id })); // Use 'id' to match slice
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

  // Helper for color dots
  const getColorValue = (color) => {
    // Simple mapping or return the color name if it's a standard CSS color
    return color.toLowerCase();
  };

  // If product is empty/loading, return nothing (or skeleton if you prefer)
  if (!product) return null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={safeImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col space-y-1">
            {product.discount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                -{product.discount}%
              </span>
            )}
            {product.newProduct && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                NEW
              </span>
            )}
          </div>

          {/* Quick Actions Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-3">
              <button
                onClick={handleQuickView}
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-green-600 shadow-lg"
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
          <p className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-1">
            {product.brand}
          </p>
          
          <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 line-clamp-1">
            {product.name}
          </h3>
          
          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="font-bold text-green-600 text-lg">
              KSh {product.price?.toLocaleString()}
            </span>
          </div>

          {/* Colors & Button Row */}
          <div className="flex items-center justify-between">
            {/* Colors */}
            <div className="flex space-x-1">
              {safeColors.slice(0, 3).map((color, idx) => (
                <button
                  key={`${product.id}-${color}-${idx}`}
                  onClick={(e) => handleColorSelect(e, color)}
                  className={`w-4 h-4 rounded-full border border-gray-300 ${
                    selectedColor === color ? 'ring-2 ring-green-500 ring-offset-1' : ''
                  }`}
                  style={{ backgroundColor: getColorValue(color) }}
                />
              ))}
            </div>

            {/* Add to Cart (Small) */}
            <button
              onClick={handleAddToCart}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg shadow-md transition-colors"
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
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiShoppingCart,
  FiSearch,
  FiHome,
  FiChevronDown,
  FiLogOut,
  FiHeart,
  FiEdit3,
  FiCamera
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { openCart } from '../store/slices/cartSlice';
import SearchModal from './SearchModal';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated, logout } = useAuth();
  
  // 👇 FIX: Matches the 'cartSlice.js' variable name (totalQuantity)
  const { totalQuantity } = useSelector(state => state.cart);

  // Track scroll for glass effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCartClick = () => {
    dispatch(openCart());
  };

  const handleSearch = () => {
    setIsSearchOpen(true);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
    setIsDropdownOpen(false);
  };

  // Navigation Structure
  const navItems = [
    { 
      name: 'Footwear', 
      path: '/collection?category=sneakers',
      dropdown: [
        { name: 'All Sneakers', path: '/collection?category=sneakers' },
        { name: 'Running', path: '/collection?category=running' },
        { name: 'Jordan', path: '/collection?brand=jordan' },
        { name: 'Nike', path: '/collection?brand=nike' }
      ]
    },
    { 
      name: 'Apparel', 
      path: '/collection?category=apparel',
      dropdown: [
        { name: 'All Apparel', path: '/collection?category=apparel' },
        { name: 'Hoodies', path: '/collection?category=hoodies' },
        { name: 'T-Shirts', path: '/collection?category=tshirts' }
      ]
    },
    { name: 'Accessories', path: '/collection?category=accessories' },
  ];

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md shadow-md py-2' : 'bg-white py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-black tracking-tighter flex items-center gap-2">
              SEEKON
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.name} className="relative group">
                  <Link 
                    to={item.path}
                    className="text-sm font-medium text-gray-700 hover:text-black transition-colors flex items-center gap-1"
                  >
                    {item.name}
                    {item.dropdown && <FiChevronDown className="w-4 h-4" />}
                  </Link>

                  {/* Dropdown Menu */}
                  {item.dropdown && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 border border-gray-100 overflow-hidden">
                      {item.dropdown.map((sub, idx) => (
                        <Link
                          key={idx}
                          to={sub.path}
                          className="block px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              <button onClick={handleSearch} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FiSearch className="w-5 h-5 text-gray-700" />
              </button>

              <button onClick={handleCartClick} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FiShoppingCart className="w-5 h-5 text-gray-700" />
                {totalQuantity > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </button>

              {/* User Menu */}
              <div className="relative">
                {isAuthenticated ? (
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="p-1 rounded-full border border-gray-200 hover:border-gray-400 transition-all"
                  >
                    <img 
                      src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.name || "User")} 
                      alt="User" 
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  </button>
                ) : (
                  <Link to="/login" className="text-sm font-bold text-black hover:text-gray-600">
                    LOGIN
                  </Link>
                )}

                {/* User Dropdown */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <FiEdit3 className="w-4 h-4" /> Profile
                      </Link>
                      <Link to="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                        <FiHeart className="w-4 h-4" /> Wishlist
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                      >
                        <FiLogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* This was likely the culprit: The Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Navbar;

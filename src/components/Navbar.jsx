import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  
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

  // Close search modal when navigating to a new page
  useEffect(() => {
    setIsSearchOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Animation variants for the navbar transitions
  const navbarAnimation = {
    initial: {
      borderRadius: '0rem',
      marginTop: '0rem',
      marginBottom: '0rem',
    },
    scrolled: {
      borderRadius: '1rem',
      marginTop: '0.5rem',
      marginBottom: '0.5rem',
      transition: {
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

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
    { name: 'Home', path: '/' },
    { 
      name: 'Footwear', 
      path: '/collection?category=sneakers',
      type: 'mega',
      sections: [
        {
          type: 'link',
          label: 'SHOP ALL FOOTWEAR',
          path: '/collection?category=sneakers'
        },
        {
          type: 'column',
          title: 'BRAND',
          items: [
            { name: 'Adidas', path: '/collection?brand=adidas' },
            { name: 'Asics', path: '/collection?brand=asics' },
            { name: 'Converse', path: '/collection?brand=converse' },
            { name: 'Jordan', path: '/collection?brand=jordan' },
            { name: 'Nike', path: '/collection?brand=nike' },
            { name: 'New Balance', path: '/collection?brand=new-balance' },
            { name: 'Puma', path: '/collection?brand=puma' },
            { name: 'Vans', path: '/collection?brand=vans' }
          ]
        },
        {
          type: 'column',
          title: 'GENDER',
          items: [
            { name: 'Mens', path: '/collection?gender=men' },
            { name: 'Womens', path: '/collection?gender=women' },
            { name: 'Kids', path: '/collection?gender=kids' }
          ]
        },
        {
          type: 'column',
          title: 'CATEGORIES',
          items: [
            { name: 'Performance', path: '/collection?category=performance' },
            { name: 'Lifestyle', path: '/collection?category=lifestyle' },
            { name: 'Skateboarding', path: '/collection?category=skateboarding' }
          ]
        },
        {
          type: 'column',
          title: 'BESTSELLER',
          items: [
            { name: 'Air Force 1', path: '/collection?search=air force 1' },
            { name: 'Jordan 1 Travis', path: '/collection?search=travis' },
            { name: 'Puma CA Pro', path: '/collection?search=puma ca pro' }
          ]
        }
      ],
      image: {
        src: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1000&auto=format&fit=crop",
        alt: "New Arrivals",
        label: "ALL FOOTWEAR",
        path: '/collection?category=sneakers'
      }
    },
    { 
      name: 'Apparel', 
      path: '/collection?category=apparel',
      type: 'mega',
      sections: [
        {
          type: 'link',
          label: 'SHOP ALL APPAREL',
          path: '/collection?category=apparel'
        },
        {
          type: 'column',
          title: 'CLOTHING',
          items: [
            { name: 'Hoodies', path: '/collection?category=hoodies' },
            { name: 'T-Shirts', path: '/collection?category=tshirts' },
            { name: 'Jackets', path: '/collection?category=jackets' },
            { name: 'Pants', path: '/collection?category=pants' },
            { name: 'Shorts', path: '/collection?category=shorts' }
          ]
        },
        {
          type: 'column',
          title: 'BRAND',
          items: [
            { name: 'Nike', path: '/collection?brand=nike' },
            { name: 'Adidas', path: '/collection?brand=adidas' },
            { name: 'The North Face', path: '/collection?brand=the-north-face' },
            { name: 'Essentials', path: '/collection?brand=essentials' },
            { name: 'Puma', path: '/collection?brand=puma' },
            { name: 'Under Armour', path: '/collection?brand=under-armour' }
          ]
        },
        {
          type: 'column',
          title: 'GENDER',
          items: [
            { name: 'Mens', path: '/collection?gender=men' },
            { name: 'Womens', path: '/collection?gender=women' },
            { name: 'Kids', path: '/collection?gender=kids' }
          ]
        },
        {
          type: 'column',
          title: 'BESTSELLER',
          items: [
            { name: 'Essentials Hoodie', path: '/collection?search=essentials hoodie' },
            { name: 'Nike Tech Fleece', path: '/collection?search=tech fleece' },
            { name: 'Adidas Tracksuit', path: '/collection?search=tracksuit' }
          ]
        }
      ],
      image: {
        src: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1000&auto=format&fit=crop",
        alt: "Apparel Collection",
        label: "ALL APPAREL",
        path: '/collection?category=apparel'
      }
    },
    { 
      name: 'Accessories', 
      path: '/collection?category=accessories',
      type: 'mega',
      sections: [
        {
          type: 'link',
          label: 'SHOP ALL ACCESSORIES',
          path: '/collection?category=accessories'
        },
        {
          type: 'column',
          title: 'CATEGORIES',
          items: [
            { name: 'Bags', path: '/collection?category=accessories&type=bags' },
            { name: 'Hats', path: '/collection?category=accessories&type=hats' },
            { name: 'Socks', path: '/collection?category=accessories&type=socks' },
            { name: 'Watches', path: '/collection?category=accessories&type=watches' },
            { name: 'Wallets', path: '/collection?category=accessories&type=wallets' },
            { name: 'Sunglasses', path: '/collection?category=accessories&type=sunglasses' }
          ]
        },
        {
          type: 'column',
          title: 'BRAND',
          items: [
            { name: 'Puma', path: '/collection?brand=puma' },
            { name: 'Nike', path: '/collection?brand=nike' },
            { name: 'Restyle', path: '/collection?brand=restyle' }
          ]
        }
      ],
      image: {
        src: "https://images.unsplash.com/photo-1523293188086-b520e57197dd?q=80&w=1000&auto=format&fit=crop",
        alt: "Accessories Collection",
        label: "ALL ACCESSORIES",
        path: '/collection?category=accessories'
      }
    },
  ];

  return (
    <>
      <motion.nav
        className={`sticky top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl mx-2 my-2' 
            : 'bg-white shadow-sm rounded-none mx-0 my-0'
        }`}
        initial={{ borderRadius: '0rem', marginTop: '0rem', marginBottom: '0rem' }}
        animate={{ 
          borderRadius: isScrolled ? '1rem' : '0rem',
          marginTop: isScrolled ? '0.5rem' : '0rem',
          marginBottom: isScrolled ? '0.5rem' : '0rem',
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${isScrolled ? 'py-2 w-[60%]' : 'py-4 w-full'}`}>
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-black tracking-tighter flex items-center gap-2">
              SEEKON
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <div key={item.name} className={`group ${item.type === 'mega' ? '' : 'relative'}`}>
                  <Link 
                    to={item.path}
                    className="text-sm font-medium text-gray-700 hover:text-black transition-colors flex items-center gap-1 py-4"
                  >
                    {item.name}
                    {(item.dropdown || item.type === 'mega') && <FiChevronDown className="w-4 h-4" />}
                  </Link>

                  {/* Mega Menu */}
                  {item.type === 'mega' && (
                    <div className="absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 before:absolute before:w-full before:h-8 before:bottom-full before:left-0 before:bg-transparent">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <div className="flex justify-between">
                          {/* Left Content - Columns */}
                          <div className="flex gap-12 flex-1">
                            {item.sections.map((section, idx) => (
                              <div key={idx} className="flex flex-col space-y-4">
                                {section.type === 'link' ? (
                                  <Link to={section.path} className="font-bold text-black hover:text-gray-600 uppercase tracking-wide text-sm">
                                    {section.label}
                                  </Link>
                                ) : (
                                  <>
                                    <h3 className="font-bold text-black uppercase tracking-wide text-sm">{section.title}</h3>
                                    <ul className="space-y-2">
                                      {section.items.map((subItem, subIdx) => (
                                        <li key={subIdx}>
                                          <Link to={subItem.path} className="text-gray-500 hover:text-black text-sm transition-colors">
                                            {subItem.name}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Right Content - Image */}
                          {item.image && (
                            <div className="w-1/3 pl-8">
                              <Link to={item.image.path} className="block relative group/image overflow-hidden rounded-lg">
                                <img 
                                  src={item.image.src} 
                                  alt={item.image.alt}
                                  className="w-full h-64 object-cover transform group-hover/image:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute bottom-4 left-4 bg-white px-4 py-2 text-sm font-bold text-black uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
                                  {item.image.label}
                                </div>
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dropdown Menu (Legacy) */}
                  {item.dropdown && !item.type && (
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
              <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Home">
                <FiHome className="w-5 h-5 text-gray-700" />
              </Link>
              
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
      </motion.nav>

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
};

export default Navbar;

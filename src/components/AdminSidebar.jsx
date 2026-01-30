import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiLayout,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiFileText,
  FiBox,
  FiTrendingUp,
  FiShoppingCart,
  FiHome,
  FiEye,
  FiMenu,
  FiX,
  FiUser
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Get current user from localStorage or Redux store
  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      const adminUserStr = localStorage.getItem('adminUser');
      
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {
          setCurrentUser(null);
        }
      } else if (adminUserStr) {
        try {
          setCurrentUser(JSON.parse(adminUserStr));
        } catch (e) {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    
    checkUser();
    // Listen for storage changes
    window.addEventListener('storage', checkUser);
    return () => window.removeEventListener('storage', checkUser);
  }, []);

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: FiLayout },
    { path: '/admin/shop', label: 'Shop View', icon: FiEye, external: true },
    { path: '/admin/products', label: 'Products', icon: FiPackage },
    { path: '/admin/inventory', label: 'Inventory', icon: FiBox },
    { path: '/admin/carts', label: 'Carts', icon: FiShoppingCart },
    { path: '/admin/orders', label: 'Orders', icon: FiShoppingBag },
    { path: '/admin/users', label: 'Users', icon: FiUsers },
    { path: '/admin/transactions', label: 'Transactions', icon: FiDollarSign },
    { path: '/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
    { path: '/admin/reports', label: 'Reports', icon: FiFileText },
    { path: '/admin/settings', label: 'Settings', icon: FiSettings }
  ];

  const handleLogout = () => {
    // Preserve userAvatar before clearing
    const userAvatar = localStorage.getItem('userAvatar');
    
    // Clear all authentication data
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore userAvatar for next login
    if (userAvatar) {
      localStorage.setItem('userAvatar', userAvatar);
    }
    
    toast.success('Logged out successfully');
    
    // Force navigation to homepage
    window.location.href = '/';
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-800 rounded-lg text-white hover:bg-gray-700 transition-colors"
      >
        <FiMenu className="w-6 h-6" />
      </button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-white/10 flex flex-col z-40">
      {/* Logo Header */}
      <div className="flex items-center p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00A676] to-[#008A5E] flex items-center justify-center">
            <FiTrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Seekon</h1>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            if (item.external) {
              return (
                <li key={item.path}>
                  <button
                    onClick={() => navigate('/?admin=true')}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-white/10 hover:text-white w-full text-left"
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                </li>
              );
            }
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-[#00A676] text-white shadow-lg shadow-[#00A676]/50'
                      : 'text-gray-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="p-4 border-t border-white/10">
        <Link to="/profile" className="flex items-center space-x-3 mb-3 hover:bg-white/5 rounded-lg p-2 transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A676] to-[#008A5E] flex items-center justify-center overflow-hidden">
            {currentUser?.avatar || currentUser?.profilePhoto ? (
              <img
                src={currentUser.avatar || currentUser.profilePhoto}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <FiUser className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {currentUser?.name || currentUser?.username || 'No user'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {currentUser?.email || 'Not logged in'}
            </p>
          </div>
        </Link>
        
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-all duration-200"
        >
          <FiLogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-r border-white/10 flex flex-col z-40 lg:hidden"
          >
            {/* Mobile Header with Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00A676] to-[#008A5E] flex items-center justify-center">
                  <FiTrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Seekon</h1>
                  <p className="text-xs text-gray-400">Admin Panel</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  if (item.external) {
                    return (
                      <li key={item.path}>
                        <button
                          onClick={() => {
                            navigate('/?admin=true');
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-white/10 hover:text-white w-full text-left"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      </li>
                    );
                  }
                  
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                          active
                            ? 'bg-[#00A676] text-white shadow-lg shadow-[#00A676]/50'
                            : 'text-gray-300 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* User Profile Section */}
            <div className="p-4 border-t border-white/10">
              <Link
                to="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 mb-3 hover:bg-white/5 rounded-lg p-2 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00A676] to-[#008A5E] flex items-center justify-center overflow-hidden">
                  {currentUser?.avatar || currentUser?.profilePhoto ? (
                    <img
                      src={currentUser.avatar || currentUser.profilePhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-5 h-5 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {currentUser?.name || currentUser?.username || 'No user'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {currentUser?.email || 'Not logged in'}
                  </p>
                </div>
              </Link>
              
              {/* Logout Button */}
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-400 transition-all duration-200"
              >
                <FiLogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default AdminSidebar;

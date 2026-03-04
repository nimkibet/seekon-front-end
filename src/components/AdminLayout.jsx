import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiSearch, FiUser, FiShoppingBag, FiUsers, FiPackage, FiAlertCircle, FiZap, FiMenu, FiX } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { adminApi } from '../utils/adminApi';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isFlashSaleActive, setIsFlashSaleActive] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch real notifications with polling every 10 seconds
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await adminApi.getNotifications();
        if (response.notifications) {
          setNotifications(response.notifications);
          setUnreadCount(response.unreadCount || 0);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await api.getFlashSaleSettings();
        setIsFlashSaleActive(settings?.isActive || false);
      } catch (error) {
        console.error('Error fetching flash sale settings:', error);
      }
    };
    fetchSettings();
  }, []);

  const markAsRead = (id, orderId) => {
    // Call API to mark as read
    adminApi.markNotificationRead(id).catch(err => console.error('Error marking notification as read:', err));
    setNotifications(prev => 
      prev.map(n => n._id === id ? { ...n, isRead: true } : n)
    );
    // Navigate to order if orderId exists
    if (orderId) {
      navigate(`/admin/orders/${orderId}`);
    }
  };

  const markAllAsRead = () => {
    adminApi.markAllNotificationsRead().catch(err => console.error('Error marking all as read:', err));
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order':
      case 'NEW_ORDER':
        return <FiShoppingBag className="w-4 h-4" />;
      case 'user': return <FiUsers className="w-4 h-4" />;
      case 'stock': return <FiAlertCircle className="w-4 h-4" />;
      case 'product': return <FiPackage className="w-4 h-4" />;
      default: return <FiBell className="w-4 h-4" />;
    }
  };

  // Hide flash sale banner in admin layout to prevent overlapping with mobile header
  // The banner is only shown in the customer-facing store layout
  const showFlashSaleBanner = false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex overflow-x-hidden" style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Flash Sale Banner - Hidden in Admin Layout */}
      {/* Note: Promotional banners belong in the store layout, not admin */}

      {/* Permanent Sidebar */}
      <AdminSidebar 
        isFlashSaleActive={isFlashSaleActive} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        {/* Top Header - Fixed Layout with Hamburger on Left, Profile/Bell on Right */}
        <header className="flex items-center justify-between w-full px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gray-800/50 backdrop-blur-xl border-b border-white/10 relative" style={{ zIndex: 100 }}>
          {/* LEFT: Hamburger + Title */}
          <div className="flex items-center gap-3">
            {/* Hamburger Menu - Only visible on mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <FiMenu className="w-6 h-6 text-white" />
            </button>
            {/* Title - Always visible */}
            <h1 className="text-lg sm:text-xl font-bold text-white">
              Seekon Admin
            </h1>
          </div>

          {/* RIGHT: Bell + Profile */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search Bar - Only visible on md+ */}
            <div className="hidden md:flex flex-1 max-w-xl mr-2 lg:mr-4">
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-8 sm:px-10 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors text-sm sm:text-base"
                />
              </div>
            </div>

            {/* Notifications - Always visible */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiBell className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    {/* Backdrop - Full Screen */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                      style={{ zIndex: 99998 }}
                      onClick={() => setShowNotifications(false)}
                    />

                    {/* Notification Panel - Full Overlay on Mobile, Corner Window on Desktop */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, type: "spring" }}
                      style={{ zIndex: 99999 }}
                      className="fixed inset-4 sm:inset-auto sm:top-20 sm:right-6 sm:w-[400px] sm:h-[600px] h-[calc(100vh-2rem)] bg-[#1f2937] rounded-2xl shadow-2xl border-2 border-white/20 flex flex-col overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-white/10">
                        <h3 className="text-lg font-bold text-white">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button
                              onClick={markAllAsRead}
                              className="text-xs text-[#00A676] hover:text-[#008A5E] transition-colors"
                            >
                              Mark all as read
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      {/* Notifications List */}
                      <div className="flex-1 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center">
                            <FiBell className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                            <p className="text-gray-400">No notifications</p>
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              onClick={() => markAsRead(notification._id, notification.orderId)}
                              className={`p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer ${
                                !notification.isRead ? 'bg-white/5' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  notification.type === 'order' || notification.type === 'NEW_ORDER' ? 'bg-blue-500/20 text-blue-400' :
                                  notification.type === 'user' ? 'bg-green-500/20 text-green-400' :
                                  notification.type === 'stock' ? 'bg-yellow-500/20 text-yellow-400' :
                                  notification.type === 'product' ? 'bg-purple-500/20 text-purple-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{new Date(notification.createdAt).toLocaleString()}</p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-[#00A676] rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Footer */}
                      <div className="p-4 border-t border-white/10">
                        <button
                          onClick={() => {
                            navigate('/admin/notifications');
                            setShowNotifications(false);
                          }}
                          className="w-full text-sm text-[#00A676] hover:text-[#008A5E] transition-colors text-center"
                        >
                          View All Notifications
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfile(!showProfile)}
                className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A676] to-[#008A5E] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {user?.avatar || localStorage.getItem('userAvatar') ? (
                    <img
                      src={user?.avatar || localStorage.getItem('userAvatar')}
                      alt={user?.name || 'Admin'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-white truncate max-w-[120px]">
                    {user?.name || user?.email?.split('@')[0] || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-400 capitalize truncate max-w-[120px]">
                    {user?.role || 'Administrator'}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <>
                    {/* Backdrop - Full Screen */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                      style={{ zIndex: 99998 }}
                      onClick={() => setShowProfile(false)}
                    />

                    {/* Profile Panel - Full Overlay on Mobile, Corner Window on Desktop */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2, type: "spring" }}
                      style={{ zIndex: 99999 }}
                      className="fixed inset-4 sm:inset-auto sm:top-20 sm:right-6 sm:w-[350px] sm:max-h-[500px] h-[calc(100vh-2rem)] sm:h-auto bg-[#1f2937] rounded-2xl shadow-2xl border-2 border-white/20 flex flex-col overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A676] to-[#008A5E] flex items-center justify-center overflow-hidden">
                            {user?.avatar || localStorage.getItem('userAvatar') ? (
                              <img
                                src={user?.avatar || localStorage.getItem('userAvatar')}
                                alt={user?.name || 'Admin'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FiUser className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                              {user?.name || user?.email?.split('@')[0] || 'Admin'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {user?.email || 'No email'}
                            </p>
                            {user?.role && (
                              <p className="text-[10px] text-[#00A676] mt-1 capitalize">
                                {user.role}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            setShowProfile(false);
                            navigate('/profile');
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => {
                            setShowProfile(false);
                            navigate('/admin/settings');
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 rounded-lg transition-colors"
                        >
                          Settings
                        </button>
                        <button 
                          onClick={() => {
                            const userAvatar = localStorage.getItem('userAvatar');
                            localStorage.clear();
                            sessionStorage.clear();
                            if (userAvatar) {
                              localStorage.setItem('userAvatar', userAvatar);
                            }
                            toast.success('Logged out successfully');
                            window.location.href = '/';
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-y-auto relative z-0"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
};

export default AdminLayout;

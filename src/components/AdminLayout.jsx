import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiBell, FiSearch, FiUser, FiShoppingBag, FiUsers, FiPackage, FiAlertCircle } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// Mock notification data
const mockNotifications = [
  { id: 1, type: 'order', message: 'New order #ORD-001 from John Doe', time: '2 min ago', icon: FiShoppingBag, read: false },
  { id: 2, type: 'user', message: 'New user registered: Jane Smith', time: '15 min ago', icon: FiUsers, read: false },
  { id: 3, type: 'stock', message: 'Low stock alert: Puma Hoodie', time: '1 hour ago', icon: FiAlertCircle, read: false },
  { id: 4, type: 'order', message: 'Payment completed: KSh 12,499', time: '2 hours ago', icon: FiShoppingBag, read: true },
  { id: 5, type: 'product', message: 'New product added: Nike Air Max', time: '3 hours ago', icon: FiPackage, read: true }
];

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success('All notifications marked as read');
  };

  const getNotificationIcon = (type) => {
    switch(type) {
      case 'order': return <FiShoppingBag className="w-4 h-4" />;
      case 'user': return <FiUsers className="w-4 h-4" />;
      case 'stock': return <FiAlertCircle className="w-4 h-4" />;
      case 'product': return <FiPackage className="w-4 h-4" />;
      default: return <FiBell className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex" style={{ position: 'relative' }}>
      {/* Permanent Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col relative" style={{ zIndex: 1 }}>
        {/* Top Header */}
        <header className="flex items-center justify-between px-2 sm:px-4 lg:px-6 py-2 sm:py-3 lg:py-4 bg-gray-800/50 backdrop-blur-xl border-b border-white/10 relative" style={{ zIndex: 100 }}>
          {/* Search Bar */}
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

          {/* Right Section */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
            {/* Notifications */}
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
                              key={notification.id}
                              onClick={() => markAsRead(notification.id)}
                              className={`p-4 border-b border-white/10 hover:bg-white/5 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-white/5' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  notification.type === 'order' ? 'bg-blue-500/20 text-blue-400' :
                                  notification.type === 'user' ? 'bg-green-500/20 text-green-400' :
                                  notification.type === 'stock' ? 'bg-yellow-500/20 text-yellow-400' :
                                  notification.type === 'product' ? 'bg-purple-500/20 text-purple-400' :
                                  'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                                </div>
                                {!notification.read && (
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
                            setShowNotifications(false);
                            navigate('/admin/orders');
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

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiBell, FiCheck, FiCheckCircle, FiShoppingBag, FiUsers, 
  FiPackage, FiAlertCircle, FiClock, FiFilter, FiTrash2 
} from 'react-icons/fi';
import { adminApi } from '../../utils/adminApi';
import toast from 'react-hot-toast';

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await adminApi.getNotifications();
      if (response.notifications) {
        setNotifications(response.notifications);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await adminApi.markNotificationRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await adminApi.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }
    
    // Navigate based on notification type
    if (notification.orderId) {
      navigate(`/admin/orders?orderId=${notification.orderId}`);
    } else if (notification.type === 'user' || notification.type === 'NEW_USER') {
      navigate('/admin/users');
    } else if (notification.type === 'product') {
      navigate('/admin/products');
    } else if (notification.type === 'stock') {
      navigate('/admin/inventory');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
      case 'NEW_ORDER':
        return <FiShoppingBag className="w-5 h-5" />;
      case 'user':
      case 'NEW_USER':
        return <FiUsers className="w-5 h-5" />;
      case 'product':
        return <FiPackage className="w-5 h-5" />;
      case 'stock':
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiBell className="w-5 h-5" />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'order':
      case 'NEW_ORDER':
        return 'bg-blue-500/20 text-blue-400';
      case 'user':
      case 'NEW_USER':
        return 'bg-green-500/20 text-green-400';
      case 'stock':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'product':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-gray-400 mt-1">
              {unreadCount > 0 
                ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
                : 'You\'re all caught up!'
              }
            </p>
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-[#00A676] hover:bg-[#008A5E] rounded-lg transition-colors text-sm font-medium"
            >
              <FiCheckCircle className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 mb-6">
          <FiFilter className="w-5 h-5 text-gray-400" />
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-[#00A676] text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'unread' 
                ? 'bg-[#00A676] text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter('read')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'read' 
                ? 'bg-[#00A676] text-white' 
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Read
          </button>
        </div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#00A676]"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl p-12 text-center">
            <FiBell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              {filter === 'unread' ? 'No unread notifications' : 
               filter === 'read' ? 'No read notifications' : 
               'No notifications yet'}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'You will see notifications about orders, users, and more here.'
                : 'Try changing the filter to see more notifications.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-gray-800/50 rounded-xl p-4 cursor-pointer transition-all hover:bg-gray-800 ${
                  !notification.isRead ? 'border-l-4 border-[#00A676]' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <p className={`text-sm ${notification.isRead ? 'text-gray-400' : 'text-white'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#00A676] rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-gray-700/50 rounded-full text-gray-400">
                        {notification.type === 'order' || notification.type === 'NEW_ORDER' ? 'Order' :
                         notification.type === 'user' || notification.type === 'NEW_USER' ? 'User' :
                         notification.type === 'stock' ? 'Stock Alert' :
                         notification.type === 'product' ? 'Product' : 'General'}
                      </span>
                      
                      {!notification.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification._id);
                          }}
                          className="text-xs text-[#00A676] hover:text-[#008A5E] flex items-center gap-1"
                        >
                          <FiCheck className="w-3 h-3" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

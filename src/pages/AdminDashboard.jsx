import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FiDollarSign, FiCheckCircle, FiXCircle, FiClock, 
  FiTrendingUp, FiLogOut, FiRefreshCw, FiArrowRight,
  FiUsers, FiShoppingBag, FiPackage, FiBox, FiTrendingDown,
  FiShoppingCart, FiActivity, FiPercent, FiEye, FiPlus,
  FiAlertCircle, FiZap
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../utils/adminApi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    today: { revenue: 0, successful: 0, failed: 0, pending: 0, orders: 0, newUsers: 0 },
    total: { revenue: 0, successful: 0, failed: 0, pending: 0, users: 0, products: 0, orders: 0 },
    weeklyRevenue: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Refresh every 60 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    if (stats.total.revenue > 0 || stats.total.users > 0) {
      setIsRefreshing(true);
    }
    try {
      const data = await adminApi.getStats();
      if (data.success) {
        setStats(data.stats || {
          today: { revenue: 0, successful: 0, failed: 0, pending: 0, orders: 0, newUsers: 0 },
          total: { revenue: 0, successful: 0, failed: 0, pending: 0, users: 0, products: 0, orders: 0 },
          weeklyRevenue: []
        });
        setRecentOrders(data.recentOrders || []);
        setTopProducts(data.topProducts || []);
        setRecentActivities(data.recentActivities || []);
      } else {
        throw new Error(data.message || 'Failed to fetch');
      }
    } catch (error) {
      console.warn('Error fetching dashboard stats:', error.message);
      if (!stats.total.revenue && !stats.total.users) {
        // Only set empty data on first load error
        setStats({
          today: { revenue: 0, successful: 0, failed: 0, pending: 0, orders: 0, newUsers: 0 },
          total: { revenue: 0, successful: 0, failed: 0, pending: 0, users: 0, products: 0, orders: 0 },
          weeklyRevenue: []
        });
        setRecentOrders([]);
        setTopProducts([]);
        setRecentActivities([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `KSh ${stats?.total?.revenue?.toLocaleString() || '0'}`,
      icon: FiDollarSign,
      color: 'from-green-500 to-emerald-600',
      trend: stats.total.revenue > 0 ? '+0%' : 'No data',
      subtitle: 'All time sales'
    },
    {
      title: 'Total Users',
      value: stats?.total?.users?.toLocaleString() || '0',
      icon: FiUsers,
      color: 'from-blue-500 to-cyan-600',
      trend: stats.total.users > 0 ? '+0%' : 'No data',
      subtitle: 'Registered users'
    },
    {
      title: 'Total Products',
      value: stats?.total?.products?.toLocaleString() || '0',
      icon: FiPackage,
      color: 'from-purple-500 to-pink-600',
      trend: stats.total.products > 0 ? '+0%' : 'No data',
      subtitle: 'Active products'
    },
    {
      title: 'Total Orders',
      value: stats?.total?.orders?.toLocaleString() || '0',
      icon: FiShoppingBag,
      color: 'from-orange-500 to-red-600',
      trend: stats.total.orders > 0 ? '+0%' : 'No data',
      subtitle: 'Completed orders'
    },
    {
      title: 'Pending Orders',
      value: stats?.today?.pending?.toLocaleString() || '0',
      icon: FiClock,
      color: 'from-yellow-500 to-orange-600',
      trend: stats.today.pending > 0 ? '+0%' : 'No data',
      subtitle: 'Awaiting processing'
    },
    {
      title: 'New Users Today',
      value: stats?.today?.newUsers?.toLocaleString() || '0',
      icon: FiActivity,
      color: 'from-indigo-500 to-purple-600',
      trend: stats.today.newUsers > 0 ? '+0%' : 'No data',
      subtitle: 'Today signups'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500/20 text-green-400';
      case 'processing': return 'bg-blue-500/20 text-blue-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="p-6">
      {/* Loading State - Non-blocking */}
      {isLoading && (
        <div className="absolute top-4 right-4 z-50">
          <div className="flex items-center space-x-2 bg-gray-800/90 backdrop-blur px-4 py-2 rounded-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#00A676]"></div>
            <span className="text-white text-sm">Loading...</span>
          </div>
        </div>
      )}
      {/* Refresh indicator */}
      {isRefreshing && !isLoading && (
        <div className="absolute top-4 right-4 z-50">
          <div className="flex items-center space-x-2 bg-gray-800/90 backdrop-blur px-4 py-2 rounded-lg">
            <FiRefreshCw className="w-4 h-4 text-[#00A676] animate-spin" />
            <span className="text-white text-sm">Updating...</span>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <div className="flex items-center gap-4">
            <p className="text-gray-400">Welcome back! Here's what's happening with your business.</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/admin/products')}
            className="px-4 py-2 bg-[#00A676] hover:bg-[#008A5E] text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <FiPlus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
          <button
            onClick={fetchStats}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <FiRefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards - 6 Cards in One Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs text-green-400 font-medium">{stat.trend}</span>
            </div>
            <h3 className="text-gray-400 text-xs font-medium mb-1">{stat.title}</h3>
            <p className="text-xl font-bold text-white truncate">{stat.value}</p>
            <p className="text-gray-500 text-[10px] mt-1">{stat.subtitle}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart - Simple version without Chart.js */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Earning Reports</h3>
              <p className="text-gray-400 text-sm">Weekly revenue trends</p>
            </div>
          </div>
          {/* Simple bar chart visualization */}
          <div className="h-80 flex items-end justify-center space-x-4 pb-8">
            {stats.weeklyRevenue.length > 0 ? (
              stats.weeklyRevenue.map((day, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-12 bg-gradient-to-t from-[#00A676] to-[#008A5E] rounded-t-lg transition-all hover:from-[#00C085] hover:to-[#00A676]"
                    style={{ height: `${Math.min((day.total / 150000) * 100, 100)}%`, minHeight: '20px' }}
                  ></div>
                  <p className="text-xs text-gray-400 mt-2">Day {index + 1}</p>
                  <p className="text-xs text-white font-medium">KSh {(day.total / 1000).toFixed(0)}K</p>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No revenue data available</div>
            )}
          </div>
          {stats.weeklyRevenue.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">KSh {(stats.weeklyRevenue.reduce((a, b) => a + b.total, 0) / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-400">Earnings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">KSh {((stats.weeklyRevenue.reduce((a, b) => a + b.total, 0) * 0.47) / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-400">Profit</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">KSh {((stats.weeklyRevenue.reduce((a, b) => a + b.total, 0) * 0.14) / 1000).toFixed(0)}K</p>
                <p className="text-xs text-gray-400">Expense</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Category & Sales Chart - Simple version */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-4">Sales by Category</h3>
            <div className="h-64 flex items-center justify-center">
              <p className="text-gray-400">No category data available</p>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="text-lg font-bold text-white mb-4">Monthly Sales</h3>
            <div className="space-y-2">
              <p className="text-gray-400 text-sm">No monthly sales data available</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Grid - Top Products, Recent Orders, Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Top Products</h3>
            <Link to="/admin/products" className="text-xs text-[#00A676] hover:text-[#008A5E]">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00A676] to-[#008A5E] rounded-lg flex items-center justify-center font-bold text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-400">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">{product.sold}</p>
                  <p className="text-xs text-gray-400">sold</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recent Orders</h3>
            <Link to="/admin/orders" className="text-xs text-[#00A676] hover:text-[#008A5E]">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A676] to-[#008A5E] flex items-center justify-center">
                      <FiShoppingBag className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{order.customer}</p>
                      <p className="text-xs text-gray-400">{order.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-white">KSh {order?.amount?.toLocaleString() || '0'}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No orders data available</p>
            )}
          </div>
        </motion.div>

        {/* Recent Activities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-bold text-white mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="text-xl">{activity.icon}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{activity.message}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No recent activities</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
      >
        <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center space-x-3 p-4 bg-gradient-to-br from-[#00A676] to-[#008A5E] hover:from-[#008A5E] hover:to-[#00A676] rounded-lg transition-all text-white"
          >
            <FiPackage className="w-5 h-5" />
            <span className="font-medium">Manage Products</span>
          </button>
          <button
            onClick={() => navigate('/admin/orders')}
            className="flex items-center space-x-3 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
          >
            <FiShoppingBag className="w-5 h-5" />
            <span className="font-medium">View Orders</span>
          </button>
          <button
            onClick={() => navigate('/admin/inventory')}
            className="flex items-center space-x-3 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
          >
            <FiBox className="w-5 h-5" />
            <span className="font-medium">Inventory</span>
          </button>
          <button
            onClick={() => navigate('/admin/analytics')}
            className="flex items-center space-x-3 p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-white"
          >
            <FiTrendingUp className="w-5 h-5" />
            <span className="font-medium">View Analytics</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;

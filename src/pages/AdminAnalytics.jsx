import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import RevenueChart from '../components/charts/RevenueChart';
import CategoryChart from '../components/charts/CategoryChart';
import SalesBarChart from '../components/charts/SalesBarChart';
import { adminApi } from '../utils/adminApi';
import toast from 'react-hot-toast';

const AdminAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch analytics data from API
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        // Fetch from the dedicated analytics endpoint
        const data = await adminApi.getAnalytics();
        console.log("Analytics Data:", data);
        if (data && data.success) {
          setAnalytics(data);
        } else {
          toast.error('Failed to load analytics data');
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Error loading analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedPeriod]);

  // Show loading state while fetching
  if (!analytics && isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Analytics & Insights</h1>
              <p className="text-gray-400">Data-driven insights for your business</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A676]"></div>
        </div>
      </div>
    );
  }

  // Get data from analytics response
  const revenueTrends = analytics?.revenueTrends || [];
  const categorySales = analytics?.categorySales || [];
  const totalRevenue = analytics?.totalRevenue || 0;
  const totalOrders = analytics?.totalOrders || 0;
  const totalUsers = analytics?.totalUsers || 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Analytics & Insights</h1>
            <p className="text-gray-400">Data-driven insights for your business</p>
          </div>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white/10 border-2 border-[#00A676] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 transition-all"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <option value="week" className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>Last Week</option>
            <option value="month" className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>Last Month</option>
            <option value="year" className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>Last Year</option>
          </select>
        </div>
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 mb-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <FiTrendingUp className="w-6 h-6 text-[#00A676]" />
          <h3 className="text-xl font-bold text-white">Revenue Trends</h3>
        </div>
        <div className="h-80">
          <RevenueChart weeklyData={revenueTrends} />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sales Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <FiDollarSign className="w-6 h-6 text-[#00A676]" />
            <h3 className="text-xl font-bold text-white">Monthly Sales</h3>
          </div>
          <div className="h-80">
            <SalesBarChart monthlyData={revenueTrends} />
          </div>
        </motion.div>

        {/* Category Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3 mb-4">
            <FiShoppingBag className="w-6 h-6 text-[#00A676]" />
            <h3 className="text-xl font-bold text-white">Sales by Category</h3>
          </div>
          <div className="h-80">
            <CategoryChart categoryData={categorySales} />
          </div>
        </motion.div>
      </div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
      >
        <div className="flex items-center space-x-3 mb-4">
          <FiUsers className="w-6 h-6 text-[#00A676]" />
          <h3 className="text-xl font-bold text-white">Performance Summary</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">KSh {totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalUsers.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalOrders.toLocaleString()}</p>
            <p className="text-sm text-gray-400">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{categorySales.length > 0 ? 'Active' : 'N/A'}</p>
            <p className="text-sm text-gray-400">Categories</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;

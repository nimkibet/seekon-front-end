import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiUsers, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import RevenueChart from '../components/charts/RevenueChart';
import CategoryChart from '../components/charts/CategoryChart';
import SalesBarChart from '../components/charts/SalesBarChart';

const FALLBACK_DATA = {
  weeklyRevenue: [
    { _id: '2025-01-20', total: 85000 },
    { _id: '2025-01-21', total: 92000 },
    { _id: '2025-01-22', total: 78000 },
    { _id: '2025-01-23', total: 105000 },
    { _id: '2025-01-24', total: 118000 },
    { _id: '2025-01-25', total: 95000 },
    { _id: '2025-01-26', total: 125000 }
  ],
  categoryData: [
    { category: 'Footwear', value: 45 },
    { category: 'Apparels', value: 30 },
    { category: 'Accessories', value: 25 }
  ],
  monthlyData: [
    { month: 'Jan', value: 2450000 },
    { month: 'Feb', value: 3120000 },
    { month: 'Mar', value: 2890000 },
    { month: 'Apr', value: 3450000 },
    { month: 'May', value: 3780000 },
    { month: 'Jun', value: 4210000 }
  ]
};

const AdminAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month');

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
          <RevenueChart weeklyData={FALLBACK_DATA.weeklyRevenue} />
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
            <SalesBarChart monthlyData={FALLBACK_DATA.monthlyData} />
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
            <CategoryChart categoryData={FALLBACK_DATA.categoryData} />
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
            <p className="text-2xl font-bold text-white">KSh 12.5M</p>
            <p className="text-sm text-gray-400">Total Revenue</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">1,247</p>
            <p className="text-sm text-gray-400">Total Users</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">949</p>
            <p className="text-sm text-gray-400">Total Orders</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">12.3%</p>
            <p className="text-sm text-gray-400">Growth Rate</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;


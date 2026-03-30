import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDownload, FiPrinter, FiUsers, FiShoppingCart, FiPackage, FiCreditCard } from 'react-icons/fi';
import { exportUsers, exportOrders, exportProducts, exportTransactions } from '../utils/csvExport';
import { generateAllReportsPDF } from '../utils/pdfExport';
import { adminApi } from '../utils/adminApi';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [activeReport, setActiveReport] = useState('products');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    users: [],
    orders: [],
    products: [],
    transactions: []
  });

  // Fetch real-time data from API
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        // Fetch all data in parallel
        const [usersRes, ordersRes, productsRes, transactionsRes] = await Promise.all([
          adminApi.getUsers({ limit: 1000 }),
          adminApi.getOrders({ limit: 1000 }),
          adminApi.getProducts({ limit: 1000 }),
          adminApi.getTransactions({ limit: 1000 })
        ]);

        setReportData({
          users: usersRes?.users || usersRes || [],
          orders: ordersRes?.orders || ordersRes || [],
          products: productsRes?.products || productsRes || [],
          transactions: transactionsRes?.transactions || transactionsRes || []
        });
      } catch (error) {
        console.error('Error fetching report data:', error);
        toast.error('Failed to load report data');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const handleExport = (type) => {
    try {
      switch(type) {
        case 'users':
          if (reportData.users.length === 0) {
            toast.error('No users data to export');
            return;
          }
          exportUsers(reportData.users);
          toast.success('Users exported successfully!');
          break;
        case 'orders':
          if (reportData.orders.length === 0) {
            toast.error('No orders data to export');
            return;
          }
          exportOrders(reportData.orders);
          toast.success('Orders exported successfully!');
          break;
        case 'products':
          if (reportData.products.length === 0) {
            toast.error('No products data to export');
            return;
          }
          exportProducts(reportData.products);
          toast.success('Products exported successfully!');
          break;
        case 'transactions':
          if (reportData.transactions.length === 0) {
            toast.error('No transactions data to export');
            return;
          }
          exportTransactions(reportData.transactions);
          toast.success('Transactions exported successfully!');
          break;
        case 'all':
          generateAllReportsPDF(reportData);
          toast.success('Full report PDF generated!');
          break;
        default:
          toast.error('Invalid export type');
      }
    } catch (error) {
      toast.error('Export failed. Please try again.');
      console.error('Export error:', error);
    }
  };

  const getReportStats = (type) => {
    const count = reportData[type]?.length || 0;
    return `${count} records`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Reports & Exports</h1>
        <p className="text-gray-400">Generate and download business reports</p>
        {loading && <p className="text-yellow-400 mt-2">Loading data...</p>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => { setActiveReport('products'); handleExport('products'); }}
          disabled={loading}
          className={`bg-white/10 backdrop-blur-xl rounded-xl p-6 border transition-all text-left group cursor-pointer ${activeReport === 'products' ? 'border-[#00A676] ring-2 ring-[#00A676]/30' : 'border-white/20 hover:border-white/40'} ${loading ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Products Report</h3>
              <p className="text-sm text-gray-400">{getReportStats('products')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#00A676]">
            <FiDownload className="w-4 h-4" />
            <span className="text-sm">Export XLSX</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => { setActiveReport('orders'); handleExport('orders'); }}
          disabled={loading}
          className={`bg-white/10 backdrop-blur-xl rounded-xl p-6 border transition-all text-left group cursor-pointer ${activeReport === 'orders' ? 'border-[#00A676] ring-2 ring-[#00A676]/30' : 'border-white/20 hover:border-white/40'} ${loading ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <FiShoppingCart className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Orders Report</h3>
              <p className="text-sm text-gray-400">{getReportStats('orders')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#00A676]">
            <FiDownload className="w-4 h-4" />
            <span className="text-sm">Export XLSX</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => { setActiveReport('users'); handleExport('users'); }}
          disabled={loading}
          className={`bg-white/10 backdrop-blur-xl rounded-xl p-6 border transition-all text-left group cursor-pointer ${activeReport === 'users' ? 'border-[#00A676] ring-2 ring-[#00A676]/30' : 'border-white/20 hover:border-white/40'} ${loading ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FiUsers className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Users Report</h3>
              <p className="text-sm text-gray-400">{getReportStats('users')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#00A676]">
            <FiDownload className="w-4 h-4" />
            <span className="text-sm">Export XLSX</span>
          </div>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => { setActiveReport('transactions'); handleExport('transactions'); }}
          disabled={loading}
          className={`bg-white/10 backdrop-blur-xl rounded-xl p-6 border transition-all text-left group cursor-pointer ${activeReport === 'transactions' ? 'border-[#00A676] ring-2 ring-[#00A676]/30' : 'border-white/20 hover:border-white/40'} ${loading ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <FiCreditCard className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Transactions Report</h3>
              <p className="text-sm text-gray-400">{getReportStats('transactions')}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#00A676]">
            <FiDownload className="w-4 h-4" />
            <span className="text-sm">Export XLSX</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => handleExport('all')}
          disabled={loading}
          className={`bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all text-left group cursor-pointer ${loading ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <FiPrinter className="w-6 h-6 text-teal-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Print Reports</h3>
              <p className="text-sm text-gray-400">Generate PDF with all reports</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#00A676]">
            <FiPrinter className="w-4 h-4" />
            <span className="text-sm">Generate PDF</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default AdminReports;

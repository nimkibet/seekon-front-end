import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDownload, FiPrinter } from 'react-icons/fi';
import { exportUsers, exportOrders, exportProducts, exportTransactions } from '../utils/csvExport';
import toast from 'react-hot-toast';

const AdminReports = () => {
  // Mock data
  const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: 'user', createdAt: '2024-01-15', status: 'active' },
    { name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: '2024-02-10', status: 'active' }
  ];

  const mockOrders = [
    { id: 'ORD-001', customer: 'John Doe', amount: 12499, status: 'completed', date: '2024-01-20', paymentMethod: 'M-Pesa' }
  ];

  const mockProducts = [
    { name: 'Nike Air Max', category: 'Footwear', brand: 'Nike', price: 12500, stock: 45, status: 'active' }
  ];

  const mockTransactions = [
    { id: 'TXN-001', customerEmail: 'john@example.com', amount: 12499, method: 'M-Pesa', status: 'completed', date: '2024-01-20' }
  ];

  const handleExport = (type) => {
    try {
      switch(type) {
        case 'users':
          exportUsers(mockUsers);
          toast.success('Users exported successfully!');
          break;
        case 'orders':
          exportOrders(mockOrders);
          toast.success('Orders exported successfully!');
          break;
        case 'products':
          exportProducts(mockProducts);
          toast.success('Products exported successfully!');
          break;
        case 'transactions':
          exportTransactions(mockTransactions);
          toast.success('Transactions exported successfully!');
          break;
        default:
          toast.error('Invalid export type');
      }
    } catch (error) {
      toast.error('Export failed. Please try again.');
    }
  };
  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Reports & Exports</h1>
        <p className="text-gray-400">Generate and download business reports</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => handleExport('products')}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Products Report</h3>
              <p className="text-sm text-gray-400">Product inventory data</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#00A676]">
            <FiDownload className="w-4 h-4" />
            <span className="text-sm">Export CSV</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => handleExport('orders')}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Orders Report</h3>
              <p className="text-sm text-gray-400">Order history & status</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#00A676]">
            <FiDownload className="w-4 h-4" />
            <span className="text-sm">Export CSV</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => handleExport('users')}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Users Report</h3>
              <p className="text-sm text-gray-400">User data & analytics</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#00A676]">
            <FiDownload className="w-4 h-4" />
            <span className="text-sm">Export CSV</span>
          </div>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => handleExport('transactions')}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <FiFileText className="w-6 h-6 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Transactions Report</h3>
              <p className="text-sm text-gray-400">Payment & transaction history</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#00A676]">
            <FiDownload className="w-4 h-4" />
            <span className="text-sm">Export CSV</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 hover:border-white/40 transition-all text-left group"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <FiPrinter className="w-6 h-6 text-teal-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white">Print Reports</h3>
              <p className="text-sm text-gray-400">Generate printable reports</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-[#00A676]">
            <FiPrinter className="w-4 h-4" />
            <span className="text-sm">Print</span>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default AdminReports;


import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiDownload, FiPrinter, FiUsers, FiShoppingCart, FiPackage, FiCreditCard } from 'react-icons/fi';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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

  // Universal PDF Export Function
  const handleExportPDF = () => {
    try {
      const activeTab = activeReport;
      let tableHeaders = [];
      let tableRows = [];

      switch (activeTab) {
        case 'products':
          // Inventory Report
          tableHeaders = ['Product Name', 'Brand', 'Category', 'Price', 'Stock'];
          tableRows = reportData.products.map(product => [
            product.name || 'N/A',
            product.brand || 'N/A',
            product.category || 'N/A',
            `KSh ${product.price || 0}`,
            product.stock || 0
          ]);
          break;
        case 'orders':
          // Sales Report
          tableHeaders = ['Order ID', 'Date', 'Customer', 'Phone', 'Total', 'Status'];
          tableRows = reportData.orders.map(order => [
            order._id ? order._id.substring(0, 8) : 'N/A',
            order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A',
            order.userEmail || 'N/A',
            order.shippingAddress?.phone || order.user?.phone || 'N/A',
            `KSh ${order.totalAmount || 0}`,
            order.status || 'pending'
          ]);
          break;
        case 'users':
          // Users/Customers Report
          tableHeaders = ['Name', 'Email', 'Phone', 'Role', 'Joined Date'];
          tableRows = reportData.users.map(user => [
            user.name || 'N/A',
            user.email || 'N/A',
            user.phoneNumber || 'N/A',
            user.role || 'user',
            user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'
          ]);
          break;
        case 'transactions':
          // Transactions Report
          tableHeaders = ['Transaction ID', 'Date', 'Customer', 'Amount', 'Method', 'Receipt No', 'Status'];
          tableRows = reportData.transactions.map(transaction => [
            transaction._id ? transaction._id.substring(0, 8) : 'N/A',
            transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A',
            transaction.userEmail || 'N/A',
            `KSh ${transaction.amount || 0}`,
            transaction.method || 'N/A',
            transaction.mpesaReceiptNumber || transaction.paymentResult?.receiptNumber || transaction.receiptNumber || 'N/A',
            transaction.status || 'N/A'
          ]);
          break;
        default:
          toast.error('Invalid report type');
          return;
      }

      // Check if data exists
      if (tableRows.length === 0) {
        toast.error(`No ${activeTab} data to export`);
        return;
      }

      // Generate PDF
      const doc = new jsPDF();
      const reportTitle = activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
      doc.text(`Seekon ${reportTitle} Report`, 14, 15);
      
      autoTable(doc, {
        startY: 20,
        head: [tableHeaders],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [17, 24, 39] } // Dark gray/black to match Seekon branding
      });
      
      doc.save(`Seekon_${activeTab}_Report.pdf`);
      toast.success(`${reportTitle} report exported successfully!`);
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
          onClick={() => { setActiveReport('products'); handleExportPDF(); }}
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
            <span className="text-sm">Export PDF</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => { setActiveReport('orders'); handleExportPDF(); }}
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
            <span className="text-sm">Export PDF</span>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => { setActiveReport('users'); handleExportPDF(); }}
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
            <span className="text-sm">Export PDF</span>
          </div>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => { setActiveReport('transactions'); handleExportPDF(); }}
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
            <span className="text-sm">Export PDF</span>
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

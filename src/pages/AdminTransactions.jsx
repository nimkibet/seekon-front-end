import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiDownload, FiEye, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminApi } from '../utils/adminApi';

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [search, statusFilter]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const data = await adminApi.getTransactions(params);
      setTransactions(data.transactions || data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewTransaction = async (id) => {
    try {
      setIsDetailLoading(true);
      const response = await adminApi.getTransaction(id);
      setSelectedTransaction(response.transaction || response);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      toast.error('Failed to fetch transaction details');
    } finally {
      setIsDetailLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const handleExport = async () => {
    try {
      await adminApi.exportTransactions();
      toast.success('Transactions exported successfully!');
    } catch (error) {
      console.error('Error exporting transactions:', error);
      toast.error('Failed to export transactions');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Transactions</h1>
        <p className="text-gray-400">Monitor all M-Pesa payments</p>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00A676]"
              placeholder="Search by phone, email, or reference..."
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-800 border-2 border-[#00A676] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 transition-all"
            style={{ backgroundColor: '#1f2937', color: 'white' }}
          >
            <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Status</option>
            <option value="completed" style={{ backgroundColor: '#1f2937', color: 'white' }}>Completed</option>
            <option value="pending" style={{ backgroundColor: '#1f2937', color: 'white' }}>Pending</option>
            <option value="failed" style={{ backgroundColor: '#1f2937', color: 'white' }}>Failed</option>
          </select>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[#00A676] hover:bg-[#008A5E] text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <FiDownload />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden mt-4">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A676] mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No transactions found</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full whitespace-nowrap min-w-max text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Phone</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Email</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Amount</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Reference</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {transactions.map((transaction) => (
                  <motion.tr
                    key={transaction._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap pr-8">
                      <button 
                        onClick={() => handleViewTransaction(transaction._id)}
                        className="text-[#00A676] hover:text-[#008A5E] transition-colors"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">{transaction.phoneNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{transaction.userEmail}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      KSh {transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">{transaction.reference}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Transaction Details</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {isDetailLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A676] mx-auto"></div>
                <p className="text-gray-400 mt-4">Loading details...</p>
              </div>
            ) : selectedTransaction ? (
              <div className="p-6 space-y-6">
                {/* Section A: Payment Details */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Status</p>
                      <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                        {selectedTransaction.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Amount Paid</p>
                      <p className="text-white font-semibold text-lg">KSh {selectedTransaction.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">M-Pesa Code</p>
                      <p className="text-white font-mono">{selectedTransaction.mpesaReceiptNumber || selectedTransaction.reference || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Date & Time</p>
                      <p className="text-white">{formatDateTime(selectedTransaction.transactionDate || selectedTransaction.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Phone Number</p>
                      <p className="text-white">{selectedTransaction.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white">{selectedTransaction.userEmail || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 text-sm">Reference</p>
                      <p className="text-white font-mono text-sm">{selectedTransaction.reference}</p>
                    </div>
                  </div>
                </div>

                {/* Section B: Order Summary (Products) */}
                {selectedTransaction.order && selectedTransaction.order.items && selectedTransaction.order.items.length > 0 && (
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                    <div className="overflow-x-auto rounded-lg">
                      <table className="w-full min-w-[500px]">
                        <thead className="bg-white/5">
                          <tr>
                            <th className="px-4 py-2 text-center md:text-left text-xs font-medium text-gray-300 uppercase whitespace-nowrap">Product</th>
                            <th className="px-4 py-2 text-center md:text-left text-xs font-medium text-gray-300 uppercase whitespace-nowrap">Qty</th>
                            <th className="px-4 py-2 text-center md:text-left text-xs font-medium text-gray-300 uppercase whitespace-nowrap">Price</th>
                            <th className="px-4 py-2 text-center md:text-left text-xs font-medium text-gray-300 uppercase whitespace-nowrap">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                          {selectedTransaction.order.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 text-white">
                                <div className="flex items-center gap-3">
                                  {item.product?.image && (
                                    <img 
                                      src={item.product.image} 
                                      alt={item.name}
                                      className="w-10 h-10 rounded object-cover"
                                    />
                                  )}
                                  <span>{item.name}</span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-gray-300">{item.quantity}</td>
                              <td className="px-4 py-3 text-gray-300">KSh {item.price?.toLocaleString()}</td>
                              <td className="px-4 py-3 text-white font-medium">KSh {(item.price * item.quantity)?.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-white/5">
                          <tr>
                            <td colSpan="3" className="px-4 py-3 text-right text-gray-300">Total:</td>
                            <td className="px-4 py-3 text-white font-bold">KSh {selectedTransaction.order.totalAmount?.toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {(!selectedTransaction.order || !selectedTransaction.order.items || selectedTransaction.order.items.length === 0) && (
                  <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                    <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                    <p className="text-gray-400">No order details available for this transaction.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <p className="text-gray-400">No transaction details available</p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminTransactions;

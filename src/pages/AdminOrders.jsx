import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiEye, FiUser, FiMapPin, FiPackage, FiCalendar, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminApi } from '../utils/adminApi';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  // Fulfillment form state
  const [fulfillmentData, setFulfillmentData] = useState({
    status: '',
    expectedArrival: '',
    deliveryDetails: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  useEffect(() => {
    if (selectedOrder) {
      setFulfillmentData({
        status: selectedOrder.status || 'pending',
        expectedArrival: selectedOrder.expectedArrival || '',
        deliveryDetails: selectedOrder.deliveryDetails || ''
      });
    }
  }, [selectedOrder]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const data = await adminApi.getOrders(params);
      setOrders(data.orders || data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewOrder = async (order) => {
    try {
      const data = await adminApi.getOrder(order._id);
      setSelectedOrder(data.order || data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    }
  };

  const handleUpdateFulfillment = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsUpdating(true);
    try {
      const result = await adminApi.updateOrderStatus(selectedOrder._id, fulfillmentData);
      toast.success('Order updated successfully!');
      
      // Update local state
      setSelectedOrder({
        ...selectedOrder,
        ...fulfillmentData
      });
      
      // Refresh orders list
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('Failed to update order');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCleanupAbandoned = async () => {
    if (!window.confirm('Are you sure you want to delete all abandoned orders (pending orders older than 1 hour)? This action cannot be undone.')) {
      return;
    }

    setIsCleaningUp(true);
    try {
      const response = await adminApi.cleanupAbandonedOrders();
      toast.success(response.message || 'Abandoned orders cleaned up successfully!');
      fetchOrders();
    } catch (error) {
      console.error('Error cleaning up abandoned orders:', error);
      toast.error('Failed to cleanup abandoned orders');
    } finally {
      setIsCleaningUp(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'shipped':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'delivered':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'processing':
        return <FiPackage className="w-4 h-4" />;
      case 'shipped':
        return <FiTruck className="w-4 h-4" />;
      case 'delivered':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  // Get user display name
  const getUserName = (order) => {
    if (order.user?.name) return order.user.name;
    if (order.shippingAddress?.name) return order.shippingAddress.name;
    if (order.userEmail) return order.userEmail.split('@')[0];
    return 'Guest';
  };

  // Get user email
  const getUserEmail = (order) => {
    if (order.user?.email) return order.user.email;
    if (order.userEmail) return order.userEmail;
    return 'N/A';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Orders</h1>
        <p className="text-gray-400">Manage and fulfill customer orders</p>
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
              placeholder="Search by email or reference..."
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
            <option value="pending" style={{ backgroundColor: '#1f2937', color: 'white' }}>Pending</option>
            <option value="processing" style={{ backgroundColor: '#1f2937', color: 'white' }}>Processing</option>
            <option value="shipped" style={{ backgroundColor: '#1f2937', color: 'white' }}>Shipped</option>
            <option value="delivered" style={{ backgroundColor: '#1f2937', color: 'white' }}>Delivered</option>
            <option value="cancelled" style={{ backgroundColor: '#1f2937', color: 'white' }}>Cancelled</option>
          </select>

          {/* Cleanup Button */}
          <button
            onClick={handleCleanupAbandoned}
            disabled={isCleaningUp}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-lg text-red-400 hover:bg-red-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCleaningUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                Cleaning...
              </>
            ) : (
              <>
                <FiTrash2 className="w-4 h-4" />
                Clear Abandoned
              </>
            )}
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden mt-4">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00A676] mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden mt-4">
            <div className="w-full overflow-x-auto">
              <table className="w-full whitespace-nowrap min-w-max text-left">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Actions</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Order ID</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Customer</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Items</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Total</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-center md:text-left text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {orders.map((order) => (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap pr-8">
                      <button 
                        onClick={() => handleViewOrder(order)}
                        className="text-[#00A676] hover:text-[#008A5E] transition-colors"
                      >
                        <FiEye className="w-5 h-5" />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white text-sm font-mono">
                      {order._id?.slice(-8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-white font-medium">{getUserName(order)}</p>
                        <p className="text-gray-400 text-xs">{getUserEmail(order)}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {order.items?.length || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-white font-medium">
                      KSh {(order.totalAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 text-sm">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            </div>
            </div>
        )}
      </div>

      {/* Order Details Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[105]"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[110] w-full sm:w-[450px] md:w-[550px] lg:w-[650px] bg-gray-900 border-l border-white/20 overflow-y-auto pt-20 sm:pt-6"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Order Details</h2>
                    <p className="text-gray-400 text-sm font-mono">{selectedOrder._id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FiXCircle className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4">Customer Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A676] to-[#008A5E] flex items-center justify-center">
                        <FiUser className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">
                          {getUserName(selectedOrder)}
                        </p>
                        <p className="text-xs text-gray-400">{getUserEmail(selectedOrder)}</p>
                        {selectedOrder.user?.phone && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            {selectedOrder.user.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <FiCalendar className="w-4 h-4" />
                      <span>Ordered: {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                {(selectedOrder.shippingMethod || selectedOrder.shippingAddress?.address) && (
                  <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <FiMapPin className="w-5 h-5" />
                      Shipping Details
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.shippingMethod && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Region:</span>
                          <span className="text-white font-medium">{selectedOrder.shippingMethod}</span>
                        </div>
                      )}
                      {selectedOrder.shippingPrice > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Shipping Cost:</span>
                          <span className="text-white font-medium">KSh {(selectedOrder.shippingPrice || 0).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedOrder.shippingAddress?.address && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Address:</span>
                          <span className="text-white font-medium">{selectedOrder.shippingAddress.address}</span>
                        </div>
                      )}
                      {selectedOrder.shippingAddress?.city && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">City:</span>
                          <span className="text-white font-medium">{selectedOrder.shippingAddress.city}</span>
                        </div>
                      )}
                      {selectedOrder.deliveryDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Delivery Date:</span>
                          <span className="text-white font-medium">{selectedOrder.deliveryDate}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4">Items ({selectedOrder.items?.length || 0})</h3>
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage className="w-8 h-8 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.size || 'N/A'} • {item.color || 'N/A'}</p>
                          <p className="text-sm font-bold text-white">KSh {(item.price || 0).toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Qty</p>
                          <p className="text-lg font-bold text-white">{item.quantity || 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Total Items</span>
                      <span className="text-white font-medium">{selectedOrder.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Subtotal</span>
                      <span className="text-white font-medium">KSh {(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                    </div>
                    {(selectedOrder.shippingPrice > 0) && (
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Shipping</span>
                        <span className="text-white font-medium">KSh {(selectedOrder.shippingPrice || 0).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/20">
                      <span>Total</span>
                      <span>KSh {((selectedOrder.totalAmount || 0) + (selectedOrder.shippingPrice || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Status Form */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FiTruck className="w-5 h-5" />
                    Fulfillment Status
                  </h3>
                  <form onSubmit={handleUpdateFulfillment} className="space-y-4">
                    {/* Status Select */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Order Status</label>
                      <select
                        value={fulfillmentData.status}
                        onChange={(e) => setFulfillmentData({ ...fulfillmentData, status: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00A676]"
                        style={{ backgroundColor: '#1f2937', color: 'white' }}
                      >
                        <option value="pending" style={{ backgroundColor: '#1f2937', color: 'white' }}>Pending</option>
                        <option value="processing" style={{ backgroundColor: '#1f2937', color: 'white' }}>Processing</option>
                        <option value="shipped" style={{ backgroundColor: '#1f2937', color: 'white' }}>Shipped</option>
                        <option value="delivered" style={{ backgroundColor: '#1f2937', color: 'white' }}>Delivered</option>
                        <option value="cancelled" style={{ backgroundColor: '#1f2937', color: 'white' }}>Cancelled</option>
                      </select>
                    </div>

                    {/* Expected Arrival */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Expected Arrival</label>
                      <input
                        type="text"
                        value={fulfillmentData.expectedArrival}
                        onChange={(e) => setFulfillmentData({ ...fulfillmentData, expectedArrival: e.target.value })}
                        placeholder="e.g., 2-3 business days, March 15, 2024"
                        className="w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A676]"
                      />
                    </div>

                    {/* Delivery Details */}
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Delivery Details</label>
                      <textarea
                        value={fulfillmentData.deliveryDetails}
                        onChange={(e) => setFulfillmentData({ ...fulfillmentData, deliveryDetails: e.target.value })}
                        placeholder="Add tracking info, delivery notes, etc."
                        rows={3}
                        className="w-full px-4 py-2 bg-gray-800 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00A676] resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="w-full px-4 py-3 bg-[#00A676] hover:bg-[#008A5E] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle className="w-5 h-5" />
                          Update Order
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;

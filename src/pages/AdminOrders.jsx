import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiEye, FiUser, FiMapPin, FiPackage, FiCalendar, FiTruck, FiCheckCircle, FiClock, FiXCircle, FiTrash2, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi';
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

  const getShortId = (id) => {
    if (!id) return '#SK-0000';
    const lastFour = id.slice(-4).toUpperCase();
    return `#SK-${lastFour}`;
  };

  const getProductSku = (item) => {
    let skuVal = '';
    if (item.sku) skuVal = item.sku;
    else if (item.product?.sku) skuVal = item.product.sku;
    else {
      const namePart = (item.name || 'PROD').slice(0, 3).toUpperCase().replace(/\s+/g, '');
      const colorPart = (item.color || 'VAR').slice(0, 3).toUpperCase().replace(/\s+/g, '');
      const sizePart = (item.size || 'ALL').toUpperCase().replace(/\s+/g, '');
      skuVal = `${namePart}-${colorPart}-${sizePart}`;
    }
    return skuVal.startsWith('SKU:') ? skuVal : `SKU: ${skuVal}`;
  };

  const getStatusColor = (status) => {
    const cleanStatus = status?.toLowerCase();
    switch (cleanStatus) {
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'processing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'shipped':
      case 'delivered':
      case 'fulfilled':
      case 'paid':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'cancelled':
      case 'failed':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-stone-500/10 text-stone-400 border-stone-500/30';
    }
  };

  const getStatusIcon = (status) => {
    const cleanStatus = status?.toLowerCase();
    switch (cleanStatus) {
      case 'pending':
        return <FiClock className="w-4 h-4" />;
      case 'processing':
        return <FiPackage className="w-4 h-4" />;
      case 'shipped':
        return <FiTruck className="w-4 h-4" />;
      case 'delivered':
      case 'fulfilled':
      case 'paid':
        return <FiCheckCircle className="w-4 h-4" />;
      case 'cancelled':
      case 'failed':
        return <FiXCircle className="w-4 h-4" />;
      default:
        return <FiClock className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status) => {
    const cleanStatus = status?.toLowerCase();
    switch (cleanStatus) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Fulfilled';
      case 'fulfilled': return 'Fulfilled';
      case 'paid': return 'Paid';
      case 'cancelled': return 'Cancelled';
      case 'failed': return 'Action Required';
      default: return status || 'Unknown';
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
    <div className="w-full min-w-0 p-4 sm:p-6">
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
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden mt-4 w-full min-w-0">
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
            <div className="w-full min-w-0 overflow-x-auto">
              <table className="w-full whitespace-nowrap min-w-[800px] text-left">
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
                    <td className="px-6 py-4 whitespace-nowrap text-white text-sm font-mono" title={order._id}>
                      {getShortId(order._id)}
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1 w-fit capitalize ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
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
              className="fixed inset-y-0 right-0 z-[110] w-full sm:w-[450px] md:w-[550px] lg:w-[650px] bg-gray-900 border-l border-white/20 flex flex-col pt-20 sm:pt-6"
            >
              <div className="flex-1 overflow-y-auto p-6 pb-24">
                {/* Header */}
                <div className="flex items-start justify-between mb-6 border-b border-white/10 pb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-white">Order Details</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 capitalize ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        {getStatusLabel(selectedOrder.status)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-gray-400 text-sm font-mono">{getShortId(selectedOrder._id)}</p>
                      <span className="text-xs text-stone-500 font-mono">({selectedOrder._id})</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  >
                    <FiXCircle className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                    <h3 className="text-lg font-bold text-white">Customer Information</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border flex items-center gap-1.5 capitalize ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      {getStatusLabel(selectedOrder.status)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00A676] to-[#008A5E] flex items-center justify-center flex-shrink-0">
                        <FiUser className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">
                          {getUserName(selectedOrder)}
                        </p>
                        
                        {/* Email address row */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <p className="text-xs text-gray-400 select-all font-mono truncate">{getUserEmail(selectedOrder)}</p>
                          <a 
                            href={`mailto:${getUserEmail(selectedOrder)}`}
                            title="Send Email"
                            className="inline-flex items-center justify-center p-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-md text-gray-400 hover:text-white transition-all cursor-pointer"
                          >
                            <FiMessageSquare size={12} />
                          </a>
                        </div>

                        {/* Phone number row directly below */}
                        {(selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || selectedOrder.guestPhone) && (
                          <div className="flex items-center gap-2 mt-1.5">
                            <p className="text-xs text-gray-400 font-mono select-all">
                              {selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || selectedOrder.guestPhone}
                            </p>
                            <a 
                              href={`https://wa.me/${(selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || selectedOrder.guestPhone).replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="Chat on WhatsApp"
                              className="inline-flex items-center justify-center p-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-md text-emerald-400 hover:text-emerald-300 transition-all cursor-pointer"
                            >
                              <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.579 1.968 14.12 .943 11.997.943c-5.433 0-9.859 4.37-9.863 9.8-.001 2.09.547 4.123 1.588 5.925L2.748 21.01l4.899-1.27c.001-.001.001-.001 0 0zm12.185-7.102c-.301-.151-1.784-.882-2.057-.981-.273-.099-.471-.148-.669.151-.197.299-.765.981-.937 1.18-.172.197-.344.222-.646.072-.301-.15-1.272-.469-2.423-1.495-.895-.798-1.5-1.784-1.676-2.084-.176-.301-.019-.464.132-.612.135-.133.301-.351.452-.527.15-.176.2-.301.301-.502.101-.201.05-.376-.025-.526-.075-.151-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.516.074-.786.374-.27.299-1.031 1.01-1.031 2.463 0 1.453 1.056 2.859 1.204 3.058.148.197 2.078 3.174 5.035 4.453.703.304 1.252.486 1.68.622.709.226 1.354.194 1.864.118.569-.085 1.784-.73 2.033-1.433.248-.703.248-1.307.172-1.433-.075-.126-.272-.201-.572-.352z"/>
                             </svg>
                           </a>
                         </div>
                       )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mt-3 border-t border-white/5 pt-2">
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
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Items ({selectedOrder.items?.length || 0})</h3>
                  <div className="space-y-3">
                    {(selectedOrder.items || []).map((item, index) => {
                      const productId = item.product?._id || item.product || item._id;
                      const lineTotal = (item.price || 0) * (item.quantity || 1);
                      const isRestockRequired = item.product && typeof item.product.stock === 'number' && item.product.stock <= 0;

                      return (
                        <div key={index} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 border border-white/5 hover:border-white/10 transition-all">
                          <a 
                            href={`/admin/products?edit=${productId}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="w-16 h-16 bg-gray-800 rounded-lg flex-shrink-0 overflow-hidden hover:opacity-80 border border-white/10 transition-all cursor-pointer flex items-center justify-center"
                          >
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FiPackage className="w-8 h-8 text-gray-500" />
                              </div>
                            )}
                          </a>
                          <div className="flex-1 min-w-0">
                            <a 
                              href={`/admin/products?edit=${productId}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-sm font-medium text-white hover:text-[#00A676] hover:underline transition-colors block truncate cursor-pointer"
                            >
                              {item.name}
                            </a>
                            <p className="text-xs text-gray-400 mt-0.5 capitalize">
                              {item.size || 'N/A'} • {item.color || 'N/A'}
                            </p>
                            <p className="text-[10px] font-mono text-stone-500 mt-1 tracking-wider uppercase bg-white/5 w-fit px-1.5 py-0.5 rounded border border-white/5">
                              {getProductSku(item)}
                            </p>
                            <p className="text-xs text-stone-500 mt-1.5">
                              KSh {(item.price || 0).toLocaleString()} each
                            </p>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1.5 pl-2">
                            <div className="flex items-center gap-1.5">
                              {isRestockRequired && (
                                <FiAlertTriangle 
                                  className="text-amber-500 w-4 h-4 cursor-help" 
                                  title="Restock required - Inventory is exhausted!"
                                />
                              )}
                              <span className="text-xs text-gray-400 font-medium bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                Qty {item.quantity || 1}
                              </span>
                            </div>
                            <p className="text-base font-bold text-white font-mono">
                              KSh {lineTotal.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Financial Summary Block (Pre-Footer) */}
                <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-2">Financial Summary</h3>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white font-semibold font-mono">KSh {(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shipping Cost</span>
                      <span className="text-white font-semibold font-mono">
                        {selectedOrder.shippingPrice > 0 
                          ? `KSh ${selectedOrder.shippingPrice.toLocaleString()}` 
                          : 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/10">
                      <span>Grand Total</span>
                      <span className="text-emerald-400 font-mono font-bold text-xl">
                        KSh {((selectedOrder.totalAmount || 0) + (selectedOrder.shippingPrice || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Fulfillment Status Form */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <FiTruck className="w-5 h-5" />
                    Fulfillment Status Details
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
                      <label className="block text-sm text-gray-400 mb-2">Delivery Details / Tracking Info</label>
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
                      className="w-full px-4 py-3 bg-[#00A676] hover:bg-[#008A5E] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isUpdating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle className="w-5 h-5" />
                          Update Tracking Details
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="absolute bottom-0 left-0 right-0 bg-[#0C0A09]/95 backdrop-blur-md border-t border-white/10 p-4 flex gap-3 z-10">
                <button
                  onClick={async () => {
                    setIsUpdating(true);
                    try {
                      await adminApi.updateOrderStatus(selectedOrder._id, { 
                        status: 'delivered',
                        expectedArrival: selectedOrder.expectedArrival,
                        deliveryDetails: selectedOrder.deliveryDetails
                      });
                      toast.success('Order marked as fulfilled!');
                      setSelectedOrder(prev => ({ ...prev, status: 'delivered' }));
                      setFulfillmentData(prev => ({ ...prev, status: 'delivered' }));
                      fetchOrders();
                    } catch (err) {
                      toast.error('Failed to update order status');
                    } finally {
                      setIsUpdating(false);
                    }
                  }}
                  disabled={isUpdating || selectedOrder.status === 'delivered'}
                  className="flex-1 py-3 px-4 bg-[#00A676] hover:bg-[#008A5E] disabled:bg-stone-800 disabled:text-stone-500 disabled:border-stone-800 border border-[#00A676] disabled:border-stone-800 text-white font-semibold rounded-lg transition-colors cursor-pointer text-center text-sm flex items-center justify-center gap-2"
                >
                  <FiCheckCircle size={16} />
                  Mark as Fulfilled
                </button>
                
                <button
                  onClick={async () => {
                    if (window.confirm('Are you sure you want to cancel this order?')) {
                      setIsUpdating(true);
                      try {
                        await adminApi.updateOrderStatus(selectedOrder._id, { 
                          status: 'cancelled',
                          expectedArrival: selectedOrder.expectedArrival,
                          deliveryDetails: selectedOrder.deliveryDetails
                        });
                        toast.success('Order marked as cancelled!');
                        setSelectedOrder(prev => ({ ...prev, status: 'cancelled' }));
                        setFulfillmentData(prev => ({ ...prev, status: 'cancelled' }));
                        fetchOrders();
                      } catch (err) {
                        toast.error('Failed to cancel order');
                      } finally {
                        setIsUpdating(false);
                      }
                    }
                  }}
                  disabled={isUpdating || selectedOrder.status === 'cancelled'}
                  className="py-3 px-4 bg-transparent border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 disabled:opacity-50 disabled:cursor-not-allowed font-semibold rounded-lg transition-colors cursor-pointer text-sm"
                >
                  Cancel Order
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminOrders;

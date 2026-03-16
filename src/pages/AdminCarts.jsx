import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShoppingBag, FiSearch, FiEdit, FiTrash2, FiUser, 
  FiCalendar, FiDollarSign, FiPackage, FiTrendingUp, FiPhone, FiMapPin
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminApi } from '../utils/adminApi';

const AdminCarts = () => {
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCart, setSelectedCart] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getOrders();
      // Transform orders to cart-like structure
      const orders = Array.isArray(data) ? data : (data.orders || []);
      setCarts(orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredCarts = carts.filter(cart => {
    const matchesSearch = 
      (cart.userName || cart.shippingAddress?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cart.userEmail || cart.shippingAddress?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cart._id || cart.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cart.shippingAddress?.phone || '').includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || cart.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewCart = (cart) => {
    setSelectedCart(cart);
  };

  const handleDeleteCart = async (cartId) => {
    if (window.confirm('Are you sure you want to delete this cart? This action cannot be undone.')) {
      try {
        // Use _id if available, fallback to id
        const orderId = cartId._id || cartId;
        await adminApi.deleteOrder(orderId);
        
        // Update state to remove the deleted cart
        setCarts(carts.filter(cart => (cart._id || cart.id) !== (cartId._id || cartId)));
        
        toast.success('Cart deleted successfully');
      } catch (error) {
        console.error('Error deleting cart:', error);
        toast.error(error.response?.data?.message || 'Failed to delete cart');
      }
    }
  };

  const handleEditCartItem = (cartId, itemId, newQuantity) => {
    setCarts(carts.map(cart => {
      if (cart.id === cartId) {
        const updatedItems = cart.items.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        );
        const totalItems = updatedItems.reduce((sum, item) => sum + item.quantity, 0);
        const totalPrice = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        return { ...cart, items: updatedItems, totalItems, totalPrice };
      }
      return cart;
    }));
    toast.success('Cart updated successfully');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'abandoned': return 'bg-yellow-500/20 text-yellow-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const totalCarts = carts.length;
  const activeCarts = carts.filter(c => c.status === 'active').length;
  const totalValue = carts.reduce((sum, cart) => sum + (cart.totalPrice || cart.totalAmount || 0), 0);
  const averageCartValue = totalCarts > 0 ? Math.round(totalValue / totalCarts) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cart Management</h1>
          <p className="text-gray-400">View and manage all customer shopping carts</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Carts</p>
              <p className="text-2xl font-bold text-white">{totalCarts}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FiShoppingBag className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Active Carts</p>
              <p className="text-2xl font-bold text-white">{activeCarts}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Value</p>
              <p className="text-2xl font-bold text-white">KSh {(totalValue || 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Avg Cart Value</p>
              <p className="text-2xl font-bold text-white">KSh {(averageCartValue || 0).toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <FiPackage className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user name, email, or cart ID..."
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676]"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white/10 border-2 border-[#00A676] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 transition-all"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <option value="all" className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Status</option>
            <option value="active" className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>Active</option>
            <option value="abandoned" className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>Abandoned</option>
            <option value="completed" className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>Completed</option>
          </select>
        </div>
      </div>

      {/* Carts List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden">
        <div className="w-full overflow-x-auto rounded-lg shadow-sm">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-center md:text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase whitespace-nowrap">Actions</th>
                <th className="text-center md:text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase whitespace-nowrap">Cart ID</th>
                <th className="text-center md:text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase whitespace-nowrap">Customer</th>
                <th className="text-center md:text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase whitespace-nowrap">Items</th>
                <th className="text-center md:text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase whitespace-nowrap">Total</th>
                <th className="text-center md:text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase whitespace-nowrap">Status</th>
                <th className="text-center md:text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase whitespace-nowrap">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarts.map((cart) => (
                <tr key={cart.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 whitespace-nowrap pr-8">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewCart(cart)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <FiEdit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteCart(cart)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-white font-medium whitespace-nowrap">{cart.id}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00A676] to-[#008A5E] flex items-center justify-center">
                        <FiUser className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{cart.userName}</p>
                        <p className="text-xs text-gray-400">{cart.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-white whitespace-nowrap">{cart.totalItems}</td>
                  <td className="py-3 px-4 text-sm font-bold text-white whitespace-nowrap">KSh {(cart.totalPrice || cart.totalAmount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cart.status)}`}>
                      {cart.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400 whitespace-nowrap">
                    {new Date(cart.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Cart Details Modal */}
      <AnimatePresence>
        {selectedCart && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[105]"
              onClick={() => setSelectedCart(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-[110] w-full sm:w-[450px] md:w-[500px] lg:w-[600px] bg-gray-900 border-l border-white/20 overflow-y-auto pt-20 sm:pt-6"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Cart Details</h2>
                    <p className="text-gray-400 text-sm">{selectedCart.id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedCart(null)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <FiEdit className="w-6 h-6 text-white rotate-45" />
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
                          {selectedCart.userName || selectedCart.shippingAddress?.firstName + ' ' + selectedCart.shippingAddress?.lastName || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-400">{selectedCart.userEmail || selectedCart.shippingAddress?.email || 'N/A'}</p>
                        {(selectedCart.userPhone || selectedCart.shippingAddress?.phone) && (
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <FiPhone className="w-3 h-3" />
                            {selectedCart.userPhone || selectedCart.shippingAddress?.phone}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <FiCalendar className="w-4 h-4" />
                      <span>Created: {new Date(selectedCart.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <FiCalendar className="w-4 h-4" />
                      <span>Updated: {new Date(selectedCart.updatedAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                {(selectedCart.shippingMethod || selectedCart.shippingAddress?.address) && (
                  <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <FiMapPin className="w-5 h-5" />
                      Shipping Details
                    </h3>
                    <div className="space-y-3">
                      {selectedCart.shippingMethod && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Region:</span>
                          <span className="text-white font-medium">{selectedCart.shippingMethod}</span>
                        </div>
                      )}
                      {selectedCart.shippingPrice > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Shipping Cost:</span>
                          <span className="text-white font-medium">KSh {(selectedCart.shippingPrice || 0).toLocaleString()}</span>
                        </div>
                      )}
                      {(selectedCart.shippingAddress?.address || selectedCart.address) && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Address:</span>
                          <span className="text-white font-medium">{selectedCart.shippingAddress?.address || selectedCart.address}</span>
                        </div>
                      )}
                      {selectedCart.deliveryDate && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Delivery Date:</span>
                          <span className="text-white font-medium">{selectedCart.deliveryDate}</span>
                        </div>
                      )}
                      {selectedCart.convenientTime && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Preferred Time:</span>
                          <span className="text-white font-medium">{selectedCart.convenientTime}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cart Items */}
                <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4">Items ({selectedCart.items?.length || 0})</h3>
                  <div className="space-y-3">
                    {(selectedCart.items || []).map((item, index) => (
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
                          <p className="text-sm text-gray-400">Quantity</p>
                          <p className="text-lg font-bold text-white">{item.quantity || 1}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart Summary */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Total Items</span>
                      <span className="text-white font-medium">{selectedCart.totalItems || selectedCart.items?.length || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Subtotal</span>
                      <span className="text-white font-medium">KSh {(selectedCart.totalPrice || selectedCart.totalAmount || 0).toLocaleString()}</span>
                    </div>
                    {(selectedCart.shippingPrice > 0) && (
                      <div className="flex justify-between text-sm text-gray-400">
                        <span>Shipping</span>
                        <span className="text-white font-medium">KSh {(selectedCart.shippingPrice || 0).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/20">
                      <span>Total</span>
                      <span>KSh {((selectedCart.totalPrice || selectedCart.totalAmount || 0) + (selectedCart.shippingPrice || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCarts;


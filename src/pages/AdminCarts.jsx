import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShoppingBag, FiSearch, FiEdit, FiTrash2, FiUser, 
  FiCalendar, FiDollarSign, FiPackage, FiTrendingUp 
} from 'react-icons/fi';
import toast from 'react-hot-toast';

// Mock cart data
const MOCK_CARTS = [
  {
    id: 'cart-001',
    userId: 'user-001',
    userName: 'John Doe',
    userEmail: 'john@example.com',
    items: [
      { id: 'prod-001', name: 'Nike Air Max 270', size: '42', color: 'Black', quantity: 1, price: 12500, image: '/images/nike.jpg' },
      { id: 'prod-002', name: 'Adidas Hoodie', size: 'L', color: 'Blue', quantity: 2, price: 6500, image: '/images/hoodie.jpg' }
    ],
    totalItems: 3,
    totalPrice: 25500,
    createdAt: '2025-01-26T10:30:00Z',
    updatedAt: '2025-01-26T14:45:00Z',
    status: 'active'
  },
  {
    id: 'cart-002',
    userId: 'user-002',
    userName: 'Jane Smith',
    userEmail: 'jane@example.com',
    items: [
      { id: 'prod-003', name: 'Puma Running Shoes', size: '40', color: 'White', quantity: 1, price: 9800, image: '/images/puma.jpg' }
    ],
    totalItems: 1,
    totalPrice: 9800,
    createdAt: '2025-01-26T09:15:00Z',
    updatedAt: '2025-01-26T09:15:00Z',
    status: 'active'
  },
  {
    id: 'cart-003',
    userId: 'user-003',
    userName: 'Mike Johnson',
    userEmail: 'mike@example.com',
    items: [
      { id: 'prod-004', name: 'Reebok Cap', size: 'One Size', color: 'Red', quantity: 1, price: 2500, image: '/images/cap.jpg' },
      { id: 'prod-005', name: 'Nike Shorts', size: 'M', color: 'Gray', quantity: 3, price: 4500, image: '/images/shorts.jpg' }
    ],
    totalItems: 4,
    totalPrice: 16000,
    createdAt: '2025-01-25T16:20:00Z',
    updatedAt: '2025-01-26T11:00:00Z',
    status: 'abandoned'
  }
];

const AdminCarts = () => {
  const [carts, setCarts] = useState(MOCK_CARTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedCart, setSelectedCart] = useState(null);

  const filteredCarts = carts.filter(cart => {
    const matchesSearch = 
      cart.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cart.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || cart.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleViewCart = (cart) => {
    setSelectedCart(cart);
  };

  const handleDeleteCart = (cartId) => {
    if (window.confirm('Are you sure you want to delete this cart?')) {
      setCarts(carts.filter(cart => cart.id !== cartId));
      toast.success('Cart deleted successfully');
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
  const totalValue = carts.reduce((sum, cart) => sum + cart.totalPrice, 0);
  const averageCartValue = Math.round(totalValue / totalCarts);

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
              <p className="text-2xl font-bold text-white">KSh {totalValue.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-white">KSh {averageCartValue.toLocaleString()}</p>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Cart ID</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Items</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Total</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-400 uppercase">Last Updated</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCarts.map((cart) => (
                <tr key={cart.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-sm text-white font-medium">{cart.id}</td>
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
                  <td className="py-3 px-4 text-sm text-white">{cart.totalItems}</td>
                  <td className="py-3 px-4 text-sm font-bold text-white">KSh {cart.totalPrice.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cart.status)}`}>
                      {cart.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {new Date(cart.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewCart(cart)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <FiEdit className="w-4 h-4 text-blue-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteCart(cart.id)}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={() => setSelectedCart(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full md:w-[500px] bg-gray-900 border-l border-white/20 z-[9999] overflow-y-auto"
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
                        <p className="text-sm font-medium text-white">{selectedCart.userName}</p>
                        <p className="text-xs text-gray-400">{selectedCart.userEmail}</p>
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

                {/* Cart Items */}
                <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4">Cart Items ({selectedCart.items.length})</h3>
                  <div className="space-y-3">
                    {selectedCart.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 bg-white/5 rounded-lg p-3">
                        <div className="w-16 h-16 bg-gray-700 rounded-lg flex-shrink-0">
                          <div className="w-full h-full flex items-center justify-center">
                            <FiPackage className="w-8 h-8 text-gray-500" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-white">{item.name}</p>
                          <p className="text-xs text-gray-400">{item.size} • {item.color}</p>
                          <p className="text-sm font-bold text-white">KSh {item.price.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Quantity</p>
                          <p className="text-lg font-bold text-white">{item.quantity}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cart Summary */}
                <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4">Cart Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>Total Items</span>
                      <span className="text-white font-medium">{selectedCart.totalItems}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-white/20">
                      <span>Total Price</span>
                      <span>KSh {selectedCart.totalPrice.toLocaleString()}</span>
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


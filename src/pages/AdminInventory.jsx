import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiAlertCircle, FiCheckCircle, FiRefreshCw, FiSearch, FiFilter } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { adminApi } from '../utils/adminApi';

const AdminInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getProducts();
      const products = data.products || data || [];
      
      // Transform products to inventory format
      const inventoryData = products.map(product => ({
        _id: product._id || product.id,
        name: product.name,
        category: product.category,
        brand: product.brand,
        size: product.size || 'N/A',
        color: product.color || 'N/A',
        stock: product.stock || 0,
        threshold: product.threshold || 10,
        status: getStockStatus(product.stock || 0)
      }));
      
      setInventory(inventoryData);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      toast.error('Failed to load inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return 'out_of_stock';
    if (stock <= 5) return 'low_stock';
    return 'in_stock';
  };

  const getStatusBadge = (status) => {
    const badges = {
      'in_stock': 'bg-green-500/20 text-green-400 border-green-500/30',
      'low_stock': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'out_of_stock': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return badges[status] || badges['in_stock'];
  };

  const getStatusIcon = (status) => {
    if (status === 'in_stock') return <FiCheckCircle className="w-4 h-4" />;
    if (status === 'low_stock' || status === 'out_of_stock') return <FiAlertCircle className="w-4 h-4" />;
    return <FiPackage className="w-4 h-4" />;
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || item.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: inventory.length,
    in_stock: inventory.filter(item => item.status === 'in_stock').length,
    low_stock: inventory.filter(item => item.status === 'low_stock').length,
    out_of_stock: inventory.filter(item => item.status === 'out_of_stock').length,
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00A676] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Inventory Management</h1>
        <p className="text-gray-400">Monitor and manage product stock levels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 sm:mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Total Items</p>
              <p className="text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <FiCheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">In Stock</p>
              <p className="text-2xl font-bold text-white">{stats.in_stock}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Low Stock</p>
              <p className="text-2xl font-bold text-white">{stats.low_stock}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-6 border border-white/20"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
              <FiAlertCircle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Out of Stock</p>
              <p className="text-2xl font-bold text-white">{stats.out_of_stock}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676]"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-800 border-2 border-[#00A676] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 transition-all"
            style={{ backgroundColor: '#1f2937', color: 'white' }}
          >
            <option value="all" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Status</option>
            <option value="in_stock" style={{ backgroundColor: '#1f2937', color: 'white' }}>In Stock</option>
            <option value="low_stock" style={{ backgroundColor: '#1f2937', color: 'white' }}>Low Stock</option>
            <option value="out_of_stock" style={{ backgroundColor: '#1f2937', color: 'white' }}>Out of Stock</option>
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 bg-gray-800 border-2 border-[#00A676] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 transition-all"
            style={{ backgroundColor: '#1f2937', color: 'white' }}
          >
            <option value="all" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Categories</option>
            <option value="footwear" style={{ backgroundColor: '#1f2937', color: 'white' }}>Footwear</option>
            <option value="apparels" style={{ backgroundColor: '#1f2937', color: 'white' }}>Apparels</option>
            <option value="accessories" style={{ backgroundColor: '#1f2937', color: 'white' }}>Accessories</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr className="border-b border-white/10">
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Product</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Category</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Brand</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Size</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Color</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Stock</th>
                <th className="text-left py-4 px-4 text-sm font-medium text-gray-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="py-4 px-4 text-white font-medium">{item.name}</td>
                  <td className="py-4 px-4 text-gray-300">{item.category}</td>
                  <td className="py-4 px-4 text-gray-300">{item.brand}</td>
                  <td className="py-4 px-4 text-gray-300">{item.size}</td>
                  <td className="py-4 px-4 text-gray-300">{item.color}</td>
                  <td className="py-4 px-4 text-white">{item.stock}</td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(item.status)}`}>
                      {getStatusIcon(item.status)}
                      <span>{item.status.replace('_', ' ')}</span>
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminInventory;


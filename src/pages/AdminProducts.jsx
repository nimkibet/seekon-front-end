import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiSearch, FiEdit, FiTrash2, FiMoreVertical, FiTrendingUp, FiFilter, FiChevronDown, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProductModal from '../components/ProductModal';
import { adminApi } from '../utils/adminApi';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Fetch products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getProducts();
      setProducts(data.products || data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Sorting and filtering logic
  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = 
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch(sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'sales':
          comparison = a.sales - b.sales;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Automatically calculate stats from products array
  const stats = React.useMemo(() => {
    const inStockCount = products.filter(p => {
      const status = p.status || (p.stock === 0 ? 'out_of_stock' : p.stock <= 5 ? 'low_stock' : 'active');
      return (p.stock || 0) > 5 && status === 'active';
    }).length;
    const lowStockCount = products.filter(p => {
      const stock = p.stock || 0;
      const status = p.status || (stock === 0 ? 'out_of_stock' : stock <= 5 ? 'low_stock' : 'active');
      return stock > 0 && stock <= 5 && status === 'active';
    }).length;
    const outOfStockCount = products.filter(p => {
      const stock = p.stock || 0;
      const status = p.status || (stock === 0 ? 'out_of_stock' : stock <= 5 ? 'low_stock' : 'active');
      return stock === 0 || status === 'out_of_stock';
    }).length;
    return {
      total: products.length,
      inStock: inStockCount,
      lowStock: lowStockCount,
      outOfStock: outOfStockCount,
      totalValue: products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)
    };
  }, [products]);

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteProduct = (productId, productName) => {
    setProductToDelete({ id: productId, name: productName });
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      await adminApi.deleteProduct(productToDelete.id);
      setProducts(products.filter(p => p._id !== productToDelete.id && p.id !== productToDelete.id));
      
      // Trigger global event to refresh client pages
      window.dispatchEvent(new CustomEvent('productsUpdated', { 
        detail: { action: 'deleted', productId: productToDelete.id } 
      }));
      window.dispatchEvent(new Event('productsUpdated'));
      
      toast.success('Product deleted successfully');
      setIsDeleteModalOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleSaveProduct = async (productData) => {
    try {
      let response;
      if (selectedProduct) {
        // Update existing product
        const productId = selectedProduct._id || selectedProduct.id;
        response = await adminApi.updateProduct(productId, productData);
        toast.success('Product updated successfully');
      } else {
        // Add new product
        response = await adminApi.createProduct(productData);
        toast.success('Product added successfully');
      }
      
      // Refresh products list
      await fetchProducts();
      
      // Trigger global event to refresh client pages
      window.dispatchEvent(new CustomEvent('productsUpdated', {
        detail: { action: selectedProduct ? 'updated' : 'created', productId: response?.product?._id || response?.product?.id || productData.id }
      }));
      
      // Also dispatch to window for broader compatibility
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('productsUpdated'));
      }
      
      // Clear modal
      setIsModalOpen(false);
      setSelectedProduct(null);
      
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMessage = error.message || 'Failed to save product';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-400';
      case 'out_of_stock': return 'bg-red-500/20 text-red-400';
      case 'inactive': return 'bg-gray-500/20 text-gray-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Sneakers': return 'bg-blue-500/20 text-blue-400';
      case 'Boots': return 'bg-orange-500/20 text-orange-400';
      case 'Apparel': return 'bg-purple-500/20 text-purple-400';
      case 'Accessories': return 'bg-yellow-500/20 text-yellow-400';
      case 'Men': return 'bg-indigo-500/20 text-indigo-400';
      case 'Women': return 'bg-pink-500/20 text-pink-400';
      case 'Kids': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'stock', label: 'Stock' },
    { value: 'sales', label: 'Sales' },
    { value: 'category', label: 'Category' }
  ];

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00A676] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading products...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Products</h1>
          <p className="text-gray-400 text-sm sm:text-base">Manage product catalog</p>
        </div>
        <button
          onClick={handleAddProduct}
          className="flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-[#00A676] hover:bg-[#008A5E] text-white rounded-lg transition-all shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
        >
          <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="text-sm sm:text-base font-medium">Add Product</span>
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Products</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">In Stock</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.inStock}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Low Stock</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.lowStock}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
              <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Out of Stock</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.outOfStock}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-red-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-3 sm:p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm mb-1">Total Value</p>
              <p className="text-lg sm:text-xl font-bold text-white">
                <span className="text-xs sm:text-sm font-normal">KSh </span>
                {(stats.totalValue / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
              <FiTrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-2.5 bg-white/5 border border-white/20 rounded-lg text-white text-sm sm:text-base placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-gray-800 border border-[#00A676] rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/50 transition-all"
              style={{ 
                color: 'white',
                backgroundColor: '#1f2937'
              }}
            >
              <option value="all" style={{ backgroundColor: '#1f2937', color: 'white' }}>All Categories</option>
              <option value="sneakers" style={{ backgroundColor: '#1f2937', color: 'white' }}>Sneakers</option>
              <option value="apparel" style={{ backgroundColor: '#1f2937', color: 'white' }}>Apparel</option>
              <option value="boots" style={{ backgroundColor: '#1f2937', color: 'white' }}>Boots</option>
              <option value="men" style={{ backgroundColor: '#1f2937', color: 'white' }}>Men</option>
              <option value="women" style={{ backgroundColor: '#1f2937', color: 'white' }}>Women</option>
              <option value="kids" style={{ backgroundColor: '#1f2937', color: 'white' }}>Kids</option>
              <option value="accessories" style={{ backgroundColor: '#1f2937', color: 'white' }}>Accessories</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 sm:py-2.5 bg-gray-800 border border-[#00A676] rounded-lg text-white text-sm sm:text-base focus:outline-none focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/50 transition-all"
              style={{ 
                color: 'white',
                backgroundColor: '#1f2937'
              }}
          >
            {sortOptions.map(option => (
              <option 
                key={option.value} 
                value={option.value}
                style={{ backgroundColor: '#1f2937', color: 'white' }}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className={`w-full sm:w-auto px-4 py-2 sm:py-2.5 border rounded-lg text-white text-sm sm:text-base flex items-center justify-center space-x-2 transition-all ${
              sortOrder === 'asc' 
                ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                : 'bg-purple-500/20 border-purple-500 text-purple-400'
            }`}
          >
            <FiFilter className="w-4 h-4" />
            <span className="hidden sm:inline">
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </span>
            <span className="sm:hidden">
              {sortOrder === 'asc' ? '↑' : '↓'}
            </span>
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        <AnimatePresence>
          {filteredAndSortedProducts.map((product, index) => {
            const productId = product._id || product.id;
            const productStatus = product.status || (product.stock === 0 ? 'out_of_stock' : product.stock <= 5 ? 'low_stock' : 'active');
            const productSales = product.sales || 0;
            return (
            <motion.div
              key={productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: index * 0.05 }}
              onMouseEnter={() => setHoveredProduct(productId)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden hover:border-white/40 transition-all group cursor-pointer"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-800 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {/* Category Badge */}
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(product.category)}`}>
                    {product.category}
                  </span>
                </div>
                {/* Status Badge */}
                {product.stock === 0 && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-red-500/20 text-red-400">
                      Out of Stock
                    </span>
                  </div>
                )}
                {/* Hover Actions */}
                <AnimatePresence>
                  {hoveredProduct === productId && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3"
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditProduct(product);
                        }}
                        className="p-3 bg-white hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <FiEdit className="w-5 h-5 text-gray-800" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(productId, product.name);
                        }}
                        className="p-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-5 h-5 text-white" />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="text-base sm:text-lg font-bold text-white mb-1 truncate">{product.name}</h3>
                <p className="text-gray-400 text-xs sm:text-sm mb-3">{product.brand}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[#00A676] font-bold text-base sm:text-lg">KSh {product.price.toLocaleString()}</p>
                  <p className="text-gray-400 text-xs sm:text-sm">Stock: {product.stock || 0}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-gray-500">Sales: {productSales}</span>
                  <span className={`px-2 py-1 rounded-full ${getStatusColor(productStatus)}`}>
                    {productStatus}
                  </span>
                </div>
              </div>
            </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && productToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
            onClick={() => setIsDeleteModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-white mb-4">Delete Product</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete <span className="font-semibold text-white">"{productToDelete.name}"</span>? 
                This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteProduct}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Product
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProducts;

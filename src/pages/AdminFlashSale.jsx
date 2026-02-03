import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiClock, FiEdit, FiX, FiPlus, FiTrendingUp, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { adminApi } from '../utils/adminApi';
import toast from 'react-hot-toast';
import FlashSaleCountdown from '../components/FlashSaleCountdown';

const AdminFlashSale = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    isFlashSale: false,
    flashSalePrice: '',
    saleStartTime: '',
    saleEndTime: ''
  });

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

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      isFlashSale: product.isFlashSale || false,
      flashSalePrice: product.flashSalePrice || '',
      saleStartTime: product.saleStartTime ? new Date(product.saleStartTime).toISOString().slice(0, 16) : '',
      saleEndTime: product.saleEndTime ? new Date(product.saleEndTime).toISOString().slice(0, 16) : ''
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const productId = editingProduct._id || editingProduct.id;
      const updateData = {
        isFlashSale: formData.isFlashSale,
        flashSalePrice: formData.isFlashSale ? Number(formData.flashSalePrice) : null,
        saleStartTime: formData.isFlashSale ? formData.saleStartTime : null,
        saleEndTime: formData.isFlashSale ? formData.saleEndTime : null
      };

      await adminApi.updateProduct(productId, updateData);
      toast.success('Flash sale settings updated!');
      setShowModal(false);
      fetchProducts();
    } catch (error) {
      console.error('Error updating flash sale:', error);
      toast.error('Failed to update flash sale settings');
    }
  };

  const quickToggleFlashSale = async (product) => {
    try {
      const newFlashSaleStatus = !product.isFlashSale;
      const productId = product._id || product.id;
      
      await adminApi.updateProduct(productId, {
        isFlashSale: newFlashSaleStatus
      });
      
      toast.success(newFlashSaleStatus ? 'Flash sale activated!' : 'Flash sale ended');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to toggle flash sale');
    }
  };

  // Stats
  const activeFlashSales = products.filter(p => {
    if (!p.isFlashSale) return false;
    if (!p.saleEndTime) return false;
    const now = new Date();
    const endTime = new Date(p.saleEndTime);
    return now <= endTime;
  }).length;

  const totalDiscount = products
    .filter(p => p.isFlashSale && p.price && p.flashSalePrice)
    .reduce((sum, p) => sum + Math.round((1 - p.flashSalePrice / p.price) * 100), 0);

  const isProductOnSale = (product) => {
    if (!product.isFlashSale || !product.saleEndTime) return false;
    const now = new Date();
    const endTime = new Date(product.saleEndTime);
    return now <= endTime;
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00A676] mx-auto mb-4"></div>
            <p className="text-gray-400">Loading flash sales...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <FiZap className="w-6 h-6 text-white" />
            </div>
            Flash Sale Management
          </h1>
          <p className="text-gray-400">Manage flash sale prices and schedules for all products</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Active Flash Sales</p>
              <p className="text-3xl font-bold text-orange-400">{activeFlashSales}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <FiZap className="w-6 h-6 text-orange-400" />
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
              <p className="text-gray-400 text-sm">Products on Sale</p>
              <p className="text-3xl font-bold text-green-400">
                {products.filter(p => p.isFlashSale).length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
              <FiDollarSign className="w-6 h-6 text-green-400" />
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
              <p className="text-gray-400 text-sm">Total Discounts</p>
              <p className="text-3xl font-bold text-red-400">{totalDiscount}%</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
              <FiTrendingUp className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.map((product, index) => {
          const productId = product._id || product.id;
          const onSale = isProductOnSale(product);
          
          return (
            <motion.div
              key={productId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-white/10 backdrop-blur-xl rounded-xl border overflow-hidden transition-all ${
                onSale 
                  ? 'border-orange-500/50 shadow-lg shadow-orange-500/10' 
                  : 'border-white/20'
              }`}
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-800">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Flash Sale Badge */}
                {onSale && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white text-xs font-bold">
                    <FiZap className="w-3 h-3 animate-pulse" />
                    FLASH SALE
                  </div>
                )}
                
                {/* Countdown */}
                {onSale && product.saleEndTime && (
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur rounded-lg px-2 py-1">
                    <FlashSaleCountdown endTime={product.saleEndTime} />
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="p-4">
                <h3 className="text-white font-bold text-sm mb-1 truncate">{product.name}</h3>
                <p className="text-gray-400 text-xs mb-3">{product.brand}</p>
                
                {/* Pricing */}
                {product.isFlashSale ? (
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-red-400 font-bold text-lg">
                        KSh {product.flashSalePrice?.toLocaleString()}
                      </span>
                      <span className="text-gray-500 text-sm line-through">
                        KSh {product.price?.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs text-green-400 font-medium">
                      Save {Math.round((1 - product.flashSalePrice / product.price) * 100)}%
                    </div>
                  </div>
                ) : (
                  <p className="text-[#00A676] font-bold text-lg mb-3">
                    KSh {product.price?.toLocaleString()}
                  </p>
                )}

                {/* Sale Schedule */}
                {product.isFlashSale && product.saleEndTime && (
                  <div className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                    <FiCalendar className="w-3 h-3" />
                    Ends: {new Date(product.saleEndTime).toLocaleDateString()}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#00A676] hover:bg-[#008A5E] text-white text-sm rounded-lg transition-colors"
                  >
                    <FiEdit className="w-4 h-4" />
                    {product.isFlashSale ? 'Edit Sale' : 'Set Sale'}
                  </button>
                  <button
                    onClick={() => quickToggleFlashSale(product)}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      product.isFlashSale 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                    }`}
                  >
                    <FiZap className={`w-4 h-4 ${product.isFlashSale ? '' : 'animate-pulse'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-white/20"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FiZap className="w-6 h-6 text-orange-500" />
                Flash Sale Settings
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Product Info */}
            <div className="flex items-center gap-3 mb-6 p-3 bg-white/5 rounded-lg">
              <img
                src={editingProduct?.image}
                alt={editingProduct?.name}
                className="w-12 h-12 object-cover rounded-lg"
              />
              <div>
                <p className="text-white font-medium">{editingProduct?.name}</p>
                <p className="text-gray-400 text-sm">Regular Price: KSh {editingProduct?.price?.toLocaleString()}</p>
              </div>
            </div>

            {/* Toggle */}
            <div className="flex items-center justify-between mb-4 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl">
              <div className="flex items-center gap-2">
                <FiZap className={`w-5 h-5 ${formData.isFlashSale ? 'text-orange-400' : 'text-gray-400'}`} />
                <span className="text-white font-medium">Enable Flash Sale</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFlashSale}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFlashSale: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

            {/* Sale Inputs */}
            {formData.isFlashSale && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Flash Sale Price (KSh)
                  </label>
                  <input
                    type="number"
                    value={formData.flashSalePrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, flashSalePrice: e.target.value }))}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-white/5 border border-orange-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Start Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.saleStartTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, saleStartTime: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-white/5 border border-orange-500/50 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.saleEndTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, saleEndTime: e.target.value }))}
                      min={formData.saleStartTime}
                      className="w-full px-4 py-2.5 bg-white/5 border border-orange-500/50 rounded-lg text-white focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Preview */}
                {formData.flashSalePrice && (
                  <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-gray-400 text-xs">Original Price</p>
                      <p className="text-white font-medium">KSh {editingProduct?.price?.toLocaleString()}</p>
                    </div>
                    <FiClock className="text-gray-400" />
                    <div>
                      <p className="text-gray-400 text-xs">Flash Price</p>
                      <p className="text-orange-400 font-bold">KSh {Number(formData.flashSalePrice).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs">Discount</p>
                      <p className="text-green-400 font-bold">
                        -{Math.round((1 - Number(formData.flashSalePrice) / editingProduct?.price) * 100)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={formData.isFlashSale && (!formData.flashSalePrice || !formData.saleStartTime || !formData.saleEndTime)}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminFlashSale;

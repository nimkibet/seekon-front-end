import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FiZap, FiClock, FiEdit, FiX, FiPlus, FiTrendingUp, FiDollarSign, FiCalendar, FiSave } from 'react-icons/fi';
import { adminApi } from '../utils/adminApi';
import toast from 'react-hot-toast';
import FlashSaleCountdown from '../components/FlashSaleCountdown';
import { useSettings } from '../context/SettingsContext';

const AdminFlashSale = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Use SettingsContext for global flash sale state - eliminates triple-fetch
  const { flashSaleSettings, updateFlashSaleSettings } = useSettings();
  
  // Local state for editing (synced with context when saved)
  const [globalSettings, setGlobalSettings] = useState({
    isActive: false,
    endTime: ''
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [formData, setFormData] = useState({
    isFlashSale: false,
    flashSalePrice: '',
    saleStartTime: '',
    saleEndTime: ''
  });

  // DIRECT FIX: Bypass api.js and hit the URL directly
  useEffect(() => {
    const fetchFlashSaleSettings = async () => {
      try {
        const response = await axios.get('https://seekoon-backend-production.up.railway.app/api/settings/flash-sale');
        console.log("NUCLEAR FIX SUCCESS:", response.data);
        if (response.data) {
          setGlobalSettings({
            isActive: response.data.isActive,
            endTime: response.data.endTime || ''
          });
        }
      } catch (error) {
        console.error("Fix failed:", error);
      }
    };
    fetchFlashSaleSettings();
  }, []);

  // Sync local state with SettingsContext when it loads
  useEffect(() => {
    if (flashSaleSettings) {
      setGlobalSettings({
        isActive: flashSaleSettings.isActive || false,
        endTime: flashSaleSettings.endTime || ''
      });
    }
  }, [flashSaleSettings]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const productsData = await adminApi.getProducts();
      setProducts(productsData.products || productsData || []);
    } catch (error) {
      console.error('Error fetching products:', error);
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

      {/* Global Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FiZap className="text-orange-500" />
            Global Flash Sale Settings
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Toggle Switch */}
          <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg border border-white/10">
            <div>
              <h3 className="text-white font-medium mb-1">Flash Sale Status</h3>
              <p className="text-sm text-gray-400">Enable or disable flash sale globally</p>
            </div>
            <button
              onClick={() => {
                const newStatus = !globalSettings.isActive;
                setGlobalSettings(prev => ({ ...prev, isActive: newStatus }));
              }}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                globalSettings.isActive ? 'bg-[#00A676]' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  globalSettings.isActive ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* End Time Picker */}
          <div className="p-4 bg-black/20 rounded-lg border border-white/10">
            <h3 className="text-white font-medium mb-2">Flash Sale End Time</h3>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                value={globalSettings.endTime}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:border-[#00A676] focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end mt-4">
        <button
          onClick={handleSaveGlobalSettings}
          disabled={isSavingSettings}
          className="bg-[#00A676] hover:bg-[#008A5E] text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSavingSettings ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <FiSave className="w-4 h-4" />
          )}
          {isSavingSettings ? 'Saving...' : 'Save Changes'}
        </button>
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
                className="text-gray-400 hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Toggle */}
              <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                <span className="text-white">Enable Flash Sale</span>
                <button
                  onClick={() => setFormData({ ...formData, isFlashSale: !formData.isFlashSale })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.isFlashSale ? 'bg-[#00A676]' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.isFlashSale ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Price */}
              {formData.isFlashSale && (
                <>
                  <div>
                    <label className="block text-gray-400 text-sm mb-1">Flash Sale Price (KSh)</label>
                    <div className="relative">
                      <FiDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={formData.flashSalePrice}
                        onChange={(e) => setFormData({ ...formData, flashSalePrice: e.target.value })}
                        className="w-full bg-black/20 border border-gray-600 rounded-lg py-2 pl-10 pr-4 text-white focus:border-[#00A676] focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">Start Time</label>
                      <input
                        type="datetime-local"
                        value={formData.saleStartTime}
                        onChange={(e) => setFormData({ ...formData, saleStartTime: e.target.value })}
                        className="w-full bg-black/20 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#00A676] focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-400 text-sm mb-1">End Time</label>
                      <input
                        type="datetime-local"
                        value={formData.saleEndTime}
                        onChange={(e) => setFormData({ ...formData, saleEndTime: e.target.value })}
                        className="w-full bg-black/20 border border-gray-600 rounded-lg py-2 px-3 text-white focus:border-[#00A676] focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={handleSave}
                className="w-full mt-4 bg-[#00A676] hover:bg-[#008A5E] text-white font-bold py-3 rounded-xl transition-colors"
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

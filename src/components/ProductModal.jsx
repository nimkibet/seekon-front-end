import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiPlus, FiTrash2, FiZap, FiClock, FiArrowRight } from 'react-icons/fi';
import ImageUpload from './ImageUpload';
import toast from 'react-hot-toast';

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Sneakers',
    subCategory: '',
    brand: '',
    price: '',
    stock: '',
    size: '',
    color: '',
    description: '',
    image: null,
    images: [],
    isTrending: false,
    isFeatured: false,
    isNew: false,
    isBestSeller: false,
    // Flash Sale fields
    isFlashSale: false,
    flashSalePrice: '',
    saleStartTime: '',
    saleEndTime: ''
  });
  const [errors, setErrors] = useState({});
  const [currentImages, setCurrentImages] = useState([]);

  // Category hierarchy matching navbar structure
  const categoryData = {
    Sneakers: {
      subCategories: ['All Sneakers', 'Running', 'Basketball', 'Lifestyle', 'High Tops', 'Low Tops'],
      brands: ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance']
    },
    Apparel: {
      subCategories: ['All Clothing', 'T-Shirts', 'Hoodies', 'Jackets', 'Pants', 'Shorts'],
      brands: ['Nike', 'Adidas', 'Puma', 'Jordan', 'The North Face']
    },
    Boots: {
      subCategories: ['All Boots', 'Hiking', 'Casual', 'Winter'],
      brands: ['Timberland', 'Dr. Martens', 'UGG']
    },
    Men: {
      subCategories: ['All Men', 'Shoes', 'Clothing', 'Accessories'],
      brands: ['Nike', 'Adidas', 'Jordan', 'Puma']
    },
    Women: {
      subCategories: ['All Women', 'Shoes', 'Clothing', 'Accessories'],
      brands: ['Nike', 'Adidas', 'Jordan', 'Puma']
    },
    Kids: {
      subCategories: ['All Kids', 'Boys', 'Girls', 'Shoes', 'Clothing'],
      brands: ['Nike', 'Adidas', 'Jordan', 'Puma']
    },
    Accessories: {
      subCategories: ['All Accessories', 'Bags', 'Hats', 'Socks', 'Watches', 'Wallets', 'Sunglasses'],
      brands: ['Nike', 'Adidas', 'Puma', 'Jordan', 'Restyle']
    }
  };

  useEffect(() => {
    if (product) {
      console.log('[DEBUG] ProductModal - product data:', JSON.stringify(product, null, 2));
      
      // Safe date parsing with validation
      const parseDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) {
          console.warn('[DEBUG] Invalid date:', dateStr);
          return '';
        }
        return date.toISOString().slice(0, 16);
      };
      
      const imagesArray = product.images || (product.image ? [product.image] : []);
      setFormData({
        name: product.name || '',
        category: product.category || 'Sneakers',
        subCategory: product.subCategory || '',
        brand: product.brand || '',
        price: product.price || '',
        stock: product.stock || '',
        size: product.size || '',
        color: product.color || '',
        description: product.description || '',
        image: product.image || null,
        images: imagesArray,
        isTrending: product.isTrending || product.isFeatured || false,
        isFeatured: product.isFeatured || false,
        isNew: product.isNew || false,
        isBestSeller: product.isBestSeller || false,
        // Flash Sale fields - use safe date parsing
        isFlashSale: product.isFlashSale || false,
        flashSalePrice: product.flashSalePrice || '',
        saleStartTime: parseDate(product.saleStartTime),
        saleEndTime: parseDate(product.saleEndTime)
      });
      setCurrentImages(imagesArray);
    } else {
      setFormData({
        name: '',
        category: 'Sneakers',
        subCategory: '',
        brand: '',
        price: '',
        stock: '',
        size: '',
        color: '',
        description: '',
        image: null,
        images: [],
        isTrending: false,
        isFeatured: false,
        isNew: false,
        isBestSeller: false,
        // Flash Sale fields
        isFlashSale: false,
        flashSalePrice: '',
        saleStartTime: '',
        saleEndTime: ''
      });
      setCurrentImages([]);
    }

    // Scroll to top when modal opens
    if (isOpen) {
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleImageUpload = (imageInfo) => {
    console.log('[DEBUG] handleImageUpload called with:', imageInfo);
    
    // Handle multiple images (array) - ALWAYS APPEND to the end of the array
    if (Array.isArray(imageInfo)) {
      console.log('[DEBUG] Multiple images uploaded:', imageInfo.length);
      const newUrls = imageInfo.map(img => img.url || img);
      
      // APPEND to the existing list instead of overwriting specific indices
      setCurrentImages(prevImages => {
        const validImages = prevImages.filter(img => img !== null);
        return [...validImages, ...newUrls];
      });
      
      setFormData(prev => {
        const newImages = [...(prev.images || []), ...newUrls];
        return {
          ...prev,
          images: newImages,
          image: newImages[0] || prev.image
        };
      });
      return;
    }
    
    // Handle single image (backward compatibility) - also APPEND
    const imageUrl = imageInfo.url || imageInfo;
    console.log('[DEBUG] Single image uploaded:', imageUrl);
    
    setCurrentImages(prevImages => {
      const validImages = prevImages.filter(img => img !== null);
      return [...validImages, imageUrl];
    });
    setFormData(prev => ({
      ...prev,
      image: prev.image || imageUrl,
      images: [...(prev.images || []), imageUrl]
    }));
  };

  const handleAddImages = (imageInfos) => {
    console.log('[DEBUG] handleAddImages called with:', imageInfos);
    
    if (!Array.isArray(imageInfos)) {
      console.log('[DEBUG] Not an array, ignoring');
      return;
    }
    
    const newUrls = imageInfos.map(img => img.url || img);
    
    setCurrentImages(prev => {
      const newImages = [...prev, ...newUrls];
      console.log('[DEBUG] newImages after adding:', newImages);
      return newImages;
    });
    
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newUrls],
      image: prev.image || newUrls[0]
    }));
  };

  const handleImageRemove = (index = 0) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => {
      const newImages = (prev.images || []).filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: newImages[0] || null
      };
    });
  };

  const handleAddImageSlot = () => {
    setCurrentImages(prev => [...prev, null]);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.brand.trim()) newErrors.brand = 'Brand is required';
    if (!formData.price || formData.price <= 0) newErrors.price = 'Price must be a positive number';
    if (!formData.stock || formData.stock < 0) newErrors.stock = 'Stock must be a non-negative number';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fill in all required fields.');
      return;
    }
    try {
      // Get all valid images
      const validImages = currentImages.filter(img => img && typeof img === 'string');
      const imageUrl = validImages[0] || null;
      
      // Transform form data to match backend expectations
      const transformedData = {
        ...formData,
        // Convert price and stock to numbers
        price: Number(formData.price),
        stock: Number(formData.stock),
        // Convert sizes and colors from comma-separated strings to arrays
        sizes: formData.size ? formData.size.split(',').map(s => s.trim()).filter(s => s) : [],
        colors: formData.color ? formData.color.split(',').map(c => c.trim()).filter(c => c) : [],
        // Map isNew to newProduct for backend compatibility
        newProduct: formData.isNew,
        // Set both single image and images array for compatibility
        image: imageUrl,
        images: validImages.length > 0 ? validImages : [],
        // Flash Sale data - only include if flash sale is enabled
        isFlashSale: formData.isFlashSale,
        flashSalePrice: formData.isFlashSale ? Number(formData.flashSalePrice) : null,
        saleStartTime: formData.isFlashSale ? formData.saleStartTime : null,
        saleEndTime: formData.isFlashSale ? formData.saleEndTime : null
      };

      // Remove fields that shouldn't be sent to backend
      delete transformedData.size;
      delete transformedData.color;
      delete transformedData.isNew;

      await onSave(transformedData);
      toast.success(`Product ${product ? 'updated' : 'added'} successfully!`);
      onClose();
    } catch (error) {
      toast.error(error.message || `Failed to ${product ? 'update' : 'add'} product.`);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 sm:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "-100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/20 sticky top-0 bg-gray-800/95 backdrop-blur-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {product ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <FiX className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-300 text-sm font-medium">
                    Product Images {!currentImages.filter(img => img).length && <span className="text-red-500">*</span>}
                  </label>
                  <span className="text-xs text-gray-400">
                    {currentImages.filter(img => img).length} image(s)
                  </span>
                </div>
                
                {/* Multiple Image Upload Slots */}
                <div className="space-y-3">
                  {/* Main Image Upload - supports adding multiple images */}
                  {currentImages.length > 0 && (
                    <div className="relative">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <ImageUpload
                            onImageUpload={(imageInfo) => handleImageUpload(imageInfo)}
                            onAddImages={handleAddImages}
                            onImageRemove={() => handleImageRemove(0)}
                            initialImage={currentImages[0]}
                            label="Main Image (select multiple to add more)"
                            multiple={true}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Additional Image Slots */}
                  {currentImages.slice(1).map((img, idx) => (
                    <div key={idx + 1} className="relative">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1">
                          <ImageUpload
                            onImageUpload={(imageInfo) => handleImageUpload(imageInfo)}
                            onImageRemove={() => handleImageRemove(idx + 1)}
                            initialImage={img}
                            label={`Additional Image ${idx + 1}`}
                          />
                        </div>
                        {currentImages.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleImageRemove(idx + 1)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Remove image"
                          >
                            <FiTrash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {/* Add More Images Button */}
                  {currentImages.length < 5 && (
                    <button
                      type="button"
                      onClick={handleAddImageSlot}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-white/20 rounded-lg text-gray-400 hover:border-[#00A676] hover:text-[#00A676] transition-colors"
                    >
                      <FiPlus className="w-5 h-5" />
                      <span>Add Another Image</span>
                    </button>
                  )}
                </div>
                {errors.image && <p className="text-red-400 text-xs mt-1">{errors.image}</p>}
              </div>

              {/* Product Name */}
              <div>
                <label htmlFor="name" className="block text-gray-300 text-sm font-medium mb-2">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-gray-300 text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    handleChange(e);
                    // Reset subcategory when category changes
                    setFormData(prev => ({ ...prev, subCategory: '' }));
                  }}
                  className="w-full px-4 py-2.5 bg-white/10 border-2 border-[#00A676] rounded-lg text-white focus:outline-none focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/50 transition-all"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  {Object.keys(categoryData).map(cat => (
                    <option key={cat} value={cat} className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
              </div>

              {/* Subcategory (appears when category is selected) */}
              {categoryData[formData.category] && (
                <div>
                  <label htmlFor="subCategory" className="block text-gray-300 text-sm font-medium mb-2">
                    Subcategory
                  </label>
                  <select
                    id="subCategory"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/10 border-2 border-[#00A676] rounded-lg text-white focus:outline-none focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/50 transition-all"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <option value="" className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>Select Subcategory</option>
                    {categoryData[formData.category].subCategories.map(subCat => (
                      <option key={subCat} value={subCat} className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>
                        {subCat}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Brand */}
              <div>
                <label htmlFor="brand" className="block text-gray-300 text-sm font-medium mb-2">
                  Brand <span className="text-red-500">*</span>
                </label>
                {categoryData[formData.category] ? (
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/10 border-2 border-[#00A676] rounded-lg text-white focus:outline-none focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/50 transition-all"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <option value="" className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>Select Brand</option>
                    {categoryData[formData.category].brands.map(brand => (
                      <option key={brand} value={brand} className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>
                        {brand}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="Nike, Adidas, etc."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
                  />
                )}
                {errors.brand && <p className="text-red-400 text-xs mt-1">{errors.brand}</p>}
              </div>

              {/* Price & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="price" className="block text-gray-300 text-sm font-medium mb-2">
                    Price (KSh) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
                  />
                  {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label htmlFor="stock" className="block text-gray-300 text-sm font-medium mb-2">
                    Stock Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
                  />
                  {errors.stock && <p className="text-red-400 text-xs mt-1">{errors.stock}</p>}
                </div>
              </div>

              {/* Size & Color */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="size" className="block text-gray-300 text-sm font-medium mb-2">
                    Size
                  </label>
                  <input
                    type="text"
                    id="size"
                    name="size"
                    value={formData.size}
                    onChange={handleChange}
                    placeholder="S, M, L, XL or 42, 43, etc."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="color" className="block text-gray-300 text-sm font-medium mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="Black, White, etc."
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-gray-300 text-sm font-medium mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Enter product description..."
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors resize-none"
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Product Tags/Status */}
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">
                  Product Tags
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <label className="flex items-center space-x-3 p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isNew}
                      onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
                      className="w-4 h-4 text-[#00A676] border-gray-300 rounded focus:ring-[#00A676]"
                    />
                    <span className="text-white text-sm font-medium">🆕 New</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData(prev => ({ ...prev, isTrending: e.target.checked }))}
                      className="w-4 h-4 text-[#00A676] border-gray-300 rounded focus:ring-[#00A676]"
                    />
                    <span className="text-white text-sm font-medium">🔥 Trending</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="w-4 h-4 text-[#00A676] border-gray-300 rounded focus:ring-[#00A676]"
                    />
                    <span className="text-white text-sm font-medium">⭐ Featured</span>
                  </label>

                  <label className="flex items-center space-x-3 p-3 bg-white/5 border border-white/20 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData(prev => ({ ...prev, isBestSeller: e.target.checked }))}
                      className="w-4 h-4 text-[#00A676] border-gray-300 rounded focus:ring-[#00A676]"
                    />
                    <span className="text-white text-sm font-medium">🏆 Best Seller</span>
                  </label>
                </div>
              </div>

              {/* Flash Sale Settings */}
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      formData.isFlashSale 
                        ? 'bg-gradient-to-br from-orange-500 to-red-500 animate-pulse' 
                        : 'bg-gray-600'
                    }`}>
                      <FiZap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">Flash Sale</h3>
                      <p className="text-gray-400 text-xs">Set special pricing for a limited time</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFlashSale}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        isFlashSale: e.target.checked,
                        // Clear flash sale fields when turning off
                        flashSalePrice: e.target.checked ? prev.flashSalePrice : '',
                        saleStartTime: e.target.checked ? prev.saleStartTime : '',
                        saleEndTime: e.target.checked ? prev.saleEndTime : ''
                      }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                  </label>
                </div>

                {/* Flash Sale Inputs - Show when enabled */}
                <AnimatePresence>
                  {formData.isFlashSale && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-4"
                    >
                      {/* Flash Sale Price */}
                      <div>
                        <label htmlFor="flashSalePrice" className="block text-gray-300 text-sm font-medium mb-2">
                          Flash Sale Price (KSh) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          id="flashSalePrice"
                          name="flashSalePrice"
                          value={formData.flashSalePrice}
                          onChange={handleChange}
                          placeholder="0.00"
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2.5 bg-white/5 border border-orange-500/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
                        />
                        {formData.isFlashSale && !formData.flashSalePrice && (
                          <p className="text-orange-400 text-xs mt-1">Flash sale price is required</p>
                        )}
                      </div>

                      {/* Date/Time Scheduling */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="saleStartTime" className="block text-gray-300 text-sm font-medium mb-2">
                            <FiClock className="inline w-4 h-4 mr-1" />
                            Start Date & Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            id="saleStartTime"
                            name="saleStartTime"
                            value={formData.saleStartTime}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-white/5 border border-orange-500/50 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>
                        <div>
                          <label htmlFor="saleEndTime" className="block text-gray-300 text-sm font-medium mb-2">
                            <FiClock className="inline w-4 h-4 mr-1" />
                            End Date & Time <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="datetime-local"
                            id="saleEndTime"
                            name="saleEndTime"
                            value={formData.saleEndTime}
                            onChange={handleChange}
                            min={formData.saleStartTime}
                            className="w-full px-4 py-2.5 bg-white/5 border border-orange-500/50 rounded-lg text-white focus:outline-none focus:border-orange-500 transition-colors"
                          />
                        </div>
                      </div>

                      {/* Validation */}
                      {formData.saleStartTime && formData.saleEndTime && formData.saleEndTime < formData.saleStartTime && (
                        <p className="text-red-400 text-xs mt-1">End time must be after start time</p>
                      )}

                      {/* Price comparison preview */}
                      {formData.price && formData.flashSalePrice && (
                        <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                          <div>
                            <p className="text-gray-400 text-xs">Original Price</p>
                            <p className="text-white font-medium">KSh {Number(formData.price).toLocaleString()}</p>
                          </div>
                          <FiArrowRight className="text-gray-400" />
                          <div>
                            <p className="text-gray-400 text-xs">Flash Price</p>
                            <p className="text-orange-400 font-bold">KSh {Number(formData.flashSalePrice).toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs">Discount</p>
                            <p className="text-green-400 font-bold">
                              -{Math.round((1 - Number(formData.flashSalePrice) / Number(formData.price)) * 100)}%
                            </p>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-white/20">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#00A676] hover:bg-[#008A5E] text-white font-medium rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <FiSave className="w-4 h-4" />
                  <span>{product ? 'Update Product' : 'Save Product'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductModal;

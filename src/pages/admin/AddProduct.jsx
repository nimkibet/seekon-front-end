import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../utils/adminApi';

const API_URL = import.meta.env.VITE_API_URL || 'https://seekonbackend-production.up.railway.app';

const getAuthToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
};

// Helper function to convert color name to hex value
const getColorValue = (colorName) => {
  const colors = {
    black: '#000000',
    white: '#ffffff',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#a855f7',
    pink: '#ec4899',
    brown: '#78350f',
    gray: '#6b7280',
    grey: '#6b7280',
    navy: '#1e3a8a',
    beige: '#f5f5dc',
    cream: '#fffdd0',
    tan: '#d2b48c',
    maroon: '#800000',
    burgundy: '#800020',
    turquoise: '#40e0d0',
    teal: '#008080',
    coral: '#ff7f50',
    salmon: '#fa8072',
    olive: '#808000',
    lime: '#84cc16',
    mint: '#98fb98',
    lavender: '#e6e6fa',
    indigo: '#4b0082',
    gold: '#ffd700',
    silver: '#c0c0c0',
    charcoal: '#36454f',
  };
  
  const normalizedColor = colorName.toLowerCase().trim();
  return colors[normalizedColor] || colorName; // Return the name itself if not found (allows custom hex)
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Dynamic categories from API - hierarchical structure
  const [dbCategories, setDbCategories] = useState([]);
  
  // Fetch categories from database on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = getAuthToken();
        const res = await fetch(`${API_URL}/api/categories/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setDbCategories(data.categories);
      } catch (err) {
        console.log('Using hardcoded categories/brands');
      }
    };
    fetchCategories();
  }, []);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    subCategory: '',
    brand: '',
    stock: '',
    sizes: '',
    colors: '',
    isFeatured: false,
    isNew: false,
    isFlashSale: false,
    flashSalePrice: '',
    saleStartTime: '',
    saleEndTime: ''
  });

  // Image state - properly appending instead of overwriting
  const [images, setImages] = useState([]);
  const [imagesPreview, setImagesPreview] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const singleImageInputRef = useRef(null);
  const multipleImageInputRef = useRef(null);

  // Hardcoded fallback data (UPPERCASE to match DB)
  const hardcodedFallback = {
    SNEAKERS: { subCategories: ['ALL SNEAKERS', 'RUNNING', 'BASKETBALL', 'LIFESTYLE', 'HIGH TOPS', 'LOW TOPS', 'KIDS', 'MEN', 'WOMEN', 'SEEKON'], brands: ['NIKE', 'ADIDAS', 'JORDAN', 'PUMA', 'NEW BALANCE', 'CONVERSE', 'VANS', 'REEBOK', 'SEEKON'] },
    APPAREL: { subCategories: ['ALL CLOTHING', 'T-SHIRTS', 'SHIRTS', 'HOODIES', 'JACKETS', 'PANTS', 'SHORTS', 'KIDS', 'MEN', 'WOMEN', 'SEEKON'], brands: ['NIKE', 'ADIDAS', 'PUMA', 'JORDAN', 'THE NORTH FACE', 'ESSENTIALS', 'UNDER ARMOUR', 'SEEKON'] },
    ACCESSORIES: { subCategories: ['ALL ACCESSORIES', 'BAGS', 'HATS', 'SOCKS', 'WATCHES', 'WALLETS', 'SUNGLASSES', 'KIDS', 'MEN', 'WOMEN', 'SEEKON'], brands: ['NIKE', 'ADIDAS', 'PUMA', 'JORDAN', 'RESTYLE', 'CASIO', 'SEEKON'] }
  };

  // Get all categories for dropdown (DB + fallback)
  const allCategories = [...new Set([...dbCategories.map(c => c.name), ...Object.keys(hardcodedFallback)])];

  // Waterfall helpers
  const getSubCategoriesForCategory = (catName) => {
    const upperCat = catName.toUpperCase();
    const dbCat = dbCategories.find(c => c.name === upperCat);
    const fallbackCat = hardcodedFallback[upperCat];
    return [...new Set([...(dbCat?.subCategories || []), ...(fallbackCat?.subCategories || [])])];
  };
  const getBrandsForCategory = (catName) => {
    const upperCat = catName.toUpperCase();
    const dbCat = dbCategories.find(c => c.name === upperCat);
    const fallbackCat = hardcodedFallback[upperCat];
    return [...new Set([...(dbCat?.brands || []), ...(fallbackCat?.brands || [])])];
  };

  // Build categoryData combining db categories + hardcoded fallback
  const categoryData = { ...hardcodedFallback };
  dbCategories.forEach(cat => {
    if (!categoryData[cat.name]) {
      categoryData[cat.name] = {
        subCategories: cat.subCategories || [],
        brands: cat.brands || []
      };
    } else {
      // Add dynamic subcategories to existing category
      if (cat.subCategories) {
        cat.subCategories.forEach(sub => {
          if (!categoryData[cat.name].subCategories.includes(sub)) {
            categoryData[cat.name].subCategories.push(sub);
          }
        });
      }
      // Add dynamic brands to existing category
      if (cat.brands) {
        cat.brands.forEach(brand => {
          if (!categoryData[cat.name].brands.includes(brand)) {
            categoryData[cat.name].brands.push(brand);
          }
        });
      }
    }
  });

  // Get all unique brands from db + hardcoded fallback
  const allBrands = [...new Set([
    ...dbCategories.flatMap(c => c.brands || []),
    ...Object.values(hardcodedFallback).flatMap(c => c.brands)
  ])];

  // Handle input changes - with state reset for category changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Reset subCategory and brand when category changes
    if (name === 'category') {
      setFormData(prev => ({
        ...prev,
        category: value,
        subCategory: '',
        brand: ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  // Handle single image upload - uses separate input to allow adding one at a time
  const handleSingleImageUpload = () => {
    singleImageInputRef.current?.click();
  };

  // Handle multiple images upload
  const handleMultipleImageUpload = () => {
    multipleImageInputRef.current?.click();
  };

  // Handle single image selection
  const handleSingleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log('[DEBUG] Single image selected:', files[0].name);

    // Add single file to existing array
    setImages((prevImages) => [...prevImages, files[0]]);

    // Generate preview
    const newPreview = URL.createObjectURL(files[0]);
    setImagesPreview((prevPreviews) => [...prevPreviews, newPreview]);

    // Clear input and reset ref
    e.target.value = '';
    if (singleImageInputRef.current) {
      singleImageInputRef.current.value = '';
    }
  };

  // Handle multiple images selection
  const handleMultipleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    console.log('[DEBUG] Multiple images selected:', files.length);

    // Add all files to existing array
    setImages((prevImages) => [...prevImages, ...files]);

    // Generate previews
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagesPreview((prevPreviews) => [...prevPreviews, ...newPreviews]);

    // Clear input and reset ref
    e.target.value = '';
    if (multipleImageInputRef.current) {
      multipleImageInputRef.current.value = '';
    }
  };

  // Remove image at specific index
  const removeImage = (index) => {
    console.log('[DEBUG] Removing image at index:', index);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagesPreview(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Revoke the removed URL to prevent memory leaks
      URL.revokeObjectURL(prev[index]);
      return updated;
    });
  };

  // Upload images to server - supports single or multiple
  const uploadImageToServer = async (file) => {
    const token = getAuthToken();
    const formData = new FormData();
    
    // Append as 'images' field (array) to match backend multer config
    formData.append('images', file);

    const response = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    const data = await response.json();
    return data.data.url;
  };

  // Upload multiple images directly to the server (No Polling)
  const uploadMultipleImagesToServer = async (files) => {
    const token = getAuthToken();
    const finalUrls = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('images', file); // Multer catch-all will grab this

      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
        body: formData,
      });

      if (!uploadRes.ok) throw new Error('Failed to upload image');
      const uploadData = await uploadRes.json();
      
      // Extract the URL from the response data array
      if (uploadData.data && Array.isArray(uploadData.data) && uploadData.data.length > 0) {
        finalUrls.push(uploadData.data[0].url);
      } else if (uploadData.data && uploadData.data.url) {
        finalUrls.push(uploadData.data.url);
      }
    }

    return finalUrls;
  };

  // Handle form submission - Non-blocking with background processing
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Validation
    if (!formData.name.trim()) return toast.error('Product name is required');
    if (!formData.category) return toast.error('Category is required');
    if (!formData.brand.trim()) return toast.error('Brand is required');
    if (!formData.price || formData.price <= 0) return toast.error('Valid price is required');
    if (images.length === 0) return toast.error('At least one product image is required');

    // 2. CAPTURE STATE IN CLOSURE (Crucial for background processing)
    // We must copy the exact state right now before resetting the form
    const filesToUpload = [...images];
    const currentFormData = { ...formData };
    const productName = currentFormData.name;
    
    // 3. Start a persistent loading toast
    const toastId = toast.loading(`Uploading "${productName}" in background...`, { duration: 8000 });
    
    // 4. Immediately free up the UI for the next product
    resetForm();
    
    // 5. Fire and Forget Background Task (Do not await this directly in the main thread)
    (async () => {
      try {
        // Upload all images at once using the new multiple upload function
        const imageUrls = await uploadMultipleImagesToServer(filesToUpload);

        const productData = {
          name: currentFormData.name,
          description: currentFormData.description,
          price: Number(currentFormData.price),
          originalPrice: currentFormData.originalPrice ? Number(currentFormData.originalPrice) : Number(currentFormData.price),
          discount: currentFormData.originalPrice ? Math.round((1 - Number(currentFormData.price) / Number(currentFormData.originalPrice)) * 100) : 0,
          image: imageUrls[0],
          images: imageUrls,
          category: currentFormData.category,
          subCategory: currentFormData.subCategory,
          brand: currentFormData.brand,
          stock: Number(currentFormData.stock) || 0,
          sizes: currentFormData.sizes ? currentFormData.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
          colors: currentFormData.colors ? currentFormData.colors.split(',').map(c => c.trim()).filter(c => c) : [],
          isFeatured: currentFormData.isFeatured,
          isNew: currentFormData.isNew,
          newProduct: currentFormData.isNew,
          isFlashSale: currentFormData.isFlashSale,
          flashSalePrice: currentFormData.isFlashSale && currentFormData.flashSalePrice ? Number(currentFormData.flashSalePrice) : null,
          saleStartTime: currentFormData.isFlashSale && currentFormData.saleStartTime ? currentFormData.saleStartTime : null,
          saleEndTime: currentFormData.isFlashSale && currentFormData.saleEndTime ? currentFormData.saleEndTime : null
        };

        await adminApi.createProduct(productData);
        
        // Update the specific toast to success
        toast.success(`Product "${productName}" successfully added!`, { id: toastId, duration: 4000 });
      } catch (error) {
        console.error('[DEBUG] Error creating product:', error);
        // Update the specific toast to error
        toast.error(`Failed to add "${productName}": ${error.message}`, { id: toastId, duration: 6000 });
      }
    })(); // Execute immediately
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      originalPrice: '',
      category: '',
      subCategory: '',
      brand: '',
      stock: '',
      sizes: '',
      colors: '',
      isFeatured: false,
      isNew: false,
      isFlashSale: false,
      flashSalePrice: '',
      saleStartTime: '',
      saleEndTime: ''
    });
    setImages([]);
    setImagesPreview([]);
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      imagesPreview.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          to="/admin/products"
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <FiArrowLeft className="w-5 h-5 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Add New Product</h1>
          <p className="text-gray-400 text-sm">Fill in the product details below</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Product Images</h2>
          
          <div className="mb-4">
            <p className="text-gray-400 text-sm mb-2">
              Click the buttons below to add images one at a time or select multiple at once. All images will be stacked.
            </p>
          </div>

          {/* Image Previews */}
          {imagesPreview.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-4">
              {imagesPreview.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#00A676] text-white text-xs px-2 py-0.5 rounded">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Buttons */}
          <div className="flex gap-4 mb-4">
            {/* Single Image Upload Button */}
            <button
              type="button"
              onClick={handleSingleImageUpload}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-300 hover:border-[#00A676] hover:text-[#00A676] transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add Single Image</span>
            </button>

            {/* Multiple Images Upload Button */}
            <button
              type="button"
              onClick={handleMultipleImageUpload}
              disabled={isUploading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-gray-300 hover:border-[#00A676] hover:text-[#00A676] transition-colors"
            >
              <FiUpload className="w-5 h-5" />
              <span>Add Multiple Images</span>
            </button>
          </div>

          {/* Hidden Inputs */}
          <input
            ref={singleImageInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleSingleImageChange}
            className="hidden"
            disabled={isUploading}
          />
          <input
            ref={multipleImageInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            multiple
            onChange={handleMultipleImageChange}
            className="hidden"
            disabled={isUploading}
          />

          {isUploading && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-[#00A676]">
                <FiPlus className="w-5 h-5 animate-spin" />
                <span>Processing images...</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Basic Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            {/* Product Name */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows={4}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors resize-none"
              />
            </div>

            {/* Category & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00A676] transition-colors"
                  style={{ 
                    color: 'white',
                    backgroundColor: '#1f2937'
                  }}
                >
                  <option value="" disabled style={{ backgroundColor: '#1f2937', color: 'white' }}>Select a Category</option>
                  {Object.keys(categoryData).map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                      {cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Brand <span className="text-red-500">*</span>
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00A676] transition-colors"
                  style={{ 
                    color: 'white',
                    backgroundColor: '#1f2937'
                  }}
                >
                  <option value="" disabled style={{ backgroundColor: '#1f2937', color: 'white' }}>Select Brand</option>
                  {categoryData[formData.category?.toUpperCase()]?.brands?.map(brand => (
                    <option key={brand} value={brand} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SubCategory */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Subcategory
              </label>
              <select
                name="subCategory"
                value={formData.subCategory}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:border-[#00A676] transition-colors"
                style={{ 
                  color: 'white',
                  backgroundColor: '#1f2937'
                }}
              >
                <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Select Subcategory</option>
                {categoryData[formData.category?.toUpperCase()]?.subCategories?.map(subCat => (
                  <option key={subCat} value={subCat} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                    {subCat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Pricing & Stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Pricing & Stock</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Price (KSh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
              />
            </div>

            {/* Original Price */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Original Price (KSh)
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Stock Quantity
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
              />
            </div>

            {/* Sizes */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Sizes (comma separated)
              </label>
              <input
                type="text"
                name="sizes"
                value={formData.sizes}
                onChange={handleChange}
                placeholder="7, 8, 9, 10, 11"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
              />
            </div>

            {/* Colors */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Colors (comma separated)
              </label>
              <input
                type="text"
                name="colors"
                value={formData.colors}
                onChange={handleChange}
                placeholder="Black, White, Red"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
              />
              {/* Color Preview */}
              {formData.colors && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.colors.split(',').map((color, index) => {
                    const colorName = color.trim();
                    if (!colorName) return null;
                    return (
                      <div key={index} className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full">
                        <div 
                          className="w-4 h-4 rounded-full border border-white/30"
                          style={{ backgroundColor: getColorValue(colorName) }}
                        />
                        <span className="text-white text-sm capitalize">{colorName}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Options</h2>
          
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00A676] focus:ring-[#00A676]"
              />
              <span className="text-gray-300 text-sm">Featured Product</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isNew"
                checked={formData.isNew}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00A676] focus:ring-[#00A676]"
              />
              <span className="text-gray-300 text-sm">New Arrival</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFlashSale"
                checked={formData.isFlashSale}
                onChange={handleChange}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#00A676] focus:ring-[#00A676]"
              />
              <span className="text-gray-300 text-sm">Flash Sale</span>
            </label>
          </div>

          {/* Flash Sale Fields */}
          {formData.isFlashSale && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Flash Sale Price (KSh)
                </label>
                <input
                  type="number"
                  name="flashSalePrice"
                  value={formData.flashSalePrice}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Sale Start Time
                </label>
                <input
                  type="datetime-local"
                  name="saleStartTime"
                  value={formData.saleStartTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Sale End Time
                </label>
                <input
                  type="datetime-local"
                  name="saleEndTime"
                  value={formData.saleEndTime}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
                />
              </div>
            </div>
          )}
        </motion.div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!formData.name.trim() || !formData.category || !formData.brand.trim() || !formData.price || images.length === 0}
            className="px-6 py-3 bg-[#00A676] hover:bg-[#008A5E] disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FiPlus className="w-5 h-5" />
            <span>Add Product</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

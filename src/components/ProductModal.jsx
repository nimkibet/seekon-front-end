import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiSave, FiPlus, FiTrash2, FiZap, FiClock, FiArrowRight } from 'react-icons/fi';
import ImageUpload from './ImageUpload';
import toast from 'react-hot-toast';
import { adminApi } from '../utils/adminApi';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.seekonapparelglobal.com';

const getAuthToken = () => {
  return localStorage.getItem('adminToken') || 
         sessionStorage.getItem('adminToken') || 
         localStorage.getItem('token') || 
         sessionStorage.getItem('token');
};

const mapProductToFormData = (product) => {
  const parseDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 16);
  };

  const toList = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (value == null || value === '') return [];
    return [String(value)];
  };

  const sizes = toList(product.sizes?.length ? product.sizes : product.size);
  const colors = toList(product.colors?.length ? product.colors : product.color);
  const imagesArray = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];

  return {
    name: product.name || '',
    category: product.category || 'Sneakers',
    subCategory: product.subCategory || '',
    brand: product.brand || '',
    price: product.price != null ? String(product.price) : '',
    stock: product.stock != null ? String(product.stock) : '',
    size: sizes.join(', '),
    color: colors.join(', '),
    description: product.description || '',
    image: product.image || null,
    images: imagesArray,
    isTrending: product.isTrending || product.isFeatured || false,
    isFeatured: product.isFeatured || false,
    isNew: product.isNew || false,
    isBestSeller: product.isBestSeller || false,
    isFlashSale: product.isFlashSale || false,
    flashSalePrice: product.flashSalePrice != null ? String(product.flashSalePrice) : '',
    saleStartTime: parseDate(product.saleStartTime),
    saleEndTime: parseDate(product.saleEndTime)
  };
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
  return colors[normalizedColor] || colorName;
};

const emptyFormData = {
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
  isFlashSale: false,
  flashSalePrice: '',
  saleStartTime: '',
  saleEndTime: ''
};

const ProductModal = ({ isOpen, onClose, product, onSave }) => {
  // Dynamic categories from API - hierarchical structure
  const [dbCategories, setDbCategories] = useState([]);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
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

  // Quick select and generator states for sizes/colors
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [rangeStep, setRangeStep] = useState('1');

  // Sync range generator inputs when modal opens/closes or product changes
  useEffect(() => {
    if (!isOpen) {
      setRangeStart('');
      setRangeEnd('');
      setRangeStep('1');
    }
  }, [isOpen]);

  const generateSizeRange = () => {
    const start = parseFloat(rangeStart);
    const end = parseFloat(rangeEnd);
    const step = parseFloat(rangeStep);

    if (isNaN(start) || isNaN(end) || isNaN(step) || step <= 0) {
      toast.error('Please enter valid numeric start, end, and step values');
      return;
    }

    if (start > end) {
      toast.error('Start size must be less than or equal to End size');
      return;
    }

    const generated = [];
    for (let current = start; current <= end; current += step) {
      const rounded = Math.round(current * 10) / 10;
      generated.push(rounded);
    }

    const existing = formData.size ? formData.size.split(',').map(s => s.trim()).filter(Boolean) : [];
    const combined = [...new Set([...existing, ...generated.map(String)])];
    
    setFormData(prev => ({
      ...prev,
      size: combined.join(', ')
    }));
    toast.success(`Generated sizes: ${generated.join(', ')}`);
  };

  const handleToggleSizeChip = (size) => {
    const currentSizes = formData.size
      ? formData.size.split(',').map(s => s.trim()).filter(Boolean)
      : [];
    
    let updatedSizes;
    if (currentSizes.includes(size)) {
      updatedSizes = currentSizes.filter(s => s !== size);
    } else {
      updatedSizes = [...currentSizes, size];
    }
    
    setFormData(prev => ({
      ...prev,
      size: updatedSizes.join(', ')
    }));
  };

  const handleToggleColorChip = (color) => {
    const currentColors = formData.color
      ? formData.color.split(',').map(c => c.trim()).filter(Boolean)
      : [];
    
    const colorLower = color.toLowerCase();
    const existingIndex = currentColors.findIndex(c => c.toLowerCase() === colorLower);
    
    let updatedColors;
    if (existingIndex > -1) {
      updatedColors = currentColors.filter((_, idx) => idx !== existingIndex);
    } else {
      updatedColors = [...currentColors, color];
    }
    
    setFormData(prev => ({
      ...prev,
      color: updatedColors.join(', ')
    }));
  };

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

  // Hardcoded fallback data (UPPERCASE to match DB)
  const hardcodedFallback = {
    SNEKERS: { subCategories: ['ALL SNEAKERS', 'RUNNING', 'BASKETBALL', 'LIFESTYLE', 'HIGH TOPS', 'LOW TOPS'], brands: ['NIKE', 'ADIDAS', 'JORDAN', 'PUMA', 'NEW BALANCE', 'CONVERSE', 'VANS', 'REEBOK'] },
    APPAREL: { subCategories: ['ALL CLOTHING', 'T-SHIRTS', 'SHIRTS', 'HOODIES', 'JACKETS', 'PANTS', 'SHORTS'], brands: ['NIKE', 'ADIDAS', 'PUMA', 'JORDAN', 'THE NORTH FACE', 'ESSENTIALS', 'UNDER ARMOUR'] },
    BOOTS: { subCategories: ['ALL BOOTS', 'HIKING', 'CASUAL', 'WINTER'], brands: ['TIMBERLAND', 'DR. MARTENS', 'UGG', 'COLUMBIA', 'SOREL'] },
    MEN: { subCategories: ['ALL MEN', 'SHOES', 'CLOTHING', 'ACCESSORIES'], brands: ['NIKE', 'ADIDAS', 'JORDAN', 'PUMA', 'NEW BALANCE'] },
    WOMEN: { subCategories: ['ALL WOMEN', 'SHOES', 'CLOTHING', 'ACCESSORIES'], brands: ['NIKE', 'ADIDAS', 'JORDAN', 'PUMA', 'NEW BALANCE'] },
    KIDS: { subCategories: ['ALL KIDS', 'BOYS', 'GIRLS', 'SHOES', 'CLOTHING'], brands: ['NIKE', 'ADIDAS', 'JORDAN', 'PUMA'] },
    ACCESSORIES: { subCategories: ['ALL ACCESSORIES', 'BAGS', 'HATS', 'SOCKS', 'WATCHES', 'WALLETS', 'SUNGLASSES'], brands: ['NIKE', 'ADIDAS', 'PUMA', 'JORDAN', 'RESTYLE', 'CASIO'] }
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

  useEffect(() => {
    if (!isOpen) return;

    if (product) {
      const mapped = mapProductToFormData(product);
      setFormData(mapped);
      setCurrentImages(mapped.images);
    } else {
      setFormData(emptyFormData);
      setCurrentImages([]);
    }
    setErrors({});

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }, [product, isOpen]);

  const handleGenerateDescription = async () => {
    if (!formData.name || !formData.name.trim()) {
      toast.error("Please enter a product name first");
      return;
    }
    
    setIsGeneratingDescription(true);
    const toastId = toast.loading("Generating description...");
    try {
      const response = await adminApi.generateProductDescription(formData.name);
      if (response.success) {
        setFormData(prev => ({
          ...prev,
          description: response.description
        }));
        toast.success("Description generated successfully!", { id: toastId });
      } else {
        toast.error(response.message || "Failed to generate description", { id: toastId });
      }
    } catch (error) {
      console.error("Error in generateDescription:", error);
      toast.error(error.message || "Failed to generate description", { id: toastId });
    } finally {
      setIsGeneratingDescription(false);
    }
  };

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
              {categoryData[formData.category?.toUpperCase()] && (
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
                    {categoryData[formData.category?.toUpperCase()]?.subCategories?.map(subCat => (
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
                {categoryData[formData.category?.toUpperCase()] ? (
                  <select
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white/10 border-2 border-[#00A676] rounded-lg text-white focus:outline-none focus:border-[#00A676] focus:ring-2 focus:ring-[#00A676]/50 transition-all"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                  >
                    <option value="" className="bg-gray-800 text-white" style={{ backgroundColor: '#1f2937', color: 'white' }}>Select Brand</option>
                    {categoryData[formData.category?.toUpperCase()]?.brands?.map(brand => (
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

              {/* Sizes and Colors Admin Improvements */}
              <div className="space-y-4">
                {/* Sizes */}
                <div className="space-y-2">
                  <label htmlFor="size" className="block text-gray-300 text-sm font-medium mb-1">
                    Sizes (comma separated)
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

                  {/* Sizes Quick Chips */}
                  <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="block text-xs font-semibold text-gray-400">Quick Sizes (Click to toggle)</span>
                    
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-gray-400 w-16">Clothing:</span>
                      {['S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => {
                        const isSelected = formData.size.split(',').map(s => s.trim()).includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleToggleSizeChip(size)}
                            className={`px-2 py-0.5 rounded text-xs transition-all ${
                              isSelected
                                ? 'bg-[#00A676] text-white border border-[#00A676]'
                                : 'bg-white/5 text-gray-300 border border-white/10 hover:border-white/30'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-gray-400 w-16">Footwear:</span>
                      {['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'].map((size) => {
                        const isSelected = formData.size.split(',').map(s => s.trim()).includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleToggleSizeChip(size)}
                            className={`px-2 py-0.5 rounded text-xs transition-all ${
                              isSelected
                                ? 'bg-[#00A676] text-white border border-[#00A676]'
                                : 'bg-white/5 text-gray-300 border border-white/10 hover:border-white/30'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] text-gray-400 w-16">Other:</span>
                      {['One Size'].map((size) => {
                        const isSelected = formData.size.split(',').map(s => s.trim()).includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => handleToggleSizeChip(size)}
                            className={`px-2 py-0.5 rounded text-xs transition-all ${
                              isSelected
                                ? 'bg-[#00A676] text-white border border-[#00A676]'
                                : 'bg-white/5 text-gray-300 border border-white/10 hover:border-white/30'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>

                    {/* Size Range Generator */}
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <span className="block text-xs font-semibold text-gray-300 mb-2">⚡ Generate Size Range</span>
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="number"
                          placeholder="Start"
                          value={rangeStart}
                          onChange={(e) => setRangeStart(e.target.value)}
                          className="w-20 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-[#00A676]"
                        />
                        <input
                          type="number"
                          placeholder="End"
                          value={rangeEnd}
                          onChange={(e) => setRangeEnd(e.target.value)}
                          className="w-20 px-2 py-1 text-xs bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-[#00A676]"
                        />
                        <select
                          value={rangeStep}
                          onChange={(e) => setRangeStep(e.target.value)}
                          className="px-1.5 py-1 text-xs bg-black border border-white/10 rounded text-white focus:outline-none focus:border-[#00A676]"
                        >
                          <option value="1">Step 1</option>
                          <option value="0.5">Step 0.5</option>
                        </select>
                        <button
                          type="button"
                          onClick={generateSizeRange}
                          className="px-3 py-1 bg-[#00A676] text-white text-xs font-medium rounded hover:bg-[#008f5f] transition-all"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-2">
                  <label htmlFor="color" className="block text-gray-300 text-sm font-medium mb-1">
                    Colors (comma separated)
                  </label>
                  <input
                    type="text"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    placeholder="Black, White, Red"
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
                  />

                  {/* Colors Quick Chips */}
                  <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="block text-xs font-semibold text-gray-400 mb-2">Quick Colors (Click to toggle)</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Grey', 'Pink', 'Navy', 'Beige', 'Brown'].map((color) => {
                        const isSelected = formData.color.split(',').map(c => c.trim().toLowerCase()).includes(color.toLowerCase());
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleToggleColorChip(color)}
                            className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs transition-all ${
                              isSelected
                                ? 'bg-[#00A676] text-white border border-[#00A676]'
                                : 'bg-white/5 text-gray-300 border border-white/10 hover:border-white/30'
                            }`}
                          >
                            <span 
                              className="w-2.5 h-2.5 rounded-full border border-white/20"
                              style={{ backgroundColor: getColorValue(color) }}
                            />
                            <span>{color}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="description" className="block text-gray-300 text-sm font-medium">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateDescription}
                    disabled={isGeneratingDescription}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-zinc-700 hover:to-zinc-800 border border-white/10 rounded-lg text-xs font-semibold text-white shadow-sm hover:shadow transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isGeneratingDescription ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-yellow-400">✨</span>
                        <span>Auto-Generate</span>
                      </>
                    )}
                  </button>
                </div>
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


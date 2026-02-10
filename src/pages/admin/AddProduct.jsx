import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiUpload, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../utils/adminApi';

const API_URL = import.meta.env.VITE_API_URL || 'https://seekoon-backend-production.up.railway.app';

const getAuthToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
};

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: 'Sneakers',
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

  // Category data
  const categoryData = {
    Sneakers: {
      subCategories: ['All Sneakers', 'Running', 'Basketball', 'Lifestyle', 'High Tops', 'Low Tops'],
      brands: ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance', 'Converse', 'Vans', 'Reebok']
    },
    Apparel: {
      subCategories: ['All Clothing', 'T-Shirts', 'Hoodies', 'Jackets', 'Pants', 'Shorts'],
      brands: ['Nike', 'Adidas', 'Puma', 'Jordan', 'The North Face', 'Essentials', 'Under Armour']
    },
    Boots: {
      subCategories: ['All Boots', 'Hiking', 'Casual', 'Winter'],
      brands: ['Timberland', 'Dr. Martens', 'UGG', 'Columbia', 'Sorel']
    },
    Men: {
      subCategories: ['All Men', 'Shoes', 'Clothing', 'Accessories'],
      brands: ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance']
    },
    Women: {
      subCategories: ['All Women', 'Shoes', 'Clothing', 'Accessories'],
      brands: ['Nike', 'Adidas', 'Jordan', 'Puma', 'New Balance']
    },
    Kids: {
      subCategories: ['All Kids', 'Boys', 'Girls', 'Shoes', 'Clothing'],
      brands: ['Nike', 'Adidas', 'Jordan', 'Puma']
    },
    Accessories: {
      subCategories: ['All Accessories', 'Bags', 'Hats', 'Socks', 'Watches', 'Wallets', 'Sunglasses'],
      brands: ['Nike', 'Adidas', 'Puma', 'Jordan', 'Restyle', 'Casio']
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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

  // Upload image to server
  const uploadImageToServer = async (file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (!formData.category) {
      toast.error('Category is required');
      return;
    }
    if (!formData.brand.trim()) {
      toast.error('Brand is required');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error('Valid price is required');
      return;
    }
    if (images.length === 0) {
      toast.error('At least one product image is required');
      return;
    }

    setIsLoading(true);
    setIsUploading(true);

    try {
      // Upload all images first
      console.log('[DEBUG] Uploading', images.length, 'images...');
      const imageUrls = [];
      
      for (let i = 0; i < images.length; i++) {
        console.log(`[DEBUG] Uploading image ${i + 1}/${images.length}`);
        const url = await uploadImageToServer(images[i]);
        imageUrls.push(url);
      }

      console.log('[DEBUG] All images uploaded:', imageUrls.length);

      // Prepare product data
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : Number(formData.price),
        discount: formData.originalPrice ? Math.round((1 - Number(formData.price) / Number(formData.originalPrice)) * 100) : 0,
        image: imageUrls[0],
        images: imageUrls,
        category: formData.category,
        subCategory: formData.subCategory,
        brand: formData.brand,
        stock: Number(formData.stock) || 0,
        sizes: formData.sizes ? formData.sizes.split(',').map(s => s.trim()).filter(s => s) : [],
        colors: formData.colors ? formData.colors.split(',').map(c => c.trim()).filter(c => c) : [],
        isFeatured: formData.isFeatured,
        isNew: formData.isNew,
        newProduct: formData.isNew,
        // Flash sale fields
        isFlashSale: formData.isFlashSale,
        flashSalePrice: formData.isFlashSale && formData.flashSalePrice ? Number(formData.flashSalePrice) : null,
        saleStartTime: formData.isFlashSale && formData.saleStartTime ? formData.saleStartTime : null,
        saleEndTime: formData.isFlashSale && formData.saleEndTime ? formData.saleEndTime : null
      };

      console.log('[DEBUG] Submitting product data:', productData);

      // Create product
      const response = await adminApi.createProduct(productData);
      console.log('[DEBUG] Product created:', response);

      toast.success('Product added successfully!');
      navigate('/admin/products');
    } catch (error) {
      console.error('[DEBUG] Error creating product:', error);
      toast.error(error.message || 'Failed to add product');
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
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
                  {Object.keys(categoryData).map(cat => (
                    <option key={cat} value={cat} style={{ backgroundColor: '#1f2937', color: 'white' }}>
                      {cat}
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
                  <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Select Brand</option>
                  {categoryData[formData.category]?.brands.map(brand => (
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
                {categoryData[formData.category]?.subCategories.map(subCat => (
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
            disabled={isLoading || isUploading}
            className="px-6 py-3 bg-[#00A676] hover:bg-[#008A5E] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading || isUploading ? (
              <>
                <FiPlus className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <FiPlus className="w-5 h-5" />
                <span>Add Product</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

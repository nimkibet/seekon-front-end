import React, { useState } from 'react';
import { FiUpload, FiX, FiImage, FiLoader } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('adminToken') || localStorage.getItem('token');
};

const ImageUpload = ({ 
  onImageUpload, 
  onImageRemove, 
  initialImage = null,
  label = 'Product Image'
}) => {
  const [preview, setPreview] = useState(initialImage);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [inputType, setInputType] = useState('file'); // 'file' or 'url'
  const [urlInput, setUrlInput] = useState('');

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, WebP, or GIF)');
      return false;
    }

    const maxSize = 5; // MB
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size must be less than ${maxSize}MB`);
      return false;
    }

    setError('');
    return true;
  };

  const handleUrlChange = (e) => {
    const url = e.target.value;
    setUrlInput(url);
    setPreview(url);
    if (onImageUpload) {
      onImageUpload(url);
    }
  };

  const uploadFileToServer = async (file) => {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    return response.json();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);

    try {
      // Show preview immediately using local URL
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      // Upload to server/Cloudinary
      const result = await uploadFileToServer(file);

      if (result.success && result.data) {
        const imageData = {
          url: result.data.url,
          publicId: result.data.publicId
        };

        if (onImageUpload) {
          onImageUpload(imageData);
        }

        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
      setError('Upload failed: ' + error.message);
      // Clear preview on error
      setPreview(null);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setUrlInput('');
    if (onImageRemove) {
      onImageRemove();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    setIsUploading(true);

    try {
      // Show preview immediately using local URL
      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      // Upload to server/Cloudinary
      const result = await uploadFileToServer(file);

      if (result.success && result.data) {
        const imageData = {
          url: result.data.url,
          publicId: result.data.publicId
        };

        if (onImageUpload) {
          onImageUpload(imageData);
        }

        toast.success('Image uploaded successfully!');
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
      setError('Upload failed: ' + error.message);
      // Clear preview on error
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <label className="block text-sm font-medium text-gray-300">
          {label} <span className="text-red-500">*</span>
        </label>
      )}

      {/* Input Type Toggle */}
      <div className="flex space-x-4 mb-2">
        <button
          type="button"
          onClick={() => setInputType('file')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            inputType === 'file' 
              ? 'bg-[#00A676] text-white' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Upload File
        </button>
        <button
          type="button"
          onClick={() => setInputType('url')}
          className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
            inputType === 'url' 
              ? 'bg-[#00A676] text-white' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          Image URL
        </button>
      </div>

      {inputType === 'url' ? (
        <div className="space-y-4">
          <input
            type="url"
            value={urlInput}
            onChange={handleUrlChange}
            placeholder="Enter image URL (https://...)"
            className="w-full px-4 py-2.5 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-[#00A676] transition-colors"
          />
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 sm:h-48 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Upload Area */
        <div
          className="relative border-2 border-dashed border-white/20 rounded-xl p-4 sm:p-6 hover:border-[#00A676] transition-colors cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload-input"
            disabled={isUploading}
          />

          {!preview && !isUploading && (
            <label
              htmlFor="image-upload-input"
              className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 cursor-pointer"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#00A676]/20 flex items-center justify-center">
                <FiImage className="w-6 h-6 sm:w-8 sm:h-8 text-[#00A676]" />
              </div>
              <div className="text-center">
                <p className="text-white font-medium text-sm sm:text-base mb-1">Click to upload</p>
                <p className="text-gray-400 text-xs sm:text-sm">or drag and drop</p>
                <p className="text-gray-500 text-xs mt-2">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </label>
          )}

          {isUploading && (
            <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 py-6 sm:py-8">
              <FiLoader className="w-10 h-10 sm:w-12 sm:h-12 text-[#00A676] animate-spin" />
              <p className="text-white font-medium text-sm sm:text-base">Uploading image...</p>
              <p className="text-gray-400 text-xs sm:text-sm">Please wait</p>
            </div>
          )}

          <AnimatePresence>
            {preview && !isUploading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative"
              >
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 sm:h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove();
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors shadow-lg"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-xs sm:text-sm mt-2 flex items-center">
          <FiX className="mr-1" /> {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;

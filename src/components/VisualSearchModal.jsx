import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiImage, FiX, FiSearch } from 'react-icons/fi';

const VisualSearchModal = ({ isOpen, onClose, onSearch }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSearch = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    // Simulate AI visual search
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock results - in real implementation, this would call an AI service
    const mockResults = [
      {
        id: 1,
        name: 'Nike Air Max 270',
        brand: 'Nike',
        price: 150,
        similarity: 95,
        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop'
      },
      {
        id: 2,
        name: 'Adidas Ultraboost 22',
        brand: 'Adidas',
        price: 180,
        similarity: 87,
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500&h=500&fit=crop'
      }
    ];
    
    setIsProcessing(false);
    onSearch(mockResults);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-seekon-midnight/90 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-seekon-midnight/95 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 max-w-sm sm:max-w-lg w-full border border-white/20 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-seekon-electricRed to-seekon-neonCyan rounded-full flex items-center justify-center">
              <FiImage className="w-4 h-4 text-seekon-pureWhite" />
            </div>
            <h3 className="text-xl font-bold text-seekon-pureWhite">
              Visual Search
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
          >
            <FiX className="w-5 h-5 text-seekon-softWhite" />
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-seekon-softWhite">
            Upload an image of sneakers you like and Seekon will find similar products for you!
          </p>

          {!selectedImage ? (
            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                dragActive
                  ? 'border-seekon-electricRed bg-gradient-to-r from-seekon-electricRed/20 to-seekon-neonCyan/20 backdrop-blur-sm'
                  : 'border-white/30 hover:border-seekon-electricRed/50 hover:bg-white/5'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                dragActive 
                  ? 'bg-gradient-to-r from-seekon-electricRed to-seekon-neonCyan' 
                  : 'bg-white/10'
              }`}>
                <FiImage className={`w-8 h-8 transition-colors duration-300 ${
                  dragActive ? 'text-seekon-pureWhite' : 'text-seekon-softWhite'
                }`} />
              </div>
              <p className="text-seekon-softWhite mb-2 font-medium">
                Drag and drop an image here, or
              </p>
              <label className="cursor-pointer">
                <span className="text-seekon-electricRed hover:text-seekon-neonCyan font-bold transition-colors duration-200">
                  browse files
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage}
                  alt="Selected for search"
                  className="w-full h-48 object-cover rounded-xl border border-white/20"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-3 right-3 p-2 bg-seekon-midnight/80 hover:bg-seekon-midnight backdrop-blur-sm text-seekon-pureWhite rounded-xl transition-all duration-200 border border-white/20"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
              
              <button
                onClick={handleSearch}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-seekon-electricRed to-seekon-electricRed/80 hover:from-seekon-electricRed/90 hover:to-seekon-electricRed/70 disabled:bg-white/10 disabled:cursor-not-allowed text-seekon-pureWhite font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 disabled:text-seekon-softWhite"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-seekon-pureWhite border-t-transparent rounded-full animate-spin" />
                    <span>Seekon is searching...</span>
                  </>
                ) : (
                  <>
                    <FiSearch className="w-4 h-4" />
                    <span>Find Similar Products</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </motion.div>
      </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VisualSearchModal;

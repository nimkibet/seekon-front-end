import React from 'react';

export default function ProductSkeleton({ imageUrl }) {
  return (
    <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden h-full border-2 border-dashed border-gray-300 dark:border-gray-600">
      {/* Dummy image placeholder */}
      <div className="h-64 w-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="placeholder"
            className="object-cover w-full h-full opacity-30 grayscale"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-6xl">👟</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand placeholder */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
        
        {/* Name placeholder */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>

        {/* Colors placeholder */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="text-xs text-gray-400">Colors:</span>
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-gray-400"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-gray-400"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-gray-400"></div>
          </div>
        </div>

        {/* Price placeholder */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    </div>
  );
}



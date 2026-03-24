import React from 'react';

/**
 * ProductSkeleton - A skeleton loader that mimics ProductCard layout
 * Uses Tailwind's animate-pulse utility for loading animation
 */
export default function ProductSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden h-full">
      {/* Image Container - aspect-square matches ProductCard */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
        
        {/* Top badges placeholder area */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          <div className="h-5 w-16 bg-gray-300 dark:bg-gray-600 rounded-full animate-pulse" />
        </div>
        
        {/* Quick actions overlay placeholder */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0">
          <div className="flex space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* Product Info - matches ProductCard p-4 padding */}
      <div className="p-4">
        {/* Brand placeholder - matches ProductCard brand styling */}
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-1 animate-pulse" />
        
        {/* Name placeholder - matches ProductCard name styling */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />

        {/* Rating placeholder (only shown if reviews exist) */}
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            ))}
          </div>
          <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        
        {/* Price placeholder */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse" />
        </div>

        {/* Colors & Button Row placeholder */}
        <div className="flex items-center justify-between">
          {/* Colors */}
          <div className="flex space-x-1">
            <div className="w-5 h-5 rounded-full bg-gray-200 border-2 border-gray-300 animate-pulse" />
            <div className="w-5 h-5 rounded-full bg-gray-200 border-2 border-gray-300 animate-pulse" />
            <div className="w-5 h-5 rounded-full bg-gray-200 border-2 border-gray-300 animate-pulse" />
          </div>

          {/* Add to cart button placeholder */}
          <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  );
}

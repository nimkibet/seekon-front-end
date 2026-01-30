import React from 'react';
import { FiImage, FiShoppingBag, FiUser, FiHeart, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

// Loading skeleton components
export const ProductCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden animate-pulse">
    <div className="aspect-square bg-gray-200 dark:bg-gray-700"></div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
);

export const ProductCardError = ({ onRetry }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="aspect-square bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
      <div className="text-center p-4">
        <FiImage className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Failed to load product</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded transition-colors duration-200"
          >
            Retry
          </button>
        )}
      </div>
    </div>
    <div className="p-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
);

export const ImageFallback = ({ src, alt, className = "", fallbackIcon: Icon = FiImage, ...props }) => {
  const [imageError, setImageError] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  if (imageError) {
    return (
      <div className={`${className} bg-gray-100 dark:bg-gray-700 flex items-center justify-center`} {...props}>
        <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
    );
  }

  return (
    <div className={`${className} relative`} {...props}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onError={handleImageError}
        onLoad={handleImageLoad}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
};

export const ButtonFallback = ({ children, isLoading, error, onRetry, ...props }) => {
  if (isLoading) {
    return (
      <button
        {...props}
        disabled
        className={`${props.className} opacity-50 cursor-not-allowed`}
      >
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        Loading...
      </button>
    );
  }

  if (error) {
    return (
      <button
        {...props}
        onClick={onRetry}
        className={`${props.className} bg-red-600 hover:bg-red-700`}
      >
        <FiRefreshCw className="w-4 h-4 mr-2" />
        Retry
      </button>
    );
  }

  return <button {...props}>{children}</button>;
};

export const SectionFallback = ({ title, children, isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {title}
            </h2>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <FiAlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
                Failed to load {title.toLowerCase()}
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-4">
                We're having trouble loading this section. Please try again.
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );
};

export const EmptyState = ({ 
  icon: Icon = FiShoppingBag, 
  title, 
  description, 
  action, 
  actionText 
}) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
      {description}
    </p>
    {action && actionText && (
      <button
        onClick={action}
        className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
      >
        {actionText}
      </button>
    )}
  </div>
);

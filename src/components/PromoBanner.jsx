import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const PromoBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('promoBannerDismissed');
    if (!dismissed) {
      setIsVisible(true);
    } else {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('promoBannerDismissed', 'true');
  };

  // Don't render if dismissed
  if (isDismissed && !isVisible) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-[#00A676] to-[#008559] text-white text-center py-2 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <p className="text-sm font-medium">
          🎉 New Arrivals! Use code <span className="font-bold underline">KARIBU10</span> at checkout for 10% off your first order.
        </p>
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss banner"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default PromoBanner;

import React from 'react';
import { motion } from 'framer-motion';

const PromotionalBanner = ({ 
  message = "Seekon Apparel — Live bold. Dress sharper. Walk your story. • UPTO 30% ON SELECTED ITEMS. DISCOUNT APPLIED AUTOMATICALLY AT CHECKOUT.",
  backgroundColor = "bg-seekon-midnight",
  textColor = "text-seekon-softWhite",
  showIcons = true,
  animated = true,
  className = "",
  scrollSpeed = "slow" // slow, medium, fast
}) => {
  // Speed configurations - slower for better UX
  const speedConfig = {
    slow: { duration: 50, delay: 25 },
    medium: { duration: 35, delay: 17.5 },
    fast: { duration: 25, delay: 12.5 }
  };

  const config = speedConfig[scrollSpeed] || speedConfig.slow;

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${backgroundColor} ${textColor} py-1 sm:py-1.5 relative overflow-hidden ${className}`}
    >
      {/* Scrolling text container */}
      <div className="relative h-4 sm:h-5">
        {/* Single scrolling text */}
        <motion.div
          animate={{
            x: ['100%', '-100%']
          }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: "loop",
              duration: config.duration,
              ease: "linear"
            }
          }}
          className="absolute top-0 left-0 flex items-center space-x-2 sm:space-x-3 whitespace-nowrap"
        >
          {showIcons && (
            <>
              {/* Price Tag Icon */}
              <div className="relative flex-shrink-0 hidden sm:block">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border border-current transform rotate-45"></div>
                <div className="absolute top-0 left-0 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-current rounded-full"></div>
              </div>
            </>
          )}
          
          <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-wide flex-shrink-0">
            {message}
          </span>
          
          {showIcons && (
            <>
              {/* Price Tag Icon */}
              <div className="relative flex-shrink-0 hidden sm:block">
                <div className="w-3 h-3 sm:w-4 sm:h-4 border border-current transform rotate-45"></div>
                <div className="absolute top-0 left-0 w-0.5 h-0.5 sm:w-1 sm:h-1 bg-current rounded-full"></div>
              </div>
            </>
          )}
        </motion.div>
      </div>
      
      {/* Animated background effect */}
      {animated && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
      )}
    </motion.div>
  );
};

export default PromotionalBanner;
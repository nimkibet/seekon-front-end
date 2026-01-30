import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiShoppingBag } from 'react-icons/fi';
import { ImageFallback } from './Fallbacks';

const HeroBanner = () => {
  console.log('🎬 HeroBanner component rendering...');
  
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      title: "Latest Drops",
      subtitle: "Discover the newest arrivals",
      description: "Get your hands on the freshest sneakers and apparel from top brands",
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=1200&h=600&fit=crop",
      buttonText: "Shop Now",
      buttonLink: "/collection?filter=new",
      gradient: "from-blue-600/80 to-purple-600/80"
    },
    {
      id: 2,
      title: "Trending Brands",
      subtitle: "Nike, Adidas & More",
      description: "Explore our curated collection of trending sneakers from premium brands",
      image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1200&h=600&fit=crop",
      buttonText: "Explore Brands",
      buttonLink: "/collection",
      gradient: "from-red-600/80 to-orange-600/80"
    },
    {
      id: 3,
      title: "Limited Stock",
      subtitle: "Don't Miss Out",
      description: "Grab these exclusive pieces before they're gone forever",
      image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&h=600&fit=crop",
      buttonText: "Shop Sale",
      buttonLink: "/collection?filter=sale",
      gradient: "from-green-600/80 to-teal-600/80"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <ImageFallback
              src={slides[currentSlide].image}
              alt={slides[currentSlide].title}
              className="w-full h-full object-cover"
              fallbackIcon={FiShoppingBag}
            />
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient}`} />
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 w-full">
              <div className="max-w-xl sm:max-w-2xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-white"
                >
                  <h2 className="text-xs sm:text-sm md:text-base font-medium mb-1 sm:mb-2 opacity-90">
                    {slides[currentSlide].subtitle}
                  </h2>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 leading-tight">
                    {slides[currentSlide].title}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-lg">
                    {slides[currentSlide].description}
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link
                      to={slides[currentSlide].buttonLink}
                      className="inline-flex items-center space-x-2 bg-white text-gray-900 font-semibold px-4 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg text-sm sm:text-base"
                    >
                      <FiShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>{slides[currentSlide].buttonText}</span>
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200"
      >
        <FiChevronLeft className="w-6 h-6" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 w-12 h-12 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all duration-200"
      >
        <FiChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide
                ? 'bg-white scale-125'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>

      {/* Overlay Pattern */}
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
};

export default HeroBanner;


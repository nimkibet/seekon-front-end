import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import Logo3D from "./Logo3D";

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative">
      {/* Full-page background 3D Logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-20 dark:opacity-30 pointer-events-none z-0">
        <div className="w-full h-full max-w-4xl max-h-96">
          <Logo3D width="100%" height="100%" />
        </div>
      </div>

      {/* Content Wrapper to ensure it's above the background */}
      <div className="relative z-10 flex flex-col flex-grow">
      {/* 🔹 Header */}
      <header className="relative flex items-center justify-between px-6 py-4 bg-gray-900/40 backdrop-blur-xl shadow-md border-b border-gray-200/20 dark:border-gray-700/30 z-[10000]">
        <Link to="/" className="flex flex-col items-center group">
          <img 
            src="/seekon_bg-removebg-preview.png" 
            alt="Seekon Apparel Logo" 
            className="h-10 w-auto opacity-100 group-hover:opacity-100 transition-opacity duration-200 object-contain"
          />
        </Link>

        {/* Seekon Apparel Text - Centered & Responsive */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full px-2 pointer-events-none">
          <span 
            className="font-black text-gray-800 dark:text-gray-100 uppercase block text-center"
            style={{ 
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontWeight: 900,
              textShadow: '4px 4px 8px rgba(0,0,0,0.5), -2px -2px 6px rgba(255,255,255,0.4)',
              letterSpacing: '1px',
              fontSize: 'clamp(0.8rem, 4vw, 2rem)',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
              width: '100%'
            }}
          >
            <span className="hidden sm:inline">S E E K O N &nbsp;&nbsp; A P P A R E L</span>
            <span className="sm:hidden text-center">SEEKON APPAREL</span>
          </span>
        </div>

        {/* Hamburger Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 bg-gray-900/40 backdrop-blur-xl shadow-xl border border-gray-200/20 dark:border-gray-700/30 rounded-lg overflow-hidden z-[9999]"
              >
            <div className="py-2 space-y-1 min-w-[200px]">
              <Link
                to="/about"
                onClick={() => setIsMenuOpen(false)}
                className="block px-5 py-2.5 hover:bg-white/10 text-white transition-all duration-200 font-medium text-sm mx-2 rounded-lg"
              >
            About
          </Link>
              <Link
                to="/careers"
                onClick={() => setIsMenuOpen(false)}
                className="block px-5 py-2.5 hover:bg-white/10 text-white transition-all duration-200 font-medium text-sm mx-2 rounded-lg"
              >
            Careers
          </Link>
              <Link
                to="/press"
                onClick={() => setIsMenuOpen(false)}
                className="block px-5 py-2.5 hover:bg-white/10 text-white transition-all duration-200 font-medium text-sm mx-2 rounded-lg"
              >
            Press
          </Link>
              <Link
                to="/sustainability"
                onClick={() => setIsMenuOpen(false)}
                className="block px-5 py-2.5 hover:bg-white/10 text-white transition-all duration-200 font-medium text-sm mx-2 rounded-lg"
              >
            Sustainability
          </Link>
              <Link
                to="/investors"
                onClick={() => setIsMenuOpen(false)}
                className="block px-5 py-2.5 hover:bg-white/10 text-white transition-all duration-200 font-medium text-sm mx-2 rounded-lg"
              >
            Investors
          </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </header>

      {/* 🔹 Page Content */}
      <div className="flex flex-col flex-grow">
        {children}
      </div>

      {/* 🔹 Footer */}
      <footer className="py-8 bg-gray-100 dark:bg-gray-800 text-center border-t border-gray-200 dark:border-gray-700">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col items-center space-y-4"
        >
          <img 
            src="/seekon_bg-removebg-preview.png" 
            alt="Seekon Logo" 
            className="h-12 w-auto opacity-80 object-contain"
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © 2025 Seekon Apparel. All rights reserved.
          </p>
        </motion.div>
      </footer>
      </div>
    </div>
  );
};

export default Layout;

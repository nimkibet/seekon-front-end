import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiPhone, FiMapPin, FiInstagram, FiTwitter, FiFacebook, FiYoutube } from 'react-icons/fi';
import PromotionalBanner from './PromotionalBanner';

const Footer = () => {
  const handleLinkClick = (path) => {
    console.log(`🔗 Footer link clicked: ${path}`);
    // Add any analytics or tracking here
  };

  const handleExternalLink = (url) => {
    console.log(`🌐 External link clicked: ${url}`);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Promotional Banner */}
      <PromotionalBanner 
        message="Seekon Apparel — Live bold. Dress sharper. Walk your story. • UPTO 30% ON SELECTED ITEMS. DISCOUNT APPLIED AUTOMATICALLY AT CHECKOUT."
        backgroundColor="bg-seekon-midnight"
        textColor="text-seekon-softWhite"
        showIcons={true}
        animated={true}
        scrollSpeed="slow"
      />
      
      <footer className="bg-seekon-deepNavy text-seekon-platinumSilver">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4 sm:gap-6">
          
          {/* Brand Column */}
          <div className="flex-1 max-w-xs">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link 
                to="/" 
                onClick={() => handleLinkClick('/')}
                className="flex items-center space-x-2 mb-4"
              >
                <span className="text-2xl font-bold text-seekon-neonCyan">Seekon</span>
                <span className="text-2xl font-bold text-seekon-neonCyan">Apparel</span>
              </Link>
              
              <p className="text-seekon-platinumSilver text-xs leading-relaxed mb-4 max-w-xs">
                Premium sneakers and apparel for the modern lifestyle.
              </p>
              
              {/* Contact Information */}
              <div className="space-y-2">
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-3"
                >
                  <FiMail className="w-4 h-4 text-seekon-neonCyan flex-shrink-0" />
                  <a 
                    href="mailto:support@seekon-apparel.co.ke"
                    onClick={() => handleExternalLink('mailto:support@seekon-apparel.co.ke')}
                    className="text-seekon-platinumSilver text-sm hover:text-seekon-neonCyan transition-colors duration-200"
                  >
                    support@seekon-apparel.co.ke
                  </a>
                </motion.div>
                
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-3"
                >
                  <FiPhone className="w-4 h-4 text-seekon-neonCyan flex-shrink-0" />
                  <a 
                    href="tel:+254700123456"
                    onClick={() => handleExternalLink('tel:+254700123456')}
                    className="text-seekon-platinumSilver text-sm hover:text-seekon-neonCyan transition-colors duration-200"
                  >
                    +254 700 123 456
                  </a>
                </motion.div>
                
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center space-x-3"
                >
                  <FiMapPin className="w-4 h-4 text-seekon-neonCyan flex-shrink-0" />
                  <span className="text-seekon-platinumSilver text-sm">
                    Westlands Business Centre, 3rd Floor, Waiyaki Way, Nairobi 00100
                  </span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Shop Column */}
          <div className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-seekon-pureWhite font-bold text-lg mb-4">Shop</h3>
              <ul className="space-y-3">
                {[
                  { name: 'New Arrivals', path: '/collection?filter=new' },
                  { name: 'Sneakers', path: '/collection?category=sneakers' },
                  { name: 'Apparel', path: '/collection?category=apparel' },
                  { name: 'Accessories', path: '/collection?category=accessories' },
                  { name: 'Sale', path: '/collection?filter=sale' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={() => handleLinkClick(item.path)}
                      className="text-seekon-platinumSilver text-sm hover:text-seekon-neonCyan transition-colors duration-200 block py-1"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Support Column */}
          <div className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
              <h3 className="text-seekon-pureWhite font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Size Guide', path: '/size-guide' },
                  { name: 'Shipping Info', path: '/shipping' },
                  { name: 'Returns', path: '/returns' },
                  { name: 'Contact Us', path: '/contact' },
                  { name: 'FAQ', path: '/faq' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={() => handleLinkClick(item.path)}
                      className="text-seekon-platinumSilver text-sm hover:text-seekon-neonCyan transition-colors duration-200 block py-1"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Support Column */}
          <div className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <h3 className="text-seekon-pureWhite font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                {[
                  { name: 'Size Guide', path: '/size-guide' },
                  { name: 'Shipping Info', path: '/shipping' },
                  { name: 'Returns', path: '/returns' },
                  { name: 'Contact Us', path: '/contact' },
                  { name: 'FAQ', path: '/faq' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={() => handleLinkClick(item.path)}
                      className="text-seekon-platinumSilver text-sm hover:text-seekon-neonCyan transition-colors duration-200 block py-1"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Company Column */}
          <div className="flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-seekon-pureWhite font-bold text-lg mb-4">Support</h3>
              <ul className="space-y-3">
                {[
                  { name: 'About Us', path: '/about' },
                  { name: 'Contact', path: '/contact' },
                  { name: 'Returns', path: '/returns' },
                  { name: 'Shipping', path: '/shipping' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      onClick={() => handleLinkClick(item.path)}
                      className="text-seekon-platinumSilver text-sm hover:text-seekon-neonCyan transition-colors duration-200 block py-1"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Social Media & Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-6 pt-4 border-t border-seekon-charcoalGray"
        >
          <div className="flex flex-col md:flex-row justify-between items-center max-w-3xl mx-auto">
            
            {/* Social Media Links */}
            <div className="flex space-x-3 mb-4 md:mb-0">
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://instagram.com/seekonapparel"
                onClick={() => handleExternalLink('https://instagram.com/seekonapparel')}
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:text-cyan-400 hover:bg-cyan-500 transition-all duration-200"
              >
                <FiInstagram className="w-5 h-5" />
              </motion.a>
              
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://twitter.com/seekonapparel"
                onClick={() => handleExternalLink('https://twitter.com/seekonapparel')}
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:text-cyan-400 hover:bg-cyan-500 transition-all duration-200"
              >
                <FiTwitter className="w-5 h-5" />
              </motion.a>
              
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://facebook.com/seekonapparel"
                onClick={() => handleExternalLink('https://facebook.com/seekonapparel')}
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:text-cyan-400 hover:bg-cyan-500 transition-all duration-200"
              >
                <FiFacebook className="w-5 h-5" />
              </motion.a>
              
              <motion.a
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                href="https://youtube.com/seekonapparel"
                onClick={() => handleExternalLink('https://youtube.com/seekonapparel')}
                className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-white hover:text-cyan-400 hover:bg-cyan-500 transition-all duration-200"
              >
                <FiYoutube className="w-5 h-5" />
              </motion.a>
            </div>

            {/* Copyright */}
            <div className="text-center md:text-right">
              <p className="text-seekon-platinumSilver text-[10px] sm:text-xs">
                © 2025 Seekon Apparel. All rights reserved.
              </p>
              <div className="flex space-x-2 mt-0.5 text-[10px] sm:text-xs text-seekon-platinumSilver">
                <Link
                  to="/privacy"
                  onClick={() => handleLinkClick('/privacy')}
                  className="hover:text-seekon-neonCyan transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  onClick={() => handleLinkClick('/terms')}
                  className="hover:text-seekon-neonCyan transition-colors duration-200"
                >
                  Terms of Service
                </Link>
                <Link
                  to="/cookies"
                  onClick={() => handleLinkClick('/cookies')}
                  className="hover:text-seekon-neonCyan transition-colors duration-200"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      </footer>
    </>
  );
};

export default Footer;
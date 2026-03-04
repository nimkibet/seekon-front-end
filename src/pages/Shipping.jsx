import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTruck, FiClock, FiShield, FiRefreshCw } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Shipping = () => {
  return (
    <div className="min-h-screen bg-seekon-platinumSilver">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-seekon-electricRed hover:text-seekon-electricRed/80 transition-colors duration-200 mb-6"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-seekon-midnight mb-4">Shipping Information</h1>
          <p className="text-seekon-charcoalGray text-lg">
            Everything you need to know about shipping your orders.
          </p>
        </motion.div>

        <div className="space-y-12">
          
          {/* Shipping Options */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-seekon-midnight mb-6">Shipping Options</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <div className="w-12 h-12 bg-seekon-electricRed rounded-lg flex items-center justify-center mb-4">
                  <FiTruck className="w-6 h-6 text-seekon-pureWhite" />
                </div>
                <h3 className="font-semibold text-seekon-midnight mb-2">Standard Shipping</h3>
                <p className="text-seekon-charcoalGray text-sm mb-3">5-7 business days</p>
                <p className="text-seekon-electricRed font-semibold">FREE on orders over KSh 7,500</p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <div className="w-12 h-12 bg-seekon-electricRed rounded-lg flex items-center justify-center mb-4">
                  <FiClock className="w-6 h-6 text-seekon-pureWhite" />
                </div>
                <h3 className="font-semibold text-seekon-midnight mb-2">Express Shipping</h3>
                <p className="text-seekon-charcoalGray text-sm mb-3">2-3 business days</p>
                <p className="text-seekon-electricRed font-semibold">KSh 1,000</p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <div className="w-12 h-12 bg-seekon-electricRed rounded-lg flex items-center justify-center mb-4">
                  <FiShield className="w-6 h-6 text-seekon-pureWhite" />
                </div>
                <h3 className="font-semibold text-seekon-midnight mb-2">Overnight</h3>
                <p className="text-seekon-charcoalGray text-sm mb-3">Next business day</p>
                <p className="text-seekon-electricRed font-semibold">KSh 2,000</p>
              </div>
            </div>
          </motion.div>

          {/* Shipping Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-seekon-midnight mb-6">Shipping Details</h2>
            
            <div className="bg-seekon-pureWhite p-8 rounded-lg shadow-lg">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-2">Processing Time</h3>
                  <p className="text-seekon-charcoalGray">Orders are processed within 1-2 business days. You'll receive a confirmation email with tracking information once your order ships.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-2">International Shipping</h3>
                  <p className="text-seekon-charcoalGray">We ship to over 50 countries worldwide. International orders typically take 7-14 business days to arrive.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-2">Tracking Your Order</h3>
                  <p className="text-seekon-charcoalGray">Once your order ships, you'll receive a tracking number via email. You can track your package in real-time using our tracking system.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-2">Delivery Issues</h3>
                  <p className="text-seekon-charcoalGray">If you experience any delivery issues, please contact our customer service team immediately. We'll work with the carrier to resolve the issue quickly.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-seekon-midnight mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-seekon-midnight mb-2">How long does shipping take?</h3>
                <p className="text-seekon-charcoalGray">Standard shipping takes 5-7 business days, express shipping takes 2-3 business days, and overnight shipping arrives the next business day.</p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-seekon-midnight mb-2">Do you ship internationally?</h3>
                <p className="text-seekon-charcoalGray">Yes, we ship to over 50 countries worldwide. International shipping typically takes 7-14 business days.</p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-seekon-midnight mb-2">Can I change my shipping address?</h3>
                <p className="text-seekon-charcoalGray">You can change your shipping address before your order ships by contacting customer service. Once shipped, address changes are not possible.</p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-seekon-midnight mb-2">What if my package is damaged?</h3>
                <p className="text-seekon-charcoalGray">If your package arrives damaged, please contact us immediately with photos. We'll arrange for a replacement or refund.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;

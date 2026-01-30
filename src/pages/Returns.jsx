import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiRefreshCw, FiClock, FiShield, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Returns = () => {
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
          
          <h1 className="text-4xl font-bold text-seekon-midnight mb-4">Returns & Exchanges</h1>
          <p className="text-seekon-charcoalGray text-lg">
            Easy returns and exchanges within 30 days of purchase.
          </p>
        </motion.div>

        <div className="space-y-12">
          
          {/* Return Policy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-seekon-midnight mb-6">Return Policy</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <div className="w-12 h-12 bg-seekon-electricRed rounded-lg flex items-center justify-center mb-4">
                  <FiClock className="w-6 h-6 text-seekon-pureWhite" />
                </div>
                <h3 className="font-semibold text-seekon-midnight mb-2">30-Day Window</h3>
                <p className="text-seekon-charcoalGray text-sm">Return items within 30 days of delivery for a full refund.</p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <div className="w-12 h-12 bg-seekon-electricRed rounded-lg flex items-center justify-center mb-4">
                  <FiShield className="w-6 h-6 text-seekon-pureWhite" />
                </div>
                <h3 className="font-semibold text-seekon-midnight mb-2">Free Returns</h3>
                <p className="text-seekon-charcoalGray text-sm">Free return shipping on all orders over KSh 7,500.</p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <div className="w-12 h-12 bg-seekon-electricRed rounded-lg flex items-center justify-center mb-4">
                  <FiCheckCircle className="w-6 h-6 text-seekon-pureWhite" />
                </div>
                <h3 className="font-semibold text-seekon-midnight mb-2">Easy Process</h3>
                <p className="text-seekon-charcoalGray text-sm">Simple online return process with prepaid labels.</p>
              </div>
            </div>
          </motion.div>

          {/* How to Return */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-semibold text-seekon-midnight mb-6">How to Return</h2>
            
            <div className="bg-seekon-pureWhite p-8 rounded-lg shadow-lg">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-seekon-electricRed rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-seekon-pureWhite font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-seekon-midnight mb-2">Start Your Return</h3>
                    <p className="text-seekon-charcoalGray">Log into your account and go to "Order History" to initiate a return. Select the items you want to return and choose your reason.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-seekon-electricRed rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-seekon-pureWhite font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-seekon-midnight mb-2">Print Return Label</h3>
                    <p className="text-seekon-charcoalGray">Download and print your prepaid return label. If you don't have a printer, you can request a label by mail.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-seekon-electricRed rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-seekon-pureWhite font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-seekon-midnight mb-2">Package Items</h3>
                    <p className="text-seekon-charcoalGray">Place items in the original packaging or a secure box. Include the return label and any original tags or accessories.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-seekon-electricRed rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-seekon-pureWhite font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-seekon-midnight mb-2">Ship Your Return</h3>
                    <p className="text-seekon-charcoalGray">Drop off your package at any authorized shipping location or schedule a pickup. You'll receive email updates on your return status.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Exchange Process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-2xl font-semibold text-seekon-midnight mb-6">Exchange Process</h2>
            
            <div className="bg-seekon-pureWhite p-8 rounded-lg shadow-lg">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-2">Size Exchanges</h3>
                  <p className="text-seekon-charcoalGray mb-4">Need a different size? We offer free size exchanges within 30 days. Simply select "Exchange" when starting your return and choose your new size.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-2">Color Exchanges</h3>
                  <p className="text-seekon-charcoalGray mb-4">Want a different color? We can exchange items for different colors as long as they're in stock and within the return window.</p>
                </div>

                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-2">Exchange Timeline</h3>
                  <p className="text-seekon-charcoalGray">Exchanges typically take 7-10 business days to process. You'll receive tracking information for your new item once it ships.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-2xl font-semibold text-seekon-midnight mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-seekon-midnight mb-2">What items can I return?</h3>
                <p className="text-seekon-charcoalGray">Most items can be returned within 30 days, but some items like underwear, swimwear, and personalized items cannot be returned for hygiene reasons.</p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-seekon-midnight mb-2">How long do refunds take?</h3>
                <p className="text-seekon-charcoalGray">Refunds are processed within 3-5 business days after we receive your return. The refund will appear on your original payment method within 5-10 business days.</p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-seekon-midnight mb-2">Can I return items to a store?</h3>
                <p className="text-seekon-charcoalGray">Yes, you can return online purchases to any of our physical store locations. Bring your order confirmation and the items you want to return.</p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-lg shadow-lg">
                <h3 className="font-semibold text-seekon-midnight mb-2">What if I lost my return label?</h3>
                <p className="text-seekon-charcoalGray">No problem! Contact our customer service team and we'll send you a new return label. You can also print a new one from your account.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Returns;

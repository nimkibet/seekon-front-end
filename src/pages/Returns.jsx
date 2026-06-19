import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiClock, FiDollarSign, FiCheckCircle } from 'react-icons/fi';
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
            className="inline-flex items-center text-seekon-midnight hover:text-seekon-charcoalGray transition-colors duration-200 mb-6 font-medium"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-seekon-midnight mb-4 tracking-tight">Returns & Exchanges</h1>
          <p className="text-seekon-charcoalGray text-lg max-w-2xl leading-relaxed">
            Convenient return and exchange services within 72 hours of your successful purchase.
          </p>
        </motion.div>

        <div className="space-y-12">
          
          {/* Return Policy Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-seekon-midnight mb-6">Our Policy</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 72-Hour Window Card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-seekon-pureWhite p-6 rounded-xl border border-gray-200/60 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-seekon-midnight rounded-xl flex items-center justify-center mb-4">
                    <FiClock className="w-6 h-6 text-seekon-pureWhite" />
                  </div>
                  <h3 className="font-bold text-seekon-midnight mb-2">72-Hour Window</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                    Return requests must be initiated within 72 hours of successful purchase verification.
                  </p>
                </div>
              </motion.div>

              {/* Chargeable Returns Card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-seekon-pureWhite p-6 rounded-xl border border-gray-200/60 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-seekon-midnight rounded-xl flex items-center justify-center mb-4">
                    <FiDollarSign className="w-6 h-6 text-seekon-pureWhite" />
                  </div>
                  <h3 className="font-bold text-seekon-midnight mb-2">Chargeable Returns</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                    Return shipping costs are chargeable on all orders and must be covered by the customer.
                  </p>
                </div>
              </motion.div>

              {/* Easy Process Card */}
              <motion.div 
                whileHover={{ y: -4 }}
                className="bg-seekon-pureWhite p-6 rounded-xl border border-gray-200/60 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-seekon-midnight rounded-xl flex items-center justify-center mb-4">
                    <FiCheckCircle className="w-6 h-6 text-seekon-pureWhite" />
                  </div>
                  <h3 className="font-bold text-seekon-midnight mb-2">Streamlined Process</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                    Log in, select eligible items, and register your return request online in just a few taps.
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* How to Return */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-seekon-midnight mb-6">How to Initiate a Return</h2>
            
            <div className="bg-seekon-pureWhite p-8 rounded-xl border border-gray-200/60">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-seekon-midnight rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-seekon-pureWhite font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-seekon-midnight mb-1">Start Your Return</h3>
                    <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                      Log into your account and open your "Order History" within 72 hours of purchase. Select the active order, pick the items you wish to return, and specify the reason.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-seekon-midnight rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-seekon-pureWhite font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-seekon-midnight mb-1">Confirm Return Cost</h3>
                    <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                      Review the return shipping estimate. Since returns are chargeable, the return courier cost is paid directly to the carrier or deducted from the final refund amount.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-seekon-midnight rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-seekon-pureWhite font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-seekon-midnight mb-1">Package Your Items</h3>
                    <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                      Place the items in their original, undamaged packaging with all original labels, tags, and accessories intact. Wrap securely to prevent damage in transit.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-seekon-midnight rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-seekon-pureWhite font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-seekon-midnight mb-1">Dispatch to Seekon</h3>
                    <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                      Drop off the package at our partner carrier stations or hand it over to our dispatched courier. You will receive WhatsApp updates as soon as the package reaches our inspection facility.
                    </p>
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
            <h2 className="text-2xl font-bold text-seekon-midnight mb-6">Exchanges & Timelines</h2>
            
            <div className="bg-seekon-pureWhite p-8 rounded-xl border border-gray-200/60">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-seekon-midnight mb-2">Size Exchanges</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                    Need a different size? We offer sizing exchanges within 72 hours of purchase. Select "Exchange" in the returns section to verify size availability in real-time. Sizing exchange shipments are subject to standard delivery shipping fees.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-seekon-midnight mb-2">Color & Item Exchanges</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                    If you prefer a different color or style, you can request an exchange for items of equal value within the 72-hour window, provided the product remains completely unused.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-seekon-midnight mb-2">Dispatch Timelines</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                    Once your exchange item is received and inspected at our hub, your new package is dispatched. Delivery takes under 2 hours within Nairobi and up to 18 hours for areas outside Nairobi.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default Returns;

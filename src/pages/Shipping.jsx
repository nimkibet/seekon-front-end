import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTruck, FiClock, FiMapPin, FiPhone } from 'react-icons/fi';
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
            className="inline-flex items-center text-seekon-midnight hover:text-seekon-charcoalGray transition-colors duration-200 mb-6 font-medium"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-seekon-midnight mb-4 tracking-tight">Shipping & Delivery</h1>
          <p className="text-seekon-charcoalGray text-lg max-w-2xl leading-relaxed">
            Fast, reliable, and premium delivery options tailored to your location.
          </p>
        </motion.div>

        <div className="space-y-12">
          
          {/* Shipping Options Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold text-seekon-midnight mb-6">Delivery Coverage & Timelines</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Nairobi Delivery Card */}
              <motion.div 
                whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
                transition={{ duration: 0.2 }}
                className="bg-seekon-pureWhite p-8 rounded-xl border border-gray-200/60 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-seekon-midnight rounded-xl flex items-center justify-center mb-6">
                    <FiMapPin className="w-6 h-6 text-seekon-pureWhite" />
                  </div>
                  <h3 className="text-xl font-bold text-seekon-midnight mb-2">Within Nairobi</h3>
                  <p className="text-seekon-charcoalGray text-sm mb-6 leading-relaxed">
                    Ultra-fast door-to-door delivery within the Nairobi metropolitan area.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-seekon-charcoalGray text-sm">
                      <FiClock className="w-5 h-5 mr-3 text-seekon-charcoalGray flex-shrink-0" />
                      <span>Delivery within <strong>2 Hours</strong></span>
                    </div>
                    <div className="flex items-center text-seekon-charcoalGray text-sm">
                      <FiTruck className="w-5 h-5 mr-3 text-seekon-charcoalGray flex-shrink-0" />
                      <span>Free Shipping Included</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-seekon-charcoalGray/60">Rate</span>
                  <span className="text-xl font-bold text-seekon-midnight">FREE</span>
                </div>
              </motion.div>

              {/* Outside Nairobi Delivery Card */}
              <motion.div 
                whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
                transition={{ duration: 0.2 }}
                className="bg-seekon-pureWhite p-8 rounded-xl border border-gray-200/60 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 bg-seekon-midnight rounded-xl flex items-center justify-center mb-6">
                    <FiTruck className="w-6 h-6 text-seekon-pureWhite" />
                  </div>
                  <h3 className="text-xl font-bold text-seekon-midnight mb-2">Outside Nairobi</h3>
                  <p className="text-seekon-charcoalGray text-sm mb-6 leading-relaxed">
                    Prompt courier dispatch to all regions and major towns outside Nairobi.
                  </p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center text-seekon-charcoalGray text-sm">
                      <FiClock className="w-5 h-5 mr-3 text-seekon-charcoalGray flex-shrink-0" />
                      <span>Delivery within <strong>18 Hours</strong></span>
                    </div>
                    <div className="flex items-center text-seekon-charcoalGray text-sm">
                      <FiTruck className="w-5 h-5 mr-3 text-seekon-charcoalGray flex-shrink-0" />
                      <span>Chargeable Return Shipping</span>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-seekon-charcoalGray/60">Rate</span>
                  <span className="text-sm font-bold text-seekon-midnight bg-seekon-platinumSilver px-3 py-1.5 rounded-lg">Calculated at Checkout</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Shipping Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-seekon-midnight mb-6">Delivery Details & Process</h2>
            
            <div className="bg-seekon-pureWhite p-8 rounded-xl border border-gray-200/60">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-seekon-midnight mb-2">Instant Dispatch</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                    Nairobi orders are processed immediately and handed over to our local riders for arrival in under 2 hours. Outside Nairobi orders are dispatched via trusted courier networks within 1 hour of purchase confirmation.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-seekon-midnight mb-2">Location-Based Rates</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                    Delivery is completely free for addresses within Nairobi limits. For locations outside Nairobi, delivery rates are computed dynamically based on distance to ensure fair and competitive pricing.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-seekon-midnight mb-2">Live WhatsApp Tracking</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                    Receive tracking information directly on your phone. Once dispatched, your driver or courier tracking details are shared with you in real-time.
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-seekon-midnight mb-2">Support & Assistance</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                    If you experience any transit delay or have questions regarding your package status, reach out directly to our delivery support team at <a href="tel:+254727672772" className="underline font-medium text-seekon-midnight hover:text-seekon-charcoalGray">+254 727 672 772</a>.
                  </p>
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
            <h2 className="text-2xl font-bold text-seekon-midnight mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <div className="bg-seekon-pureWhite p-6 rounded-xl border border-gray-200/60">
                <h3 className="font-bold text-seekon-midnight mb-2">How long will my delivery take?</h3>
                <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                  We guarantee 2-hour delivery for addresses within Nairobi. For destinations outside Nairobi, your order will be delivered within 18 hours. Late-night and overnight delivery schedules have been discontinued to ensure maximum security and transit reliability.
                </p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-xl border border-gray-200/60">
                <h3 className="font-bold text-seekon-midnight mb-2">Is shipping free?</h3>
                <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                  Shipping is fully free for all orders delivered within Nairobi. Orders with destinations outside Nairobi incur local courier fees calculated at checkout.
                </p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-xl border border-gray-200/60">
                <h3 className="font-bold text-seekon-midnight mb-2">Can I change my delivery address?</h3>
                <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                  Due to our rapid 2-hour and 18-hour delivery SLA, you can only change your shipping address within 15 minutes of placing your order. Please call us immediately if you need to make changes.
                </p>
              </div>

              <div className="bg-seekon-pureWhite p-6 rounded-xl border border-gray-200/60">
                <h3 className="font-bold text-seekon-midnight mb-2">What happens in case of delivery issues?</h3>
                <p className="text-seekon-charcoalGray text-sm leading-relaxed">
                  In the rare event of traffic delays, weather interruptions, or courier holds, we will proactively notify you via phone call or WhatsApp with a revised ETA.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Shipping;

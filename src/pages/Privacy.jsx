import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Link 
            to="/" 
            className="inline-flex items-center text-green-600 hover:text-green-800 transition-colors duration-200 mb-6"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600 text-lg mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-8 rounded-lg shadow-lg space-y-6"
        >
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-gray-600">
              We collect information you provide directly to us, including name, email address, phone number, 
              and payment information when you make a purchase. We also collect usage data and device information 
              to improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600">
              We use your information to provide and improve our services, process transactions, communicate with you 
              about orders, and send you promotional content. We may also use your data for analytics and to comply 
              with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-600">
              We do not sell your personal information. We may share your information with service providers who 
              assist us in operating our website and conducting our business. We may also share information when 
              required by law or to protect our rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600">
              We implement appropriate security measures to protect your personal information. However, no method 
              of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about this Privacy Policy, please contact us at support@seekon.app or call 
              our customer care at 0700-000-000.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;

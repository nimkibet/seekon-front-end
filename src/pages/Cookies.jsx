import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Cookies = () => {
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
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
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
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What Are Cookies</h2>
            <p className="text-gray-600">
              Cookies are small text files that are stored on your device when you visit our website. 
              They help us remember your preferences and improve your browsing experience.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Types of Cookies We Use</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900">Essential Cookies</h3>
                <p className="text-gray-600">
                  These cookies are necessary for the website to function properly. They enable core features 
                  like shopping cart and checkout functionality.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Analytics Cookies</h3>
                <p className="text-gray-600">
                  We use analytics cookies to understand how visitors interact with our website. This helps 
                  us improve our site performance and user experience.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Marketing Cookies</h3>
                <p className="text-gray-600">
                  These cookies are used to track visitors across websites to display relevant advertisements.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Managing Cookies</h2>
            <p className="text-gray-600">
              You can control or disable cookies through your browser settings. However, please note that 
              disabling essential cookies may affect the functionality of our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Cookies</h2>
            <p className="text-gray-600">
              We may use third-party services such as Google Analytics and social media platforms that set 
              their own cookies. We have no control over these cookies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Updates to This Policy</h2>
            <p className="text-gray-600">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page 
              with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have any questions about our Cookie Policy, please contact us at support@seekon.app 
              or call our customer care at 0700-000-000.
            </p>
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Cookies;

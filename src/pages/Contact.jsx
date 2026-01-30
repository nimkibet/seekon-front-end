import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Contact = () => {
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
          
          <h1 className="text-4xl font-bold text-seekon-midnight mb-4">Contact Us</h1>
          <p className="text-seekon-charcoalGray text-lg">
            Get in touch with our team. We're here to help with any questions or concerns.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-2xl font-semibold text-seekon-midnight mb-6">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-seekon-electricRed rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMail className="w-6 h-6 text-seekon-pureWhite" />
                </div>
                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-1">Email Support</h3>
                  <p className="text-seekon-charcoalGray mb-2">support@seekon-apparel.com</p>
                  <p className="text-sm text-seekon-charcoalGray">We typically respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-seekon-electricRed rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiPhone className="w-6 h-6 text-seekon-pureWhite" />
                </div>
                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-1">Phone Support</h3>
                  <p className="text-seekon-charcoalGray mb-2">+1 (555) 123-4567</p>
                  <p className="text-sm text-seekon-charcoalGray">Mon-Fri: 9AM-6PM EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-seekon-electricRed rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiMapPin className="w-6 h-6 text-seekon-pureWhite" />
                </div>
                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-1">Visit Our Store</h3>
                  <p className="text-seekon-charcoalGray mb-2">123 Fashion St, NY 10001</p>
                  <p className="text-sm text-seekon-charcoalGray">Open 7 days a week</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-seekon-electricRed rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiClock className="w-6 h-6 text-seekon-pureWhite" />
                </div>
                <div>
                  <h3 className="font-semibold text-seekon-midnight mb-1">Business Hours</h3>
                  <p className="text-seekon-charcoalGray mb-2">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p className="text-sm text-seekon-charcoalGray">Saturday - Sunday: 10:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-seekon-pureWhite p-8 rounded-lg shadow-lg"
          >
            <h2 className="text-2xl font-semibold text-seekon-midnight mb-6">Send us a Message</h2>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-seekon-midnight mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-seekon-platinumSilver rounded-lg focus:outline-none focus:ring-2 focus:ring-seekon-electricRed focus:border-transparent"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-seekon-midnight mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-seekon-platinumSilver rounded-lg focus:outline-none focus:ring-2 focus:ring-seekon-electricRed focus:border-transparent"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-seekon-midnight mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-seekon-platinumSilver rounded-lg focus:outline-none focus:ring-2 focus:ring-seekon-electricRed focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-seekon-midnight mb-2">
                  Subject
                </label>
                <select className="w-full px-4 py-3 border border-seekon-platinumSilver rounded-lg focus:outline-none focus:ring-2 focus:ring-seekon-electricRed focus:border-transparent">
                  <option>General Inquiry</option>
                  <option>Order Support</option>
                  <option>Returns & Exchanges</option>
                  <option>Size Guide</option>
                  <option>Technical Support</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-seekon-midnight mb-2">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-seekon-platinumSilver rounded-lg focus:outline-none focus:ring-2 focus:ring-seekon-electricRed focus:border-transparent"
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-seekon-electricRed text-seekon-pureWhite py-3 px-6 rounded-lg font-semibold hover:bg-seekon-electricRed/90 transition-colors duration-200"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

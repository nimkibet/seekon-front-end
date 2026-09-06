import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiInstagram, FiTruck, FiHeart } from 'react-icons/fi';
import { FaTiktok } from 'react-icons/fa';

const CorporatePage = () => {
  return (
    <div className="min-h-screen bg-seekon-platinumSilver py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Navigation Header */}
        <Link 
          to="/" 
          className="inline-flex items-center text-seekon-midnight hover:text-seekon-charcoalGray transition-colors duration-200 mb-8 font-medium"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-seekon-midnight rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
            <FiHeart className="w-8 h-8 text-seekon-pureWhite animate-pulse-slow" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-seekon-midnight mb-4 tracking-tight">About Seekon Apparel</h1>
          <p className="text-seekon-charcoalGray/85 text-xs font-semibold tracking-wider uppercase">
            Live Bold. Dress Sharper. Walk Your Story.
          </p>
        </motion.div>

        {/* Brand Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Brand Story Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ y: -4 }}
            className="bg-seekon-pureWhite p-8 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between"
          >
            <div>
              <h2 className="text-2xl font-bold text-seekon-midnight mb-4">Our Story & Products</h2>
              <p className="text-seekon-charcoalGray text-sm leading-relaxed mb-6">
                <strong>Seekon Apparel</strong> is Kenya's premier streetwear and footwear destination. We are dedicated to curating an exclusive catalog of high-grade sneakers, designer urban apparel, and unique fashion accessories. We believe fashion is a language—we design and select pieces that enable you to express your identity with style and confidence.
              </p>
            </div>
            <div className="text-xs font-semibold text-seekon-charcoalGray/60 tracking-wider uppercase border-t border-gray-100 pt-4">
              Premium Streetwear & Footwear
            </div>
          </motion.div>

          {/* Delivery & Operations Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ y: -4 }}
            className="bg-seekon-pureWhite p-8 rounded-2xl border border-gray-200/60 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FiTruck className="w-5 h-5 text-seekon-midnight" />
                <h2 className="text-2xl font-bold text-seekon-midnight">Fast-Track Shipping</h2>
              </div>
              <p className="text-seekon-charcoalGray text-sm leading-relaxed mb-6">
                We guarantee rapid, door-to-door shipping to match your lifestyle. Deliveries within Nairobi are completely <strong>FREE</strong> and completed in under <strong>2 hours</strong>. For locations outside Nairobi, courier dispatch is completed within <strong>18 hours</strong>. All orders enjoy a secure <strong>72-hour return and size exchange window</strong> with chargeable return shipping.
              </p>
            </div>
            <div className="text-xs font-semibold text-seekon-charcoalGray/60 tracking-wider uppercase border-t border-gray-100 pt-4">
              2h Nairobi • 18h Nationwide
            </div>
          </motion.div>
        </div>

        {/* Social Connection Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-seekon-pureWhite p-8 rounded-2xl border border-gray-200/60 shadow-sm text-center"
        >
          <h2 className="text-2xl font-bold text-seekon-midnight mb-2">Follow the Story</h2>
          <p className="text-seekon-charcoalGray text-sm mb-6 max-w-xl mx-auto leading-relaxed">
            Our daily drop previews, outfit style guides, and exclusive community events are shared directly across our official social channels.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="https://www.instagram.com/seekon_apparel?igsh=MWg4NzJudDFjZmVrcg%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-seekon-pureWhite text-sm font-medium rounded-xl bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 hover:from-yellow-600 hover:via-pink-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
              style={{ minHeight: "44px", minWidth: "160px" }}
            >
              <FiInstagram className="w-5 h-5 mr-2" />
              <span>Instagram</span>
            </a>

            <a
              href="https://www.tiktok.com/@seekonapparel?_r=1&_t=ZM-91cAgV12dBb"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 text-seekon-pureWhite text-sm font-medium rounded-xl bg-black hover:bg-zinc-900 transition-all duration-200 shadow-sm"
              style={{ minHeight: "44px", minWidth: "160px" }}
            >
              <FaTiktok className="w-4 h-4 mr-2" />
              <span>TikTok</span>
            </a>
          </div>
        </motion.div>
      </div>

      <footer className="mt-20 py-8 text-center text-xs text-seekon-charcoalGray/60 bg-gray-100 border-t border-gray-200">
        © 2026 Seekon Apparel. All rights reserved.
      </footer>
    </div>
  );
};

export default CorporatePage;

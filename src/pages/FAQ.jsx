import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const faqs = [
    {
      question: "What items can I return?",
      answer: "Most items can be returned within 30 days, but some items like underwear, swimwear, and personalized items cannot be returned for hygiene reasons."
    },
    {
      question: "How long do refunds take?",
      answer: "Refunds are processed within 3-5 business days after we receive your return. The refund will appear on your original payment method within 5-10 business days."
    },
    {
      question: "Can I return items to a store?",
      answer: "Yes, you can return online purchases to any of our physical store locations. Bring your order confirmation and the items you want to return."
    },
    {
      question: "What if I lost my return label?",
      answer: "No problem! Contact our customer service team and we'll send you a new return label. You can also print a new one from your account."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600 text-lg">
            Find answers to common questions about returns, refunds, and more.
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="font-semibold text-gray-900 mb-2">{faq.question}</h3>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;

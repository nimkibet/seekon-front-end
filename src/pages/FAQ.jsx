import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHelpCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const faqs = [
    {
      question: "What items can I return?",
      answer: "Most unused items can be returned within 72 hours of successful purchase. For hygiene and safety standards, items such as underwear, swimwear, and custom-tailored apparel cannot be returned."
    },
    {
      question: "Are returns free?",
      answer: "No, return shipping fees are chargeable on all items. Customers are responsible for arranging and paying for return transit costs."
    },
    {
      question: "How long does delivery take?",
      answer: "We deliver within 2 hours of purchase confirmation for locations within Nairobi, and within 18 hours for all destinations outside Nairobi."
    },
    {
      question: "How long do refunds take to process?",
      answer: "Once your returned items arrive at our hub and pass inspection, refunds are processed within 3-5 business days. Depending on your bank or payment method, the credit will reflect within 5-10 business days."
    },
    {
      question: "Can I return items directly to a physical store?",
      answer: "Yes, you can drop off your online purchases at any of our official physical store locations within the 72-hour return window. Please make sure to present your order confirmation email or receipt."
    }
  ];

  return (
    <div className="min-h-screen bg-seekon-platinumSilver py-16 px-4 sm:px-6 lg:px-8">
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
            className="inline-flex items-center text-seekon-midnight hover:text-seekon-charcoalGray transition-colors duration-200 mb-6 font-medium"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <h1 className="text-4xl font-bold text-seekon-midnight mb-4 tracking-tight">Frequently Asked Questions</h1>
          <p className="text-seekon-charcoalGray text-lg max-w-2xl leading-relaxed">
            Quick answers to common questions about our returns, shipping timelines, and policies.
          </p>
        </motion.div>

        {/* FAQ List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {faqs.map((faq, index) => (
            <motion.div 
              key={index} 
              whileHover={{ y: -2 }}
              className="bg-seekon-pureWhite p-6 rounded-xl border border-gray-200/60 shadow-sm"
            >
              <div className="flex items-start">
                <div className="w-6 h-6 rounded-lg bg-seekon-midnight flex items-center justify-center flex-shrink-0 mt-0.5 mr-3">
                  <FiHelpCircle className="w-4 h-4 text-seekon-pureWhite" />
                </div>
                <div>
                  <h3 className="font-bold text-seekon-midnight text-lg mb-2">{faq.question}</h3>
                  <p className="text-seekon-charcoalGray text-sm leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;

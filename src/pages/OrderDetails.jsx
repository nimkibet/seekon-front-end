import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCheckCircle, FiClock, FiUser, FiMapPin, FiCreditCard, FiTruck } from 'react-icons/fi';
import { formatPrice, formatDate } from '../utils/formatPrice';
import { api } from '../utils/api';

const OrderDetails = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Fetch order details from backend
        const orderData = await api.getOrderDetails(orderId);
        setOrder(orderData);
      } catch (error) {
        console.error('Error fetching order details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00A676]"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Order not found
          </h2>
          <Link to="/orders" className="text-[#00A676] hover:text-[#008A5E]">
            Back to My Orders
          </Link>
        </motion.div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    if (status === 'delivered' || status === 'completed') {
      return (
        <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-medium">
          Approved
        </span>
      );
    }
    if (status === 'shipped' || status === 'processing') {
      return (
        <span className="px-4 py-2 bg-yellow-500 text-black rounded-full text-sm font-medium">
          Pending Delivery
        </span>
      );
    }
    return (
      <span className="px-4 py-2 bg-gray-500 text-white rounded-full text-sm font-medium">
        Processing
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link
            to="/orders"
            className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-[#00A676] transition-colors duration-200"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to My Orders</span>
          </Link>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00A676] to-[#008A5E] px-6 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Order Details</h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-white/90 text-sm">
                  <span>Order ID: #{order.id}</span>
                  <span className="hidden sm:block">•</span>
                  <span>{formatDate(order.date)}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(order.status)}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Payment and Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <FiCreditCard className="w-5 h-5 text-[#00A676]" />
                  <span>Payment Info</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Payment Method:</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">{order.paymentMethod || 'M-Pesa'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status:</p>
                    <p className="text-base font-medium text-green-600 dark:text-green-400">Paid</p>
                  </div>
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center space-x-2">
                  <FiTruck className="w-5 h-5 text-[#00A676]" />
                  <span>Shipping Info</span>
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Shipping Method:</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">{order.shippingMethod || 'Standard Delivery'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Address:</p>
                    <p className="text-base font-medium text-gray-900 dark:text-gray-100">{order.shippingAddress || 'New York, USA'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Products
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {order.items?.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FiUser className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatPrice(item.price)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {formatPrice(item.price * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <td colSpan="3" className="px-4 py-4 text-right text-sm font-semibold text-gray-900 dark:text-gray-100">
                        Total
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-lg font-bold text-[#00A676]">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetails;




import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiClock, 
  FiEye, 
  FiStar,
  FiCalendar,
  FiMapPin,
  FiUser,
  FiAlertCircle,
  FiTrash2,
  FiRefreshCw,
  FiShoppingCart
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { formatPrice, formatDate } from '../utils/formatPrice';
import { useCurrency } from '../context/CurrencyContext';
import toast from 'react-hot-toast';
import ReviewModal from '../components/ReviewModal';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';

const MyOrders = () => {
  const { user } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [reviewModal, setReviewModal] = useState({ isOpen: false, product: null, orderId: null });
  const [buyingAgain, setBuyingAgain] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.getOrders();
        // Handle both array response and {success, orders} response
        const ordersData = response.orders || response || [];
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Clear order history (local display only)
  const handleClearHistory = () => {
    setOrders([]);
    setShowClearConfirm(false);
    toast.success('Order history cleared');
  };

  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    // Only show paid orders in the main order history
    if (!order.isPaid && order.status === 'pending') return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['pending', 'processing', 'shipped'].includes(order.status);
    if (activeTab === 'delivered') return order.status === 'delivered';
    return true;
  });

  // Handle Buy Again - add items to cart with correct payload structure
  const handleBuyAgain = async (order) => {
    if (!order?.items?.length) {
      toast.error('No items to add to cart');
      return;
    }

    setBuyingAgain(order._id);
    try {
      const isAuthenticated = !!user;

      // Process all items with correct payload structure
      const addPromises = order.items.map(async (item) => {
        // Extract product ID (handle all possible formats)
        const productId = item.product?._id || item.product || item.id || item.productId;
        if (!productId) {
          console.error('Invalid product ID for item:', item);
          return;
        }

        if (isAuthenticated) {
          // Use addToCartAPI to sync with backend (same as ProductDetail.jsx)
          return dispatch(addToCartAPI({
            product: { id: productId },
            size: item.size || null,
            color: item.color || null,
            quantity: item.quantity
          })).unwrap();
        } else {
          // Use local addToCart with correct payload structure expected by cartSlice
          return dispatch(addToCart({
            product: {
              id: productId,
              name: item.name || 'Unknown Product',
              price: item.price || 0,
              image: item.image || '/placeholder.jpg',
              brand: item.brand || 'Seekon'
            },
            size: item.size || null,
            color: item.color || null,
            quantity: item.quantity
          }));
        }
      });

      // Wait for all items to be processed
      await Promise.all(addPromises.filter(Boolean));

      toast.success(`${order.items.length} items added to cart!`);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding items to cart:', error);
      toast.error('Failed to add items to cart');
    } finally {
      setBuyingAgain(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="w-5 h-5" />;
      case 'processing':
        return <FiPackage className="w-5 h-5" />;
      case 'shipped':
        return <FiTruck className="w-5 h-5" />;
      case 'delivered':
        return <FiCheckCircle className="w-5 h-5" />;
      case 'cancelled':
        return <FiAlertCircle className="w-5 h-5" />;
      default:
        return <FiClock className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleRateAndReview = async (order) => {
    // Debug: Log the full order structure
    console.log("🔥 REVIEW BUTTON CLICKED!");
    console.log("📦 FULL ORDER DATA:", JSON.stringify(order, null, 2));
    
    // Get the first item from the order to review
    const firstItem = order.items?.[0];
    console.log("📦 FIRST ITEM RAW:", JSON.stringify(firstItem, null, 2));
    
    if (!firstItem) {
      toast.error('No product found in this order');
      return;
    }

    // Safely check every common schema variation for the product reference
    const productId = 
      firstItem?.product?._id || 
      firstItem?.product || 
      firstItem?.productId?._id || 
      firstItem?.productId || 
      firstItem?.id; 
    // We intentionally omit item._id here to avoid grabbing the Mongoose array subdocument ID
    console.log("🔍 Attempting extraction. Found ID:", productId);
    
    if (!productId) {
      console.error("❌ Product ID extraction failed. Full Item JSON:", JSON.stringify(firstItem));
      toast.error("Product information not available.");
      return;
    }

    try {
      let product;
      // Check if product is already populated in the order item
      if (firstItem.product && typeof firstItem.product === 'object' && firstItem.product._id) {
        product = firstItem.product;
      } else if (firstItem.productId) {
        // Try fetching by productId if available
        const productResponse = await api.getProduct(firstItem.productId);
        product = productResponse.product || productResponse;
      } else {
        // Fetch the product details from API
        const productResponse = await api.getProduct(productId);
        product = productResponse.product || productResponse;
      }
      
      // Ensure we have the product ID properly set
      const finalProductId = product?._id || product?.id || productId;
      
      if (!finalProductId) {
        toast.error('Unable to get product ID for review');
        return;
      }
      
      setReviewModal({
        isOpen: true,
        product: { ...product, _id: finalProductId },
        orderId: order._id
      });
    } catch (error) {
      console.error('Error fetching product for review:', error);
      toast.error('Failed to load product for review');
    }
  };

  const handleViewDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // Count active orders for badge
  const activeOrdersCount = orders.filter(order => 
    ['shipped', 'processing'].includes(order.status)
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00A676]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                My Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track your shipments and manage your orders
              </p>
            </div>
            {orders.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                Clear History
              </button>
            )}
          </div>
        </motion.div>

        {/* Clear History Confirmation Modal */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-sm w-full shadow-2xl">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Clear Order History?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This will remove all orders from your view. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex overflow-x-auto space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button
            onClick={() => setActiveTab('all')}
            className={`pb-3 px-2 sm:px-1 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-[#00A676] border-b-2 border-[#00A676]'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            All Orders
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 px-2 sm:px-1 font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'active'
                ? 'text-[#00A676] border-b-2 border-[#00A676]'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Active
            {activeOrdersCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeOrdersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('delivered')}
            className={`pb-3 px-2 sm:px-1 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'delivered'
                ? 'text-[#00A676] border-b-2 border-[#00A676]'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'
            }`}
          >
            Delivered
          </button>
        </div>

        {/* Orders List */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
          className="space-y-6"
        >
          {filteredOrders.map((order) => (
            <motion.div
              key={order._id}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Order Header */}
              <div className="bg-gray-50 dark:bg-gray-750 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium border flex items-center gap-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="hidden sm:inline">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                    </span>
                    
                    {/* Order ID */}
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      #{order._id?.slice(-8).toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:space-x-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{order.createdAt ? formatDate(order.createdAt) : 'N/A'}</span>
                      <span className="sm:hidden">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}</span>
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Content */}
              <div className="p-3 sm:p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Order Items */}
                  <div className="lg:col-span-2 space-y-3">
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      Items
                    </h3>
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FiPackage className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                            {item.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                            {item.quantity} × {formatPrice(item.price)}
                            {item.size && <span className="ml-1">• {item.size}</span>}
                            {item.color && <span className="ml-1">• {item.color}</span>}
                          </p>
                        </div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tracking Info / Actions */}
                  <div className="lg:col-span-1 mt-4 lg:mt-0">
                    {/* Tracking Info - Show for shipped/processing orders */}
                    {['shipped', 'processing'].includes(order.status) && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-2 sm:mb-3 text-sm sm:text-base">
                          <FiTruck className="w-4 h-4" />
                          Tracking
                        </h4>
                        
                        {order.expectedArrival && (
                          <div className="mb-3">
                            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                              Expected Arrival
                            </p>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                              {order.expectedArrival}
                            </p>
                          </div>
                        )}

                        {order.deliveryDetails && (
                          <div>
                            <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                              Delivery Details
                            </p>
                            <p className="text-sm text-blue-900 dark:text-blue-100">
                              {order.deliveryDetails}
                            </p>
                          </div>
                        )}

                        {!order.expectedArrival && !order.deliveryDetails && (
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            Tracking information will be available soon.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Delivered - Show Review Button */}
                    {order.status === 'delivered' && (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FiCheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="font-medium text-green-900 dark:text-green-100">
                            Delivered
                          </h4>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Your order has been delivered.
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        onClick={() => handleViewDetails(order._id)}
                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium text-sm sm:text-base"
                      >
                        <FiEye className="w-4 h-4" />
                        <span className="hidden sm:inline">View Details</span>
                        <span className="sm:hidden">Details</span>
                      </button>

                      {/* Rate & Review Button - Only for delivered orders */}
                      {order.status === 'delivered' && (
                        <button
                          onClick={() => handleRateAndReview(order)}
                          className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-[#00A676] hover:bg-[#008A5E] text-white rounded-lg transition-colors font-medium text-sm sm:text-base"
                        >
                          <FiStar className="w-4 h-4" />
                          <span className="hidden sm:inline">Rate & Review</span>
                          <span className="sm:hidden">Review</span>
                        </button>
                      )}

                      {/* Buy Again Button */}
                      <button
                        onClick={() => handleBuyAgain(order)}
                        disabled={buyingAgain === order._id}
                        className="flex-1 flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium text-sm sm:text-base disabled:opacity-50"
                      >
                        {buyingAgain === order._id ? (
                          <FiRefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <FiRefreshCw className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Buy Again</span>
                        <span className="sm:hidden">Again</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={(submitted) => {
          setReviewModal({ isOpen: false, product: null, orderId: null });
          if (submitted) {
            // Optionally refresh orders or show a success message
          }
        }}
        product={reviewModal.product}
        orderId={reviewModal.orderId}
      />
    </div>
  );
};

export default MyOrders;

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiTrash2, FiMinus, FiPlus, FiMapPin, FiSmartphone, FiCreditCard, FiCheckCircle, FiXCircle, FiX, FiTag } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { formatPrice } from '../utils/formatPrice';
import { useCurrency } from '../context/CurrencyContext';
import { clearCartAPI, updateQuantityAPI, removeFromCartAPI, updateCartItemVariant, updateCartItemVariantAPI } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://seekonbackend-production.up.railway.app';

export const shippingOptions = [
  { id: 'nairobi_cbd', label: 'Nairobi CBD / Town', price: 100 },
  { id: 'pick_up_mtaani', label: 'Pick Up Mtaani', price: 150 },
  { id: 'kitengela', label: 'Kitengela (Shipment through REMBO courier)', price: 200 },
  { id: 'thika_juja', label: 'Thika, Juja (Shipment through Super Metro Courier)', price: 200 },
  { id: 'region_1', label: 'REGION 1: Upper-Hill, Statehouse, Rhapta Road, Parklands, Pangani, City Stadium', price: 250 },
  { id: 'region_2', label: 'REGION 2: Nairobi West, Madaraka, South B/C, Mbagathi, Kilimani, Riara Road, Jamhuri, Hurlingham, Yaya, Prestige', price: 300 },
  { id: 'region_3', label: 'Region 3: Kileleshwa, Lavington, Westlands, Mutahiga, Garden Estate, USIU, Ngumba Estate, EABL, All-Soaps', price: 300 },
  { id: 'region_4', label: 'REGION 4: Roysambu, Runda, Nyari Estate, Zimmerman, Kasarani, GM (General Motors), Ngong Racecourse, Langata, Loresho, Kitisuru', price: 350 },
  { id: 'central', label: 'CENTRAL REGION', price: 400 },
  { id: 'coast', label: 'COAST REGION', price: 400 },
  { id: 'eastern', label: 'EASTERN REGION', price: 400 },
  { id: 'nyanza', label: 'NYANZA REGION', price: 400 },
  { id: 'region_5', label: 'REGION 5: Fedha, Imara Daima, Umoja, Donholm, Tajmall, Pipeline, Buruburu, Jacaranda, Thindigwa, Karen, Ruaka, Githurai', price: 400 },
  { id: 'rift_valley', label: 'RIFT VALLEY', price: 400 },
  { id: 'western', label: 'WESTERN REGION', price: 400 },
  { id: 'region_6', label: 'REGION 6: Kikuyu, Kinoo, Muthiga, Kahawa Sukari, Kahawa West, KU, Nyayo Estate, Kayole, Nasra Garden, JKIA, Kerarapon-Karen', price: 450 },
  { id: 'region_7', label: 'REGION 7: Ngong Town, Kiambu, Ruiru, Rongai, Syokiamu', price: 600 }
];

const Checkout = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector(state => state.cart);
  const user = useSelector(state => state.user.user);
  const { products } = useSelector(state => state.products);
  
  // Snap to top on load
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // FIX: Check authentication on mount - redirect if not logged in
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (!token) {
      console.warn("⚠️ No token found on Checkout mount - redirecting to login");
      toast.error("Please log in to checkout");
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  }, [navigate]);

  const [email, setEmail] = useState(user?.email || 'user@seekon.com');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [convenientTime, setConvenientTime] = useState('');
  const [city, setCity] = useState('Nairobi');
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [currentStep, setCurrentStep] = useState(1); // 1: Delivery, 2: Payment, 3: Confirmation
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, loading, success, failed
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef(null);
  
  // FIX ISSUE #3: Store order items before clearing cart for confirmation display
  const [orderConfirmationItems, setOrderConfirmationItems] = useState([]);
  
  // Freeze totals for the final confirmation page so they aren't lost when cart clears
  const [finalOrderTotals, setFinalOrderTotals] = useState({ total: 0, subtotal: 0, shippingCost: 0, discount: 0 });

  useEffect(() => {
    if (currentStep < 3) {
      const totals = calculateTotals();
      setFinalOrderTotals(totals);
    }
  }, [totalPrice, selectedShipping, discountAmount, currentStep]);
  
  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  // Shipping state
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0]);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    if (user?.name) {
      const nameParts = user.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
    }
    if (user?.email) {
      setEmail(user.email);
    }
    if (user?.phoneNumber) {
      setPhoneNumber(user.phoneNumber);
    }
  }, [user]);

  // Handle quantity change in checkout
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity <= 0 || newQuantity > 99) return;
    
    // Extract ID safely based on how the cart stores it
    const productId = item.productId?._id || item.productId || item.product?._id || item.id || item._id;
    
    try {
      await dispatch(updateQuantityAPI({ 
        productId, 
        size: item.size, 
        color: item.color, 
        quantity: newQuantity 
      })).unwrap();
    } catch(err) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  // Handle item removal from checkout
  const handleRemoveItem = async (item) => {
    const productId = item.productId?._id || item.productId || item.product?._id || item.id || item._id;

    try {
      await dispatch(removeFromCartAPI({
        productId,
        size: item.size,
        color: item.color
      })).unwrap();

      toast.success('Item removed from checkout');
      // If this was the last item, kick them back to the empty cart page
      if (items.length <= 1) {
        navigate('/cart');
      }
    } catch(err) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !phoneNumber || !deliveryDate || !address) {
      toast.error('Please fill in all required fields');
      return;
    }
    setCurrentStep(2);
    toast.success('Proceeding to payment...');
  };

  const handlePayment = async () => {
    try {
      // CRITICAL: Validate cart is not empty before making API call
      if (!items || items.length === 0) {
        toast.error('Cart is empty! Please add items to your cart before checkout.');
        navigate('/cart');
        return;
      }
      
      setPaymentStatus('loading');
      
      // Set flag to hide 3D background during payment processing to prevent WebGL issues
      sessionStorage.setItem('isPaymentProcessing', 'true');
      window.dispatchEvent(new Event('paymentStateChange'));
      
      // FIX: Get token from multiple sources for reliability
      // Priority: 1. Redux state user object (user?.token) 2. localStorage 3. sessionStorage
      // The user variable is already selected from Redux at component level (line 38)
      let token = 
        user?.token || 
        localStorage.getItem('token') || 
        localStorage.getItem('adminToken') ||
        sessionStorage.getItem('token');
      
      if (!token) {
        console.error("🚨 AUTH ERROR: No token found in Redux user or any storage!");
        console.error("User object:", user);
        toast.error("Please log in to complete your purchase");
        navigate('/login', { state: { from: { pathname: '/checkout' } } });
        return;
      }
      
      console.log("✅ Token found, proceeding with payment...", token.substring(0, 15) + "...");
      
      // Create order FIRST before payment
      // FIX: Ensure product ID is included in payload
      const orderData = {
        items: items.map(item => {
          // Aggressively extract product ID from cart item
          const extractedId = item.productId || item.id || item._id;
          
          if (!extractedId) {
            console.error("🚨 FRONTEND PAYLOAD ERROR: Cannot find product ID for item:", item);
          }
          
          return {
            product: extractedId, // Include product ID for backend schema
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size,
            color: item.color
          };
        }),
        totalAmount: calculateTotals().total,
        paymentMethod: paymentMethod === 'mpesa' ? 'M-Pesa' : 'Card',
        shippingAddress: {
          firstName,
          lastName,
          address,
          city: selectedShipping.label,
          zipCode: '',
          phone: phoneNumber
        },
        deliveryDate,
        convenientTime,
        shippingPrice: selectedShipping.price,
        shippingMethod: selectedShipping.label
      };

      // Create the order first
      console.log("🔐 Creating order with token:", token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
      console.log("🔐 Authorization header:", `Bearer ${token ? token.substring(0, 20) : 'undefined'}...`);
      
      const orderResponse = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      console.log("📡 Order response status:", orderResponse.status);
      console.log("📡 Order response headers:", [...orderResponse.headers.entries()]);

      // Handle 401 Unauthorized - clear tokens and redirect to login
      if (orderResponse.status === 401) {
        const errorData = await orderResponse.json();
        console.error('🚨 401 Unauthorized from order API:', errorData);
        console.error('🚨 Token being used:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        console.error('🚨 User from Redux:', user);
        
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        toast.error('Session expired. Please log in again.');
        navigate('/login', { state: { from: { pathname: '/checkout' } } });
        return;
      }

      const orderResult = await orderResponse.json();
      
      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create order');
      }

      const createdOrder = orderResult.order;
      setCurrentOrderId(createdOrder._id);

      if (paymentMethod === 'mpesa') {
        if (!phoneNumber) {
          toast.error('Please enter your M-Pesa phone number');
          setPaymentStatus('failed');
          return;
        }
        
        const response = await fetch(`${API_URL}/api/payment/mpesa`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            phoneNumber,
            amount: calculateTotals().total,
            userEmail: email,
            orderId: createdOrder._id,
            couponCode: appliedCoupon ? appliedCoupon.couponCode : null
          })
        });

        const data = await response.json();
        
        if (data.success) {
          // STK Push sent - start STRICT polling for payment status
          // CRITICAL: Do NOT redirect here - wait for payment
          if (createdOrder._id && !data.mock) {
            // Store checkoutRequestId for manual verification
            setCheckoutRequestId(data.checkoutRequestID);
            toast.success('STK Prompt sent! Check your phone to enter PIN.');
            // Start polling - this will handle the redirect when paid
            await startStrictPolling(createdOrder._id, token);
          } else {
            // Mock mode - just show success
            setPaymentStatus('success');
            toast.success('Payment successful!');
            // FIX ISSUE #3: Store items before clearing cart for confirmation display
            setOrderConfirmationItems([...items]);
            // Auto-clear cart on successful payment
            dispatch(clearCartAPI());
            setTimeout(() => {
              setCurrentStep(3); // Move to confirmation
            }, 2000);
          }
        } else {
          throw new Error(data.message);
        }
      } else if (paymentMethod === 'card') {
        if (!cardNumber || !cardHolder || !expiryDate || !cvv) {
          toast.error('Please fill in all card details');
          setPaymentStatus('failed');
          return;
        }
        
        // Simulate card payment (replace with actual payment gateway integration)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setPaymentStatus('success');
        toast.success('Payment successful!');
        // FIX ISSUE #3: Store items before clearing cart for confirmation display
        setOrderConfirmationItems([...items]);
        // Auto-clear cart on successful payment
        dispatch(clearCartAPI());
        setTimeout(() => {
          setCurrentStep(3); // Move to confirmation
        }, 2000);
      }
    } catch (error) {
      setPaymentStatus('failed');
      stopPolling();
      clearPaymentFlag(); // Clear the 3D background flag
      toast.error(error.message || 'Payment failed. Please try again.');
    }
  };

  // STRICT POLLING: Check every 3 seconds until payment is confirmed - timeout after 2 minutes
  const startStrictPolling = async (orderId, token) => {
    setIsPolling(true);
    let attempts = 0;
    const maxAttempts = 40; // Check for ~2 minutes (40 * 3 seconds = 120 seconds)
    
    // Clear any existing polling
    stopPolling();
    
    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      try {
        const { data } = await axios.get(`${API_URL}/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const order = data.order;
        
        // Check for cancelled status first (payment failed)
        if (order && order.status === 'cancelled') {
          stopPolling();
          setPaymentStatus('failed');
          clearPaymentFlag(); // Clear the 3D background flag
          // Show the specific error message from M-Pesa callback
          toast.error('Payment Failed: Invalid Initiator Information. Please check your M-Pesa PIN and try again.');
          return; // Exit the polling loop
        }
        
        // Check if payment is completed (isPaid is true)
        // Note: Backend uses 'isPaid' flag, not status === 'completed'
        if (order && order.isPaid) {
          stopPolling();
          setPaymentStatus('success');
          clearPaymentFlag(); // Clear the 3D background flag
          toast.success('Payment Received Successfully!');
          // FIX ISSUE #3: Store items before clearing cart for confirmation display
          setOrderConfirmationItems([...items]);
          // Auto-clear cart on successful payment
          dispatch(clearCartAPI());
          // Move to confirmation step (which acts as success page)
          setTimeout(() => {
            setCurrentStep(3); // Move to confirmation
          }, 1500);
          return; // Exit the polling loop
        }
      } catch (e) {
        // Silently continue polling - don't show error for network issues
        // Just wait patiently for the payment confirmation
      }
      
      // Timeout after ~2 minutes - treat as failed but stay on page
      if (attempts >= maxAttempts) {
        stopPolling();
        setPaymentStatus('failed');
        clearPaymentFlag(); // Clear the 3D background flag
        toast.error('Payment timed out. Please check your phone and try again, or use a different number.');
        // User stays on this page to retry with different phone number
      }
    }, 3000); // Check every 3 seconds
  };

  // Manual M-Pesa Payment Verification - Fallback when callbacks fail
  const handleVerifyPayment = async () => {
    if (!checkoutRequestId || !currentOrderId) {
      toast.error('No payment session found. Please try again.');
      return;
    }

    // FIX: Check both 'token' and 'adminToken' keys for compatibility
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    
    if (!token) {
      console.error("🚨 AUTH ERROR: No token found in handleVerifyPayment!");
      toast.error("Please log in to verify payment");
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    
    try {
      toast.loading('Verifying payment...', { id: 'verify' });
      
      const response = await axios.post(
        `${API_URL}/api/payment/mpesa/query`,
        {
          checkoutRequestId,
          orderId: currentOrderId
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      toast.remove('verify');

      if (response.data.success) {
        stopPolling();
        setPaymentStatus('success');
        toast.success('Payment verified successfully!');
        // FIX ISSUE #3: Store items before clearing cart for confirmation display
        setOrderConfirmationItems([...items]);
        // Auto-clear cart on successful payment
        dispatch(clearCartAPI());
        setTimeout(() => {
          setCurrentStep(3); // Move to confirmation
        }, 1500);
      } else {
        toast.error(response.data.message || 'Payment verification failed');
      }
    } catch (error) {
      toast.remove('verify');
      console.error('Payment verification error:', error);
      toast.error(error.response?.data?.message || 'Failed to verify payment. Please try again.');
    }
  };

  // Legacy polling function kept for backward compatibility
  const startPolling = (orderId, token) => {
    startStrictPolling(orderId, token);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  };
  
  // Clear payment processing flag from session storage
  const clearPaymentFlag = () => {
    sessionStorage.removeItem('isPaymentProcessing');
    window.dispatchEvent(new Event('paymentStateChange'));
  };

  // Manual cancel - user wants to stop waiting for M-Pesa
  const handleManualCancel = () => {
    stopPolling();
    clearPaymentFlag(); // Clear the 3D background flag
    setCheckoutRequestId(null);
    setPaymentStatus('idle');
    toast.info("Payment verification stopped. You can try again.", { duration: 3000 });
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  const handleCompleteOrder = () => {
    toast.success('Order completed successfully!');
    // Redirect to order details page with the order ID
    if (currentOrderId) {
      navigate(`/orders/${currentOrderId}`);
    } else {
      navigate('/orders');
    }
  };

  const calculateTotals = () => {
    const subtotal = totalPrice;
    const shippingCost = selectedShipping ? selectedShipping.price : 0;
    const total = subtotal + shippingCost - discountAmount;
    return { subtotal, shippingCost, total, discount: discountAmount };
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const response = await api.applyCoupon(couponCode, totalPrice);
      setAppliedCoupon(response);
      setDiscountAmount(response.discountAmount);
      toast.success(response.message || 'Coupon applied successfully!', {
        icon: '🎟️'
      });
    } catch (error) {
      console.error('Coupon error:', error);
      toast.error(error.message || 'Invalid coupon code');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode('');
    setAppliedCoupon(null);
    setDiscountAmount(0);
    toast.success('Coupon removed');
  };

  const { subtotal, shippingCost, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Dynamic Back Button */}
          {currentStep < 3 && (
            <button 
              onClick={() => currentStep === 2 ? setCurrentStep(1) : navigate('/cart')}
              disabled={paymentStatus === 'loading' || isPolling}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">{currentStep === 2 ? 'Back to Delivery Details' : 'Back to Cart'}</span>
            </button>
          )}
          
          {/* Breadcrumb */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Homepage / {items[0]?.category || 'Products'} / Checkout
          </p>

          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {['Delivery', 'Payment', 'Confirmation'].map((step, index) => {
              const stepNumber = index + 1;
              const isCompleted = stepNumber < currentStep;
              const isCurrent = stepNumber === currentStep;
              
              return (
                <div key={step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      disabled={!isCompleted || currentStep === 3 || paymentStatus === 'loading' || isPolling}
                      onClick={() => isCompleted && currentStep === 2 ? setCurrentStep(1) : null}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isCompleted || isCurrent
                          ? 'bg-black border-black text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-400 bg-white dark:bg-gray-800'
                      } ${isCompleted && currentStep !== 3 ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                    >
                      <span className="font-bold text-lg">{stepNumber}</span>
                    </button>
                    <span className={`text-sm mt-2 font-medium ${
                      isCompleted || isCurrent ? 'text-[#00A676]' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`w-20 h-1 mx-4 transition-colors ${
                      isCompleted
                        ? 'bg-black'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Conditional Rendering Based on Current Step */}
        {currentStep === 1 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Delivery Forms */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676] transition-all"
                      placeholder="e.g. John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676] transition-all"
                      placeholder="e.g. Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676] transition-all"
                    placeholder="john.doe@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number (M-Pesa)
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676] transition-all"
                    placeholder="254 712 345 678"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter your M-Pesa number (e.g. 254 712 345 678)
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Delivery Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Delivery Date
                    </label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676] transition-all"
                      placeholder="Select date"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Convenient Time
                    </label>
                    <div className="relative">
                      <FiClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="time"
                        value={convenientTime}
                        onChange={(e) => setConvenientTime(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676] transition-all"
                        placeholder="e.g. 2:00 PM"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Town / Collection Point
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676] transition-all"
                      placeholder="e.g. Nairobi CBD, Kitengela, Thika"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter your town or nearest collection point
                  </p>
                </div>
              </div>
            </div>

            {/* Shipping Method */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Shipping Method</h2>
              <div className="border border-gray-300 dark:border-gray-600 rounded-md divide-y divide-gray-300 dark:divide-gray-600 max-h-96 overflow-y-auto">
                {shippingOptions.map((option) => (
                  <label 
                    key={option.id} 
                    className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                      selectedShipping.id === option.id ? 'bg-black/10 dark:bg-black/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="shipping" 
                        className="w-4 h-4 text-[#00A676] focus:ring-[#00A676] border-gray-300 dark:border-gray-500"
                        checked={selectedShipping.id === option.id}
                        onChange={() => setSelectedShipping(option)}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{option.label}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Ksh {option.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            </div>

              {/* Proceed to Payment Button */}
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Proceed to Payment</span>
                <FiArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </motion.div>

            {/* Right Column - Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Order</h2>
                
                {/* Product Listings */}
                <div className="space-y-4 mb-6">
                  {items.map((item, index) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-start space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.brand} • {item.size} • {item.color}</p>
                        
                        {/* Quantity, Size, Color Controls */}
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-600 dark:text-gray-400">Qty:</span>
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleQuantityChange(item, item.quantity - 1)}
                                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <FiMinus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => handleQuantityChange(item, item.quantity + 1)}
                                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <FiPlus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {(() => {
                              // Find product to get available sizes and colors
                              const product = products.find(p => p.id === item.id || p._id === item.id);
                              const availableSizes = product?.sizes || [];
                              const availableColors = product?.colors || [];
                              
                              return (
                                <>
                                  <select
                                    value={item.size || ''}
                                    onChange={(e) => {
                                      const newSize = e.target.value;
                                      // FIX ISSUE #2: Update both local state AND sync with backend API
                                      dispatch(updateCartItemVariant({ 
                                        cartItemId: item.id, 
                                        newSize, 
                                        newColor: item.color 
                                      }));
                                      // Also call API to sync with backend for logged-in users
                                      dispatch(updateCartItemVariantAPI({
                                        productId: item.id || item.productId,
                                        size: newSize,
                                        color: item.color
                                      }));
                                    }}
                                    className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                  >
                                    {availableSizes.length > 0 ? (
                                      availableSizes.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                      ))
                                    ) : (
                                      <option>{item.size || 'N/A'}</option>
                                    )}
                                  </select>
                                  <select
                                    value={item.color || ''}
                                    onChange={(e) => {
                                      const newColor = e.target.value;
                                      // FIX ISSUE #2: Update both local state AND sync with backend API
                                      dispatch(updateCartItemVariant({ 
                                        cartItemId: item.id, 
                                        newSize: item.size, 
                                        newColor 
                                      }));
                                      // Also call API to sync with backend for logged-in users
                                      dispatch(updateCartItemVariantAPI({
                                        productId: item.id || item.productId,
                                        size: item.size,
                                        color: newColor
                                      }));
                                    }}
                                    className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                  >
                                    {availableColors.length > 0 ? (
                                      availableColors.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                      ))
                                    ) : (
                                      <option>{item.color || 'N/A'}</option>
                                    )}
                                  </select>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <button 
                          onClick={() => handleRemoveItem(item)}
                          className="text-red-500 hover:text-red-600 transition-colors"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                        <p className="font-bold text-gray-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Order Totals */}
                <div className="space-y-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  {/* Coupon Input */}
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter promo code"
                          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#00A676] focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                      <button
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                        className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <FiCheckCircle className="text-green-600 dark:text-green-400" />
                        <span className="text-green-800 dark:text-green-200 font-medium text-sm">
                          {appliedCoupon.couponCode} applied (-{formatPrice(appliedCoupon.discountAmount)})
                        </span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-green-600 dark:text-green-400 hover:text-red-500 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 dark:text-green-400">Discount</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-[#00A676]">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Payment Step */}
        {currentStep === 2 && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Payment</h2>
              
              {/* Payment Methods */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mpesa')}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                      paymentMethod === 'mpesa'
                        ? 'border-black bg-black/10'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <FiSmartphone className="text-4xl mb-2" />
                    <span className="font-semibold text-gray-900 dark:text-white">M-Pesa</span>
                    <span className="text-xs text-gray-500 mt-1">Mobile Money</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    disabled={true}
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all opacity-60 cursor-not-allowed ${
                      paymentMethod === 'card'
                        ? 'border-black bg-black/10'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <FiCreditCard className="text-4xl mb-2" />
                    <span className="font-semibold text-gray-900 dark:text-white">Card</span>
                    <span className="text-xs text-gray-500 mt-1">Credit/Debit <span className="text-xs text-gray-500 italic ml-1">(Coming Soon)</span></span>
                  </button>
                </div>
              </div>

              {paymentMethod === 'mpesa' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number (M-Pesa)
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676]"
                      placeholder="254 712 345 678"
                      disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Using test number: 254708374149 (Safaricom sandbox)
                  </p>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  {/* Coming Soon Notice */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6 text-center">
                    <p className="text-lg font-semibold text-amber-800 dark:text-amber-200 mb-2">🚧 Card Payments Coming Soon!</p>
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      We're currently working on integrating card payments. Please use M-Pesa for now.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Status */}
              {isPolling && paymentMethod === 'mpesa' && (
                <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-pulse rounded-full h-4 w-4 bg-yellow-500"></div>
                    <div>
                      <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                        Waiting for M-Pesa Payment...
                      </p>
                      <p className="text-yellow-600 dark:text-yellow-300 text-sm">
                        Check your phone and enter your PIN to complete payment
                      </p>
                    </div>
                  </div>
                  {/* Verify Payment Status Button */}
                  {checkoutRequestId && (
                    <button
                      onClick={handleVerifyPayment}
                      className="w-full mt-4 bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                    >
                      <FiSmartphone className="w-4 h-4" />
                      <span>Verify Payment Status</span>
                    </button>
                  )}
                  {/* Manual Cancel Button */}
                  <button
                    onClick={handleManualCancel}
                    className="w-full mt-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                  >
                    Cancel or try again
                  </button>
                </div>
              )}

              {paymentStatus === 'loading' && !isPolling && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <p className="text-blue-600 dark:text-blue-400">Processing payment...</p>
                  </div>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiCheckCircle className="text-green-600 w-5 h-5" />
                    <p className="text-green-600 dark:text-green-400">Payment successful!</p>
                  </div>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <FiXCircle className="text-red-600 w-5 h-5" />
                    <p className="text-red-600 dark:text-red-400">Payment timed out. Please try again below.</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Didn't receive the M-Pesa prompt? Check your phone number and try again, or use a different number.
                  </p>
                  <button
                    onClick={() => {
                      setPaymentStatus('idle');
                    }}
                    className="w-full bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Quick Fill Button for Testing */}
              {paymentMethod === 'card' && paymentStatus === 'idle' && (
                <button
                  type="button"
                  onClick={() => {
                    setCardNumber('4111 1111 1111 1111');
                    setCardHolder('John Doe');
                    setExpiryDate('12/25');
                    setCvv('123');
                  }}
                  className="w-full mt-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-lg transition-all"
                >
                  🎯 Quick Fill Demo Card
                </button>
              )}

              {/* Pay Now Button */}
              <button
                onClick={handlePayment}
                disabled={paymentStatus === 'loading' || paymentStatus === 'success' || isPolling}
                className="w-full mt-6 bg-black hover:bg-gray-800 text-white transition-colors duration-300 font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPolling ? 'Waiting for Payment...' : paymentStatus === 'loading' ? 'Processing...' : 'Pay Now'}
              </button>
            </motion.div>

            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:sticky lg:top-8 h-fit"
            >
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Your Order</h2>
                
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                      <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.brand}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatPrice(shippingCost)}</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-[#00A676]">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Confirmation Step */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Order Confirmed!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Thank you for your purchase. Your order has been successfully placed.
              </p>
              <div className="space-y-4 mb-8">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 text-left border border-gray-200 dark:border-gray-700">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Order Receipt</h3>
                  
                  {/* Render actual bought items */}
                  <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                    {orderConfirmationItems.map((item, idx) => (
                      <div key={`${item.id}-${idx}`} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">{item.quantity}x {item.name}</span>
                        <span className="text-gray-900 dark:text-white font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Render Frozen Totals */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">{formatPrice(finalOrderTotals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                      <span className="text-gray-900 dark:text-white">{formatPrice(finalOrderTotals.shippingCost)}</span>
                    </div>
                    {finalOrderTotals.discount > 0 && (
                      <div className="flex justify-between text-sm text-[#00A676]">
                        <span>Discount</span>
                        <span>-{formatPrice(finalOrderTotals.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white">Total Paid</span>
                      <span className="text-[#00A676]">{formatPrice(finalOrderTotals.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {currentOrderId && (
                  <button
                    onClick={() => navigate(`/orders/${currentOrderId}`)}
                    className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    View Order Details
                  </button>
                )}
                <button
                  onClick={handleCompleteOrder}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-bold py-4 px-6 rounded-lg transition-all duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkout;

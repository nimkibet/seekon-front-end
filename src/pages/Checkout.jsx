import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiTrash2, FiMinus, FiPlus, FiMapPin, FiCreditCard, FiCheckCircle, FiXCircle, FiTag } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { formatPrice } from '../utils/formatPrice';
import { useCurrency } from '../context/CurrencyContext';
import { clearCartAPI, updateQuantityAPI, removeFromCartAPI, updateCartItemVariant, updateCartItemVariantAPI } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { api } from '../utils/api';

const API_URL = import.meta.env.VITE_API_URL || 'https://seekonbackend-production-da47.up.railway.app';
const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

const loadPaystackScript = () =>
  new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.body.appendChild(script);
  });

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

// Color mapping helper
const getColorHex = (colorName) => {
  const colors = {
    black: '#000000',
    white: '#ffffff',
    red: '#ef4444',
    blue: '#3b82f6',
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    purple: '#a855f7',
    pink: '#ec4899',
    brown: '#78350f',
    gray: '#6b7280',
    grey: '#6b7280',
    navy: '#1e3a8a',
    beige: '#f5f5dc',
    cream: '#fffdd0',
    tan: '#d2b48c',
    maroon: '#800000',
    burgundy: '#800020',
    turquoise: '#40e0d0',
    teal: '#008080',
    coral: '#ff7f50',
    salmon: '#fa8072',
    olive: '#808000',
    lime: '#84cc16',
    mint: '#98fb98',
    lavender: '#e6e6fa',
    indigo: '#4b0082',
    gold: '#ffd700',
    silver: '#c0c0c0',
    charcoal: '#36454f',
  };
  
  if (!colorName) return '#cccccc';
  const normalizedColor = colorName.toLowerCase().trim();
  return colors[normalizedColor] || colorName;
};

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
  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, loading, success, failed
  const [currentOrderId, setCurrentOrderId] = useState(null);
  
  // FIX ISSUE #3: Store order items before clearing cart for confirmation display
  const [orderConfirmationItems, setOrderConfirmationItems] = useState([]);
  
  // Freeze totals for the final confirmation page so they aren't lost when cart clears
  const [finalOrderTotals, setFinalOrderTotals] = useState({ total: 0, subtotal: 0, shippingCost: 0, discount: 0 });
  
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
      
      // 🔒 FREEZE CART STATE IMMEDIATELY 
      // We take the snapshot BEFORE any API calls. This guarantees the receipt 
      // will be perfectly accurate even if polling takes 2 minutes and Redux clears in the background.
      setOrderConfirmationItems([...items]);
      setFinalOrderTotals(calculateTotals());
      
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
        paymentMethod: 'Paystack',
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

      const totals = calculateTotals();
      const initResponse = await fetch(`${API_URL}/api/payment/paystack/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          orderId: createdOrder._id,
          amount: totals.total,
          email
        })
      });

      const initData = await initResponse.json();
      if (!initResponse.ok || !initData.success) {
        throw new Error(initData.message || 'Failed to initialize payment');
      }

      setPaymentStatus('idle');

      if (!PAYSTACK_PUBLIC_KEY) {
        window.location.href = initData.checkoutUrl;
        return;
      }

      const PaystackPop = await loadPaystackScript();
      const handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email,
        amount: Math.round(totals.total * 100),
        currency: 'KES',
        ref: initData.reference,
        onClose: () => {
          clearPaymentFlag();
          setPaymentStatus('idle');
          toast.error('Payment cancelled');
        },
        callback: (response) => {
          handlePaystackSuccess(response.reference, token);
        }
      });
      handler.openIframe();
    } catch (error) {
      setPaymentStatus('failed');
      clearPaymentFlag();
      toast.error(error.message || 'Payment failed. Please try again.');
    }
  };

  const handlePaystackSuccess = async (reference, token) => {
    try {
      setPaymentStatus('loading');
      const { data } = await axios.get(`${API_URL}/api/payment/paystack/verify`, {
        params: { reference }
      });

      if (!data.success) {
        throw new Error(data.message || 'Payment verification failed');
      }

      setPaymentStatus('success');
      clearPaymentFlag();
      toast.success('Payment successful!');
      dispatch(clearCartAPI());
      setTimeout(() => setCurrentStep(3), 500);
    } catch (error) {
      console.error('Payment verification failed', error);
      setPaymentStatus('failed');
      clearPaymentFlag();
      toast.error(error.response?.data?.message || error.message || 'Payment verification failed');
    }
  };

  const clearPaymentFlag = () => {
    sessionStorage.removeItem('isPaymentProcessing');
    window.dispatchEvent(new Event('paymentStateChange'));
  };

  const handleCompleteOrder = () => {
    toast.success('Order completed successfully!');
    // Redirect to order details page with the order ID
    if (currentOrderId) {
      navigate(`/orders/${currentOrderId}`);
    } else {
      navigate('/orders');
    }
  };

  // Defensive calculation function to handle nested product objects and string prices
  const calculateSubtotal = (items) => {
    if (!items || items.length === 0) return 0;
    
    return items.reduce((total, item) => {
      // 1. Safely find the price (handles both flat items and nested product objects)
      const rawPrice = item.price || item.product?.price || 0;
      
      // 2. Clean the price (removes commas or currency symbols if it's a string)
      const numericPrice = typeof rawPrice === 'string' 
        ? Number(rawPrice.replace(/[^0-9.-]+/g, "")) 
        : Number(rawPrice);

      // 3. Safely find the quantity
      const quantity = Number(item.qty || item.quantity || 1);

      // 4. Add to total (fallback to 0 if something somehow still evaluates to NaN)
      const lineTotal = numericPrice * quantity;
      return total + (isNaN(lineTotal) ? 0 : lineTotal);
    }, 0);
  };

  const calculateTotals = () => {
    // dynamically use the frozen cart only on the final step, otherwise use active cart items
    const itemsToCalculate = currentStep === 3 ? orderConfirmationItems : items;
    
    const subtotal = calculateSubtotal(itemsToCalculate);
    const shippingCost = selectedShipping ? Number(selectedShipping.price) || 0 : 0;
    const total = subtotal + shippingCost - discountAmount;
    return { subtotal, shippingCost, total, discount: discountAmount };
  };

  // Freeze totals for the final confirmation page so they aren't lost when cart clears
  useEffect(() => {
    if (currentStep < 3 && orderConfirmationItems.length > 0) {
      const totals = calculateTotals();
      setFinalOrderTotals(totals);
    }
  }, [orderConfirmationItems, selectedShipping, discountAmount, currentStep]);

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
              disabled={paymentStatus === 'loading'}
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
                      disabled={!isCompleted || currentStep === 3 || paymentStatus === 'loading'}
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
              
              <motion.div className="mb-6 p-6 rounded-xl border-2 border-black bg-black/5">
                <div className="flex items-center gap-4">
                  <FiCreditCard className="text-4xl text-gray-900 dark:text-white" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Paystack</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pay securely with card. Use test card 4084084084084081 in sandbox.
                    </p>
                  </div>
                </div>
              </motion.div>

              {paymentStatus === 'loading' && (
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
                    <p className="text-red-600 dark:text-red-400">Payment failed. Please try again.</p>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Your card was not charged, or verification did not complete.
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

              {/* Pay Now Button */}
              <button
                onClick={handlePayment}
                disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                className="w-full mt-6 bg-black hover:bg-gray-800 text-white transition-colors duration-300 font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentStatus === 'loading' ? 'Processing...' : 'Pay with Paystack'}
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


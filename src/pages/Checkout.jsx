import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTrash2, FiMinus, FiPlus, FiMapPin, FiCreditCard, FiCheckCircle, FiXCircle, FiTag, FiSmartphone } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { formatPrice } from '../utils/formatPrice';
import { useCurrency } from '../context/CurrencyContext';
import { clearCart, clearCartAPI, updateQuantity, updateQuantityAPI, removeFromCart, removeFromCartAPI, updateCartItemVariant, updateCartItemVariantAPI } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { api } from '../utils/api';


const API_URL = import.meta.env.VITE_API_URL || 'https://api.seekonapparelglobal.com';

export const shippingOptions = [
  // Within Nairobi (FREE)
  { id: 'nairobi_cbd', label: 'Nairobi CBD / Town', price: 0 },
  { id: 'region_1', label: 'REGION 1: Upper-Hill, Statehouse, Rhapta Road, Parklands, Pangani, City Stadium', price: 0 },
  { id: 'region_2', label: 'REGION 2: Nairobi West, Madaraka, South B/C, Mbagathi, Kilimani, Riara Road, Jamhuri, Hurlingham, Yaya, Prestige', price: 0 },
  { id: 'region_3', label: 'Region 3: Kileleshwa, Lavington, Westlands, Mutahiga, Garden Estate, USIU, Ngumba Estate, EABL, All-Soaps', price: 0 },
  { id: 'region_4', label: 'REGION 4: Roysambu, Runda, Nyari Estate, Zimmerman, Kasarani, GM (General Motors), Ngong Racecourse, Langata, Loresho, Kitisuru', price: 0 },
  { id: 'region_5', label: 'REGION 5: Fedha, Imara Daima, Umoja, Donholm, Tajmall, Pipeline, Buruburu, Jacaranda, Thindigwa, Karen, Ruaka, Githurai', price: 0 },
  { id: 'region_6', label: 'REGION 6: Kikuyu, Kinoo, Muthiga, Kahawa Sukari, Kahawa West, KU, Nyayo Estate, Kayole, Nasra Garden, JKIA, Kerarapon-Karen', price: 0 },

  // Outside Nairobi (Chargeable)
  { id: 'pick_up_mtaani', label: 'Pick Up Mtaani', price: 150 },
  { id: 'kitengela', label: 'Kitengela (Shipment through REMBO courier)', price: 200 },
  { id: 'thika_juja', label: 'Thika, Juja (Shipment through Super Metro Courier)', price: 200 },
  { id: 'region_7', label: 'REGION 7: Ngong Town, Kiambu, Ruiru, Rongai, Syokiamu', price: 600 },
  { id: 'central', label: 'CENTRAL REGION', price: 400 },
  { id: 'coast', label: 'COAST REGION', price: 400 },
  { id: 'eastern', label: 'EASTERN REGION', price: 400 },
  { id: 'nyanza', label: 'NYANZA REGION', price: 400 },
  { id: 'rift_valley', label: 'RIFT VALLEY', price: 400 },
  { id: 'western', label: 'WESTERN REGION', price: 400 }
];

/** Split "REGION 1: Area, Area..." into title + area list for the shipping picker UI */
const parseShippingLabel = (label) => {
  const colonIndex = label.indexOf(':');
  if (colonIndex === -1) {
    return { title: label, description: null };
  }
  return {
    title: label.slice(0, colonIndex + 1).trim(),
    description: label.slice(colonIndex + 1).trim(),
  };
};

const handleShippingSelect = (option, setters) => {
  const { setSelectedShipping, setAddress, setErrors, hasSubmitted } = setters;
  setSelectedShipping(option);
  if (!option) {
    setAddress('');
    setErrors((prev) => ({
      ...prev,
      shippingRegion: hasSubmitted ? 'Required' : '',
      address: '',
    }));
  } else {
    setErrors((prev) => ({ ...prev, shippingRegion: '' }));
  }
};

// Color mapping helper - No changes needed here
const getColorHex = (colorName) => {
  const colors = {
    black: '#000000', white: '#ffffff', red: '#ef4444', blue: '#3b82f6', green: '#22c55e', yellow: '#eab308', orange: '#f97316', purple: '#a855f7', pink: '#ec4899', brown: '#78350f', gray: '#6b7280', grey: '#6b7280', navy: '#1e3a8a', beige: '#f5f5dc', cream: '#fffdd0', tan: '#d2b48c', maroon: '#800000', burgundy: '#800020', turquoise: '#40e0d0', teal: '#008080', coral: '#ff7f50', salmon: '#fa8072', olive: '#808000', lime: '#84cc16', mint: '#98fb98', lavender: '#e6e6fa', indigo: '#4b0082', gold: '#ffd700', silver: '#c0c0c0', charcoal: '#36454f',
  };
  if (!colorName) return '#cccccc';
  const normalizedColor = colorName.toLowerCase().trim();
  return colors[normalizedColor] || colorName;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector(state => state.cart);
  const user = useSelector(state => state.user.user);
  const { products } = useSelector(state => state.products);

  const stepContainerRef = useRef(null);
  const stepRefs = useRef([]);

  const [currentStep, setCurrentStep] = useState(1); // 1: Delivery, 2: Payment, 3: Confirmation

  useEffect(() => {
    const activeStepElement = stepRefs.current[currentStep - 1];
    if (activeStepElement) {
      activeStepElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [currentStep]);
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // const [city, setCity] = useState('Nairobi'); // No longer needed, use selectedShipping.label
  const [address, setAddress] = useState('');
  const [zipCode, setZipCode] = useState(''); // Keep for potential future use or if backend expects it

  const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, loading, success, failed
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [isWaitingForMpesa, setIsWaitingForMpesa] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  // State for form validation errors
  const [errors, setErrors] = useState({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const [orderConfirmationItems, setOrderConfirmationItems] = useState([]);
  const [finalOrderTotals, setFinalOrderTotals] = useState({ total: 0, subtotal: 0, shippingCost: 0, discount: 0 });
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [currentStep]);

  useEffect(() => {
    if (user?.name) {
      const nameParts = user.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
    }
    if (user?.email) setEmail(user.email);
    if (user?.phoneNumber) setPhoneNumber(user.phoneNumber);
  }, [user]);

  // Handle quantity change in checkout
  const handleQuantityChange = async (item, newQuantity) => {
    if (newQuantity <= 0 || newQuantity > 99) return;
    const productId = item.productId?._id || item.productId || item.product?._id || item.id || item._id;
    try {
      if (isAuthenticated) {
        await dispatch(updateQuantityAPI({ productId, size: item.size, color: item.color, quantity: newQuantity })).unwrap();
      } else {
        dispatch(updateQuantity({ id: productId, size: item.size, color: item.color, quantity: newQuantity }));
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update quantity');
    }
  };

  // Handle item removal from checkout
  const handleRemoveItem = async (item) => {
    const productId = item.productId?._id || item.productId || item.product?._id || item.id || item._id;
    try {
      if (isAuthenticated) {
        await dispatch(removeFromCartAPI({ productId, size: item.size, color: item.color })).unwrap();
      } else {
        dispatch(removeFromCart({ id: productId, size: item.size, color: item.color }));
      }
      toast.success('Item removed from checkout');
      if (items.length <= 1) navigate('/cart');
    } catch (err) {
      toast.error(err.message || 'Failed to remove item');
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setHasSubmitted(true); // Mark as submitted to trigger validation

    const validationErrors = {};
    if (!firstName.trim()) validationErrors.firstName = 'Required';
    if (!lastName.trim()) validationErrors.lastName = 'Required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      validationErrors.email = 'Required';
    } else if (!emailRegex.test(email.trim())) {
      validationErrors.email = 'Invalid email format';
    }

    if (!phoneNumber.trim()) validationErrors.phoneNumber = 'Required';
    if (!selectedShipping) validationErrors.shippingRegion = 'Required';
    if (selectedShipping && !address.trim()) validationErrors.address = 'Required';

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setCurrentStep(2);
      toast.success('Proceeding to payment...');
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const pollOrderStatus = (orderId) => {
    let attempts = 0;
    const maxAttempts = 20; // 60 seconds / 3 seconds = 20 attempts
    setIsWaitingForMpesa(true);
    setPaymentStatus('loading');

    const interval = setInterval(async () => {
      attempts++;
      try {
        const token = user?.token || localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
        const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
        
        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
          headers: authHeaders
        });
        const data = await response.json();
        
        if (data.success) {
          const status = data.order.status.toLowerCase();
          const isPaid = data.order.isPaid;
          
          if (['paid', 'processing', 'shipped', 'delivered', 'completed'].includes(status) || isPaid) {
            clearInterval(interval);
            setIsWaitingForMpesa(false);
            setPaymentStatus('success');
            
            // Clear cart
            if (isAuthenticated) {
              dispatch(clearCartAPI());
            } else {
              dispatch(clearCart());
            }
            
            toast.success('Payment confirmed!');
            setTimeout(() => setCurrentStep(3), 500);
          } else if (['failed', 'cancelled'].includes(status)) {
            clearInterval(interval);
            setIsWaitingForMpesa(false);
            setPaymentStatus('failed');
            toast.error('Payment was not successful.');
          }
        }
      } catch (error) {
        console.error('Error polling order status:', error);
      }
      
      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setIsWaitingForMpesa(false);
        setPaymentStatus('failed');
        toast.error('Payment timeout. If you paid, please check your orders later.');
      }
    }, 3000);

    // Clean up interval on unmount if component unmounts during polling
    return () => clearInterval(interval);
  };

  const handlePayment = async () => {
    try {
      if (!items || items.length === 0) {
        toast.error('Cart is empty! Please add items to your cart before checkout.');
        navigate('/cart');
        return;
      }

      setOrderConfirmationItems([...items]);
      setFinalOrderTotals(calculateTotals());
      setPaymentStatus('loading');
      sessionStorage.setItem('isPaymentProcessing', 'true');
      window.dispatchEvent(new Event('paymentStateChange'));

      const token = user?.token || localStorage.getItem('token') || sessionStorage.getItem('token') || localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

      const orderData = {
        contactEmail: email.trim(),
        email: email.trim(),
        items: items.map(item => {
          const extractedId = item.productId || item.id || item._id;
          if (!extractedId) console.error("🚨 FRONTEND PAYLOAD ERROR: Cannot find product ID for item:", item);
          return {
            product: extractedId, name: item.name, price: item.price,
            quantity: item.quantity, image: item.image, size: item.size, color: item.color
          };
        }),
        totalAmount: calculateTotals().total,
        paymentMethod: 'M-Pesa',
        shippingAddress: {
          firstName,
          lastName,
          address: `${address.trim()} (${selectedShipping.label})`,
          city: selectedShipping.label,
          phone: phoneNumber
        },
        shippingPrice: selectedShipping.price,
        shippingMethod: selectedShipping.label
      };

      const orderResponse = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(orderData)
      });

      if (orderResponse.status === 401 && token) {
        localStorage.removeItem('token');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('adminToken');
        sessionStorage.removeItem('user');
        toast.error('Session expired. Please log in again.');
        navigate('/login?redirect=/checkout', { state: { from: { pathname: '/checkout' } } });
        return;
      }
      
      const orderResult = await orderResponse.json();
      if (!orderResult.success) throw new Error(orderResult.message || 'Failed to create order');

      setCurrentOrderId(orderResult.order._id);
      setPaymentStatus('success');
      sessionStorage.removeItem('isPaymentProcessing');
      window.dispatchEvent(new Event('paymentStateChange'));
      
      // Clear cart
      if (isAuthenticated) {
        dispatch(clearCartAPI());
      } else {
        dispatch(clearCart());
      }
      
      toast.success('Order placed successfully! Confirmations sent.');
      setTimeout(() => setCurrentStep(3), 1500);

    } catch (error) {
      setPaymentStatus('failed');
      sessionStorage.removeItem('isPaymentProcessing');
      window.dispatchEvent(new Event('paymentStateChange'));
      toast.error(error.message || 'Fulfillment request failed. Please try again.');
    }
  };

  const clearPaymentFlag = () => {
    sessionStorage.removeItem('isPaymentProcessing');
    window.dispatchEvent(new Event('paymentStateChange'));
  };

  const handleCompleteOrder = () => {
    toast.success('Order completed successfully!');
    if (currentOrderId) navigate(`/orders/${currentOrderId}`);
    else navigate('/orders');
  };

  const calculateSubtotal = (items) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((total, item) => {
      const rawPrice = item.price || item.product?.price || 0;
      const numericPrice = typeof rawPrice === 'string' ? Number(rawPrice.replace(/[^0-9.-]+/g, "")) : Number(rawPrice);
      const quantity = Number(item.qty || item.quantity || 1);
      const lineTotal = numericPrice * quantity;
      return total + (isNaN(lineTotal) ? 0 : lineTotal);
    }, 0);
  };

  const calculateTotals = () => {
    const itemsToCalculate = currentStep === 3 ? orderConfirmationItems : items;
    const subtotal = calculateSubtotal(itemsToCalculate);
    const shippingCost = selectedShipping ? Number(selectedShipping.price) || 0 : 0;
    const total = subtotal + shippingCost - discountAmount;
    return { subtotal, shippingCost, total, discount: discountAmount };
  };

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
      toast.success(response.message || 'Coupon applied successfully!', { icon: '🎟️' });
    } catch (error) {
      console.error('Coupon error:', error);
      toast.error(error.message || 'Invalid coupon code');
      setAppliedCoupon(null); setDiscountAmount(0);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setCouponCode(''); setAppliedCoupon(null); setDiscountAmount(0);
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

          {/* Progress Steps with sliding indicator & mobile centering scroll */}
          <div 
            ref={stepContainerRef}
            className="flex items-center justify-start md:justify-center overflow-x-auto scrollbar-none py-4 px-2 max-w-full mb-8 relative"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="flex items-center space-x-1 sm:space-x-4 mx-auto">
              {['Delivery', 'Payment', 'Confirmation'].map((step, index) => {
                const stepNumber = index + 1;
                const isCompleted = stepNumber < currentStep;
                const isCurrent = stepNumber === currentStep;

                return (
                  <div 
                    key={step} 
                    ref={el => stepRefs.current[index] = el}
                    className="flex items-center shrink-0"
                  >
                    <div className="flex flex-col items-center relative px-4">
                      {/* Sliding background indicator behind active step */}
                      {isCurrent && (
                        <motion.div
                          layoutId="activeCheckoutStepBackground"
                          className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-2xl -m-2 z-0"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                      
                      <button
                        type="button"
                        disabled={!isCompleted || currentStep === 3 || paymentStatus === 'loading'}
                        onClick={() => isCompleted && currentStep === 2 ? setCurrentStep(1) : null}
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
                          isCompleted || isCurrent
                            ? 'bg-black border-black text-white dark:bg-white dark:border-white dark:text-black'
                            : 'border-gray-300 dark:border-gray-600 text-gray-400 bg-white dark:bg-gray-800'
                        } ${isCompleted && currentStep !== 3 ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                      >
                        <span className="font-bold text-lg">{stepNumber}</span>
                      </button>
                      <span className={`text-sm mt-2 font-semibold z-10 ${
                        isCompleted || isCurrent ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {step}
                      </span>
                    </div>
                    {index < 2 && (
                      <div className="w-12 sm:w-20 h-1 mx-2 relative shrink-0">
                        {/* Base line */}
                        <div className="absolute inset-0 bg-gray-300 dark:bg-gray-600 rounded-full" />
                        {/* Active filling line */}
                        <motion.div 
                          initial={{ width: '0%' }}
                          animate={{ width: isCompleted ? '100%' : '0%' }}
                          transition={{ duration: 0.4 }}
                          className="absolute inset-y-0 left-0 bg-black dark:bg-white rounded-full"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
              {!isAuthenticated && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                  Have an account?{' '}
                  <Link
                    to="/login?redirect=/checkout"
                    className="font-medium text-[#00A676] hover:underline"
                  >
                    Log in for faster checkout
                  </Link>
                  .
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contact Email
                      <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (hasSubmitted && !e.target.value.trim()) {
                          setErrors(prev => ({ ...prev, email: 'Required' }));
                        } else {
                          setErrors(prev => ({ ...prev, email: '' }));
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all
                        ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-[#00A676] focus:border-[#00A676]'}
                        ${errors.email ? 'bg-white dark:bg-white' : 'dark:bg-gray-700'}
                        text-gray-900 dark:text-white
                      `}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                      <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); if (hasSubmitted && !e.target.value.trim()) setErrors(prev => ({ ...prev, firstName: 'Required' })); else setErrors(prev => ({ ...prev, firstName: '' })); }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all
                        ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-[#00A676] focus:border-[#00A676]'}
                        ${errors.firstName ? 'bg-white dark:bg-white' : 'dark:bg-gray-700'}
                        text-gray-900 dark:text-white
                      `}
                      placeholder="e.g. John"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                      <span className='text-red-500'>*</span>
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); if (hasSubmitted && !e.target.value.trim()) setErrors(prev => ({ ...prev, lastName: 'Required' })); else setErrors(prev => ({ ...prev, lastName: '' })); }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all
                        ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-[#00A676] focus:border-[#00A676]'}
                        ${errors.lastName ? 'bg-white dark:bg-white' : 'dark:bg-gray-700'}
                        text-gray-900 dark:text-white
                      `}
                      placeholder="e.g. Doe"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      WhatsApp Number
                      <span className='text-red-500'>*</span>
                    </label>
                    {phoneNumber.trim() && (
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        errors.phoneNumber 
                          ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {errors.phoneNumber ? 'Invalid Number' : 'Format Verified'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPhoneNumber(val);
                        const clean = val.replace(/\s+/g, '').replace('+', '');
                        if (!val.trim()) {
                          setErrors(prev => ({ ...prev, phoneNumber: 'Required' }));
                        } else if (/^(?:254|0)[17]\d{8}$/.test(clean)) {
                          setErrors(prev => ({ ...prev, phoneNumber: '' }));
                        } else {
                          setErrors(prev => ({ ...prev, phoneNumber: 'Invalid format (e.g. 254712345678 or 0712345678)' }));
                        }
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all pr-10
                        ${errors.phoneNumber ? 'border-rose-400 focus:ring-rose-500 focus:border-rose-500' : 'border-stone-300 dark:border-stone-700 focus:ring-[#A16207] focus:border-[#A16207]'}
                        ${errors.phoneNumber ? 'bg-rose-50/20' : 'dark:bg-gray-700'}
                        text-gray-900 dark:text-white font-medium
                      `}
                      placeholder="e.g. 254712345678"
                      required
                    />
                    {!errors.phoneNumber && phoneNumber.trim() && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-emerald-600">
                        <FiCheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {errors.phoneNumber && (
                    <p className="text-xs text-rose-600 font-semibold mt-1">
                      {errors.phoneNumber}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter in format: 2547XXXXXXXX or 07XXXXXXXX
                  </p>
                  
                  {/* WhatsApp Automated Routing Notice */}
                  <div className="mt-3 bg-stone-50 dark:bg-stone-900/10 border border-stone-200 dark:border-stone-800 rounded-xl p-4 flex items-start gap-3">
                    <FiSmartphone className="text-[#A16207] mt-0.5 shrink-0" size={18} />
                    <div>
                      <p className="text-xs font-bold text-stone-900 dark:text-white uppercase tracking-wider mb-1">
                        Automated WhatsApp Routing
                      </p>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                        Order confirmations, real-time courier links, and shipment notifications are dispatched directly to this WhatsApp number. Please ensure it is active. If unreachable, delivery alerts will automatically fallback to your email.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping method */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Shipping method</h2>
                <div
                  role="radiogroup"
                  aria-label="Shipping method"
                  aria-required="true"
                  className={`rounded-md overflow-hidden ${
                    errors.shippingRegion
                      ? 'ring-2 ring-red-500 ring-offset-1'
                      : 'border border-gray-200 dark:border-gray-600'
                  }`}
                >
                  {shippingOptions.map((option, index) => {
                    const isSelected = selectedShipping?.id === option.id;
                    const { title, description } = parseShippingLabel(option.label);
                    return (
                      <label
                        key={option.id}
                        className={`relative flex items-start gap-3 px-4 py-3.5 cursor-pointer bg-white dark:bg-gray-800 transition-colors ${
                          index > 0 ? 'border-t border-gray-200 dark:border-gray-600' : ''
                        } ${
                          isSelected
                            ? 'z-10 shadow-[inset_0_0_0_2px_#2563eb] bg-blue-50/40 dark:bg-blue-950/30'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/40'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shippingMethod"
                          value={option.id}
                          checked={isSelected}
                          onChange={() =>
                            handleShippingSelect(option, {
                              setSelectedShipping,
                              setAddress,
                              setErrors,
                              hasSubmitted,
                            })
                          }
                          className="mt-0.5 h-4 w-4 shrink-0 border-gray-300 text-blue-600 focus:ring-blue-600 dark:border-gray-500 dark:bg-gray-700"
                        />
                        <div className="flex-1 min-w-0 pr-3">
                          <span className="block text-sm text-gray-900 dark:text-white leading-snug">
                            {title}
                          </span>
                          {description && (
                            <span className="block text-sm text-gray-500 dark:text-gray-400 leading-relaxed mt-0.5">
                              {description}
                            </span>
                          )}
                        </div>
                        <span className="shrink-0 text-sm text-gray-900 dark:text-white tabular-nums pt-0.5">
                          {formatPrice(option.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {errors.shippingRegion && (
                  <p className="text-sm text-red-500 mt-2">Please select a shipping method</p>
                )}
                {selectedShipping && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Exact Delivery Location
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (hasSubmitted && !e.target.value.trim()) {
                            setErrors((prev) => ({ ...prev, address: 'Required' }));
                          } else {
                            setErrors((prev) => ({ ...prev, address: '' }));
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 transition-all
                          ${errors.address ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:ring-[#00A676] focus:border-[#00A676]'}
                          ${errors.address ? 'bg-white dark:bg-white' : 'dark:bg-gray-700'}
                          text-gray-900 dark:text-white
                        `}
                        placeholder="Enter specific street, building, or landmark within your selected region."
                        required
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Proceed to Payment Button */}
              <button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  setHasSubmitted(true);

                  const validationErrors = {};
                  if (!firstName.trim()) validationErrors.firstName = 'Required';
                  if (!lastName.trim()) validationErrors.lastName = 'Required';
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!email.trim()) {
                    validationErrors.email = 'Required';
                  } else if (!emailRegex.test(email.trim())) {
                    validationErrors.email = 'Invalid email format';
                  }
                  
                  if (!phoneNumber.trim()) validationErrors.phoneNumber = 'Required';
                  if (!selectedShipping) validationErrors.shippingRegion = 'Required';
                  if (selectedShipping && !address.trim()) validationErrors.address = 'Required';

                  setErrors(validationErrors);

                  if (Object.keys(validationErrors).length === 0) {
                    handleProceedToPayment(e);
                  } else {
                    toast.error('Please fill in all required fields');
                  }
                }}
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
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          {[
                            item.brand,
                            item.size && item.size.trim(),
                            item.color && item.color.trim()
                          ].filter(Boolean).join(' • ')}
                        </p>

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
                          <div className="flex flex-wrap items-center gap-2">
                            {(() => {
                              const product = products.find(p => p.id === item.id || p._id === item.id);
                              const availableSizes = product?.sizes?.filter(s => s && s.trim()) || [];
                              const availableColors = product?.colors?.filter(c => c && c.trim()) || [];

                              return (
                                <>
                                  {availableSizes.length > 0 && (
                                    <select
                                      value={item.size || ''}
                                      onChange={(e) => {
                                        const newSize = e.target.value;
                                        dispatch(updateCartItemVariant({
                                          cartItemId: item.id,
                                          newSize,
                                          newColor: item.color
                                        }));
                                        dispatch(updateCartItemVariantAPI({
                                          productId: item.id || item.productId,
                                          size: newSize,
                                          color: item.color
                                        }));
                                      }}
                                      className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                    >
                                      {availableSizes.map(size => (
                                        <option key={size} value={size}>{size}</option>
                                      ))}
                                    </select>
                                  )}
                                  {availableColors.length > 0 && (
                                    <select
                                      value={item.color || ''}
                                      onChange={(e) => {
                                        const newColor = e.target.value;
                                        dispatch(updateCartItemVariant({
                                          cartItemId: item.id,
                                          newSize: item.size,
                                          newColor
                                        }));
                                        dispatch(updateCartItemVariantAPI({
                                          productId: item.id || item.productId,
                                          size: item.size,
                                          color: newColor
                                        }));
                                      }}
                                      className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700"
                                    >
                                      {availableColors.map(color => (
                                        <option key={color} value={color}>{color}</option>
                                      ))}
                                    </select>
                                  )}
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
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Fulfillment Routing</h2>

              <div className="p-5 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/5 mb-6 relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6 text-white fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.579 1.968 14.12 .943 11.997.943c-5.433 0-9.859 4.37-9.863 9.8-.001 2.09.547 4.123 1.588 5.925L2.748 21.01l4.899-1.27c.001-.001.001-.001 0 0zm12.185-7.102c-.301-.151-1.784-.882-2.057-.981-.273-.099-.471-.148-.669.151-.197.299-.765.981-.937 1.18-.172.197-.344.222-.646.072-.301-.15-1.272-.469-2.423-1.495-.895-.798-1.5-1.784-1.676-2.084-.176-.301-.019-.464.132-.612.135-.133.301-.351.452-.527.15-.176.2-.301.301-.502.101-.201.05-.376-.025-.526-.075-.151-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.197 0-.516.074-.786.374-.27.299-1.031 1.01-1.031 2.463 0 1.453 1.056 2.859 1.204 3.058.148.197 2.078 3.174 5.035 4.453.703.304 1.252.486 1.68.622.709.226 1.354.194 1.864.118.569-.085 1.784-.73 2.033-1.433.248-.703.248-1.307.172-1.433-.075-.126-.272-.201-.572-.352z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white text-base">Direct WhatsApp Fulfillment Routing</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1.5 leading-relaxed">
                      Your order confirmation, digital receipt, and shipping updates will be routed directly to your WhatsApp number: <strong className="font-mono text-emerald-600 dark:text-emerald-400 select-all">{phoneNumber}</strong>.
                    </p>
                    <p className="text-xs text-stone-500 mt-2">
                      Please ensure your WhatsApp client is active on this line.
                    </p>
                  </div>
                </div>
              </div>

              {paymentStatus === 'loading' && (
                <div className="mt-6 p-4 bg-stone-50 dark:bg-stone-900/20 border border-stone-200 dark:border-stone-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                    <p className="text-stone-700 dark:text-stone-300 font-medium">
                      Routing order confirmation and sending WhatsApp message...
                    </p>
                  </div>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FiCheckCircle className="text-emerald-600 w-5 h-5" />
                    <p className="text-emerald-700 dark:text-emerald-300 font-semibold">Order placed successfully! Confirmations sent.</p>
                  </div>
                </div>
              )}

              {paymentStatus === 'failed' && (
                <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <FiXCircle className="text-rose-600 w-5 h-5" />
                    <p className="text-rose-700 dark:text-rose-300 font-semibold">Order placement failed. Please try again.</p>
                  </div>
                  <button
                    onClick={() => {
                      setPaymentStatus('idle');
                    }}
                    className="w-full bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-200 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer"
                  >
                    Try Again
                  </button>
                </div>
              )}

              {/* Place Order on WhatsApp Button */}
              <button
                onClick={handlePayment}
                disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                className="w-full mt-6 bg-[#00A676] hover:bg-[#008A5E] text-white transition-colors duration-300 font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                {paymentStatus === 'loading' ? 'Processing...' : 'Place Order on WhatsApp'}
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {[
                            item.brand,
                            item.size && item.size.trim(),
                            item.color && item.color.trim()
                          ].filter(Boolean).join(' • ')}
                        </p>
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
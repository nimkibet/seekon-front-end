import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiCalendar, FiClock, FiTrash2, FiMinus, FiPlus, FiMapPin, FiSmartphone, FiCreditCard, FiCheckCircle, FiXCircle, FiX } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { formatPrice } from '../utils/formatPrice';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { items, totalPrice } = useSelector(state => state.cart);
  const user = useSelector(state => state.user.user);

  const [email, setEmail] = useState(user?.email || 'user@seekon.com');
  const [phoneNumber, setPhoneNumber] = useState('254708374149');
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
  
  // Card details state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    if (user?.name) {
      const nameParts = user.name.split(' ');
      setFirstName(nameParts[0] || '');
      setLastName(nameParts.slice(1).join(' ') || '');
    }
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

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
      setPaymentStatus('loading');
      const token = localStorage.getItem('token');
      
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
            userEmail: email
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setPaymentStatus('success');
          toast.success('Payment successful!');
          setTimeout(() => {
            setCurrentStep(3); // Move to confirmation
          }, 2000);
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
        setTimeout(() => {
          setCurrentStep(3); // Move to confirmation
        }, 2000);
      }
    } catch (error) {
      setPaymentStatus('failed');
      toast.error(error.message || 'Payment failed. Please try again.');
    }
  };

  const handleCompleteOrder = () => {
    toast.success('Order completed successfully!');
    navigate('/orders');
  };

  const calculateTotals = () => {
    const subtotal = totalPrice;
    const shipping = subtotal > 5000 ? 0 : 500; // Free shipping over 5000
    const vat = subtotal * 0.16; // 16% VAT
    const total = subtotal + shipping + vat;
    return { subtotal, shipping, vat, total };
  };

  const { subtotal, shipping, vat, total } = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Back Button */}
          <button 
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span className="font-medium">Checkout</span>
          </button>
          
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
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted || isCurrent
                        ? 'bg-[#00A676] border-[#00A676] text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-400 bg-white dark:bg-gray-800'
                    }`}>
                      <span className="font-bold text-lg">{stepNumber}</span>
                    </div>
                    <span className={`text-sm mt-2 font-medium ${
                      isCompleted || isCurrent ? 'text-[#00A676]' : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`w-20 h-1 mx-4 transition-colors ${
                      isCompleted
                        ? 'bg-[#00A676]'
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
                    City
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676] transition-all"
                  >
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kisumu">Kisumu</option>
                    <option value="Nakuru">Nakuru</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676] transition-all"
                      placeholder="e.g. 123 Main Street, Nairobi"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zip Code
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676] transition-all"
                    placeholder="e.g. 00100 (optional)"
                  />
                </div>
              </div>
            </div>

              {/* Proceed to Payment Button */}
              <button
                onClick={handleProceedToPayment}
                className="w-full bg-[#00A676] hover:bg-[#008A5E] text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
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
                              <button className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
                                <FiMinus className="w-3 h-3" />
                              </button>
                              <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                              <button className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700">
                                <FiPlus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <select className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
                              <option>{item.size}</option>
                            </select>
                            <select className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
                              <option>{item.color}</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <button className="text-red-500 hover:text-red-600 transition-colors">
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
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Vat/Tax</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatPrice(vat)}</span>
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
                        ? 'border-[#00A676] bg-[#00A676]/10'
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
                    className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#00A676] bg-[#00A676]/10'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <FiCreditCard className="text-4xl mb-2" />
                    <span className="font-semibold text-gray-900 dark:text-white">Card</span>
                    <span className="text-xs text-gray-500 mt-1">Credit/Debit</span>
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
                  {/* Demo Card Numbers Info */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-800 dark:text-blue-200 mb-2">💳 Demo Card Numbers:</p>
                    <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      <p><strong>Visa:</strong> 4111 1111 1111 1111</p>
                      <p><strong>MasterCard:</strong> 5555 5555 5555 4444</p>
                      <p><strong>Amex:</strong> 3782 8224 6310 005</p>
                      <p className="mt-2"><strong>Any CVV:</strong> 123</p>
                      <p><strong>Any Expiry:</strong> 12/25 or later</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676]"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676]"
                      placeholder="John Doe"
                      disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676]"
                        placeholder="MM/YY"
                        maxLength={5}
                        disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#00A676] focus:border-[#00A676]"
                        placeholder="123"
                        maxLength={3}
                        disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Secured by PCI-DSS compliant payment gateway
                  </p>
                </div>
              )}

              {/* Payment Status */}
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
                  <div className="flex items-center space-x-3">
                    <FiXCircle className="text-red-600 w-5 h-5" />
                    <p className="text-red-600 dark:text-red-400">Payment failed. Please try again.</p>
                  </div>
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
                disabled={paymentStatus === 'loading' || paymentStatus === 'success'}
                className="w-full mt-6 bg-[#00A676] hover:bg-[#008A5E] text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentStatus === 'loading' ? 'Processing...' : 'Pay Now'}
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
                    <span className="text-gray-900 dark:text-white font-medium">
                      {shipping === 0 ? 'Free' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Vat/Tax</span>
                    <span className="text-gray-900 dark:text-white font-medium">{formatPrice(vat)}</span>
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
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-left">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Summary</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total: <span className="font-bold text-[#00A676]">{formatPrice(total)}</span></p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Items: {items.length}</p>
                </div>
              </div>
              <button
                onClick={handleCompleteOrder}
                className="w-full bg-[#00A676] hover:bg-[#008A5E] text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Checkout;

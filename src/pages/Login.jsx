import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight, FiMenu, FiX, FiSend, FiShield, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useDispatch } from 'react-redux';
import { loginUser, registerUser, resendVerificationEmail, validateToken } from '../store/slices/userSlice';
import { addToWishlistLocal } from '../store/slices/wishlistSlice';
import { addToCart, addToCartAPI } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import Logo3D from '../components/Logo3D';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    verificationCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [errors, setErrors] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [isResending, setIsResending] = useState(false);
  
  // Verification state
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [isCodeSending, setIsCodeSending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  const menuRef = useRef(null);

  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectUrl = searchParams.get('redirect') || '/';
  const from = location.state?.from?.pathname || redirectUrl;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
      navigate(from, { replace: true });
    }
    }
  }, [isAuthenticated, user, navigate, from]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSendVerificationCode = async () => {
    const { email } = formData;
    
    // Validate email first
    if (!email) {
      setErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }
    
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: 'Invalid email format' }));
      return;
    }

    setIsCodeSending(true);
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://seekonbackend-production.up.railway.app'}/api/auth/send-code`, {
        email
      });
      
      if (response.data.success) {
        setIsCodeSent(true);
        setErrors(prev => ({ ...prev, email: '' }));
        toast.success('Verification code sent to your email!', {
          duration: 4000
        });
        setResendCooldown(60); // 60 second cooldown
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification code';
      toast.error(message);
    } finally {
      setIsCodeSending(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time password strength check for signup
    if (isSignUp && name === 'password' && value) {
      const validation = validatePasswordStrength(value);
      setPasswordStrength(validation);
    } else if (isSignUp && name === 'password' && !value) {
      setPasswordStrength(null);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear confirm password error if passwords match
    if (name === 'confirmPassword' && value === formData.password && errors.confirmPassword) {
      setErrors(prev => ({
        ...prev,
        confirmPassword: ''
      }));
    }
  };

  // Password strength validation (production-ready)
  const validatePasswordStrength = (password) => {
    if (!password) return { valid: false, message: 'Password is required' };
    
    const requirements = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const failedRequirements = [];
    if (!requirements.minLength) failedRequirements.push('at least 8 characters');
    if (!requirements.hasUpperCase) failedRequirements.push('one uppercase letter');
    if (!requirements.hasLowerCase) failedRequirements.push('one lowercase letter');
    if (!requirements.hasNumber) failedRequirements.push('one number');
    // Special character is optional but recommended
    
    if (failedRequirements.length > 0) {
      return {
        valid: false,
        message: `Password must contain ${failedRequirements.join(', ')}`,
        requirements
      };
    }
    
    return { valid: true, requirements };
  };

  const validateForm = () => {
    const newErrors = {};

    if (isSignUp) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      } else if (formData.name.trim().length < 2) {
        newErrors.name = 'Name must be at least 2 characters';
      } else if (formData.name.trim().length > 50) {
        newErrors.name = 'Name must be less than 50 characters';
      }
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email is too long';
    }

    if (isSignUp) {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message;
      }
      
      // Validate confirm password
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // For signup, add verification code validation
    if (isSignUp) {
      const newErrors = {};
      
      if (!isCodeSent) {
        newErrors.email = 'Please send a verification code first';
      }
      
      if (isCodeSent && !formData.verificationCode) {
        newErrors.verificationCode = 'Verification code is required';
      } else if (isCodeSent && formData.verificationCode.length !== 6) {
        newErrors.verificationCode = 'Verification code must be 6 digits';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        toast.error('Please fix the errors below');
        return;
      }
    }
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      const loadingMessage = isSignUp ? 'Creating your account...' : 'Signing you in...';
      toast.loading(loadingMessage, { id: 'login-submit' });
      
      let result;
      
      if (isSignUp) {
        // Use axios for registration with verification code
        const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://seekonbackend-production.up.railway.app'}/api/auth/register`, {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          verificationCode: formData.verificationCode
        });
        
        // Store token and user data
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          result = response.data.user;
        }
      } else {
        result = await dispatch(loginUser(formData)).unwrap();
      }
      
      // Check for pending cart item and add it
      const pendingCartItem = sessionStorage.getItem('pendingCartItem');
      if (pendingCartItem) {
        try {
          const item = JSON.parse(pendingCartItem);
          
          // Handle both structures: { product, size, color, quantity } from ProductDetail
          // and { id, name, price, image, brand, size, color, quantity } from ProductCard
          const productToAdd = item.product || item;
          
          // FIX: Use addToCartAPI for logged-in users to sync with backend
          dispatch(addToCartAPI({
            product: productToAdd,
            size: item.size,
            color: item.color || item.color,
            quantity: item.quantity
          }));
          sessionStorage.removeItem('pendingCartItem');
          toast.success(`${productToAdd.name} added to cart!`, {
            icon: '🛒',
          });
        } catch (error) {
          console.error('Error adding pending cart item:', error);
        }
      }
      
      // Check for pending wishlist item and add it
      const pendingItem = sessionStorage.getItem('pendingWishlistItem');
      if (pendingItem) {
        try {
          const product = JSON.parse(pendingItem);
          dispatch(addToWishlistLocal({ product }));
          sessionStorage.removeItem('pendingWishlistItem');
          toast.success(`${product.name} added to wishlist!`, {
            icon: '❤️',
          });
        } catch (error) {
          console.error('Error adding pending wishlist item:', error);
        }
      }
      
      // Get redirect path from localStorage if available
      const redirectPath = localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
      
      // Dispatch validateToken to update Redux state and trigger Navbar update
      dispatch(validateToken());
      
      // Check user role from response and redirect
      if (result.role === 'admin' || result.role === 'superadmin') {
        toast.success('Welcome back Admin!', { id: 'login-submit' });
        navigate('/admin/dashboard', { replace: true });
      } else {
        toast.success(isSignUp ? 'Account created successfully!' : 'Welcome back!', { id: 'login-submit' });
        // Use redirectPath if available, otherwise use 'from'
        navigate(redirectPath || from, { replace: true });
      }
    } catch (err) {
      console.error('Auth error:', err);
      // Show the actual error message from the backend
      const errorMessage = err?.message || err || (isSignUp ? 'Registration failed. Please try again.' : 'Login failed. Please try again.');
      
      // Check if error is due to unverified email
      if (!isSignUp && errorMessage.toLowerCase().includes('verify your email')) {
        setShowResendVerification(true);
      }
      
      toast.error(errorMessage, { id: 'login-submit', duration: 4000 });
    }
  };

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!formData.email) {
      toast.error('Please enter your email address first');
      return;
    }
    
    setIsResending(true);
    toast.loading('Sending verification email...', { id: 'resend-verification' });
    
    try {
      await dispatch(resendVerificationEmail(formData.email)).unwrap();
      toast.success('Verification email sent! Please check your inbox.', { id: 'resend-verification' });
      setShowResendVerification(false);
    } catch (err) {
      const errorMessage = err?.message || err || 'Failed to resend verification email';
      toast.error(errorMessage, { id: 'resend-verification', duration: 4000 });
    } finally {
      setIsResending(false);
    }
  };

  // Handle Google Login
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      toast.loading('Signing in with Google...', { id: 'google-login' });
      
      const response = await axios.post(`${import.meta.env.VITE_API_URL || 'https://seekonbackend-production.up.railway.app'}/api/auth/google`, {
        credential: credentialResponse.credential
      });

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Dispatch validateToken to update Redux state and trigger Navbar update
        dispatch(validateToken());

        // Check for pending cart item and add it
        const pendingCartItem = sessionStorage.getItem('pendingCartItem');
        if (pendingCartItem) {
          try {
            const item = JSON.parse(pendingCartItem);
            const productToAdd = item.product || item;
            dispatch(addToCartAPI({
              product: productToAdd,
              size: item.size,
              color: item.color || item.color,
              quantity: item.quantity
            }));
            sessionStorage.removeItem('pendingCartItem');
            toast.success(`${productToAdd.name} added to cart!`, {
              icon: '🛒',
            });
          } catch (error) {
            console.error('Error adding pending cart item:', error);
          }
        }

        // Check for pending wishlist item and add it
        const pendingItem = sessionStorage.getItem('pendingWishlistItem');
        if (pendingItem) {
          try {
            const product = JSON.parse(pendingItem);
            dispatch(addToWishlistLocal({ product }));
            sessionStorage.removeItem('pendingWishlistItem');
            toast.success(`${product.name} added to wishlist!`, {
              icon: '❤️',
            });
          } catch (error) {
            console.error('Error adding pending wishlist item:', error);
          }
        }

        // Check user role and redirect
        if (response.data.user.role === 'admin' || response.data.user.role === 'superadmin') {
          toast.success('Welcome back Admin!', { id: 'google-login' });
          navigate('/admin/dashboard', { replace: true });
        } else {
          toast.success('Welcome back!', { id: 'google-login' });
          navigate('/', { replace: true });
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Google login failed';
      toast.error(message, { id: 'google-login', duration: 4000 });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 relative">
      {/* Full-page background 3D Logo */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 dark:opacity-50 pointer-events-none z-0">
        <div className="w-full h-full max-w-4xl max-h-96">
          <Logo3D width="100%" height="100%" />
        </div>
      </div>

      {/* Content Wrapper to ensure it's above the background */}
      <div className="relative z-10 flex flex-col flex-grow">
      {/* 🔹 Header */}
      <header className="relative flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 bg-gray-900/40 backdrop-blur-xl shadow-md border-b border-gray-200/20 dark:border-gray-700/30 z-[10000]">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link to="/" className="flex flex-col items-center group flex-shrink-0">
            <img 
              src="/seekon_bg-removebg-preview.png" 
              alt="Seekon Apparel Logo" 
              className="h-8 sm:h-10 w-auto object-contain opacity-100 group-hover:opacity-100 transition-opacity duration-200"
            />
          </Link>
        </div>

        {/* Seekon Apparel Text - Responsive Centered */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-full">
          <span 
            className="font-black text-[12px] sm:text-2xl md:text-3xl lg:text-4xl text-gray-800 dark:text-gray-100 uppercase block text-center px-1 sm:px-0"
            style={{ 
              fontFamily: 'Impact, Arial Black, sans-serif',
              fontWeight: 900,
              textShadow: '4px 4px 8px rgba(0,0,0,0.5), -2px -2px 6px rgba(255,255,255,0.4)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap'
            }}
          >
            S E E K O N &nbsp; A P P A R E L
          </span>
        </div>

        {/* Hamburger Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-all duration-200"
          >
            {isMenuOpen ? (
              <FiX className="w-6 h-6" />
            ) : (
              <FiMenu className="w-6 h-6" />
            )}
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 bg-gray-900/40 backdrop-blur-xl shadow-xl border border-gray-200/20 dark:border-gray-700/30 rounded-lg overflow-hidden z-[9999]"
              >
                <div className="py-2 space-y-1 min-w-[200px]">
                  <Link
                    to="/about"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-2.5 hover:bg-white/10 text-white transition-all duration-200 font-medium text-sm mx-2 rounded-lg"
                  >
                    About
                  </Link>
                  <Link
                    to="/careers"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-2.5 hover:bg-white/10 text-white transition-all duration-200 font-medium text-sm mx-2 rounded-lg"
                  >
                    Careers
                  </Link>
                  <Link
                    to="/press"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-2.5 hover:bg-white/10 text-white transition-all duration-200 font-medium text-sm mx-2 rounded-lg"
                  >
                    Press
                  </Link>
                  <Link
                    to="/sustainability"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-2.5 hover:bg-white/10 text-white transition-all duration-200 font-medium text-sm mx-2 rounded-lg"
                  >
                    Sustainability
                  </Link>
                  <Link
                    to="/investors"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-5 py-2.5 hover:bg-white/10 text-white transition-all duration-200 font-medium text-sm mx-2 rounded-lg"
                  >
                    Investors
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Split Screen Content */}
      <div className="flex flex-grow lg:flex-row flex-col">
        {/* Left Side - Brand Aesthetic */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 items-center justify-center overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <img 
              src="/seekon_bg-removebg-preview.png" 
              alt="Seekon Background" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-transparent to-gray-900/90"></div>
          
          {/* Content */}
          <div className="relative z-10 text-center px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <img 
                src="/seekon_bg-removebg-preview.png" 
                alt="Seekon Logo" 
                className="w-24 h-24 mx-auto mb-6 object-contain"
              />
              <h1 className="text-5xl font-bold text-white mb-4">Welcome Back</h1>
              <p className="text-xl text-gray-300">
                Discover premium fashion that defines your style
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#FAFAFA]">
          <div className="w-full max-w-md space-y-6 sm:space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
              <h2 className="text-2xl sm:text-3xl font-bold text-[#1F1F1F] mb-2">
                {isSignUp ? 'Create account' : 'Welcome back'}
          </h2>
              <p className="text-sm sm:text-base text-[#666666]">
                {isSignUp ? 'Sign up to get started' : 'Sign in to your account to continue'}
          </p>
        </motion.div>

        {/* Login Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {/* Google Login Button */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => {
                toast.error('Google login failed. Please try again.', { id: 'google-login' });
              }}
              useOneTap
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          <div className="space-y-4">
                {/* Name Field - Only show during sign up */}
                {isSignUp && (
                  <div>
                    <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-[#1F1F1F] mb-2">
                      Full name
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#00A676]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] bg-[#FAFAFA] text-sm sm:text-base text-[#1F1F1F] placeholder:text-[#666666] ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="e.g. John Doe"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                    )}
                  </div>
                )}

            {/* Email Field */}
            <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-[#1F1F1F] mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-[#666666]" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSignUp && isCodeSent}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 border border-[#00A676]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] bg-[#FAFAFA] text-sm sm:text-base text-[#1F1F1F] placeholder:text-[#666666] ${errors.email ? 'border-red-500 focus:ring-red-500' : ''} ${isSignUp && isCodeSent ? 'opacity-60' : ''}`}
                  placeholder="john.doe@example.com"
                />
              </div>
              {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
              
              {/* Send Verification Code Button - Only for Sign Up */}
              {isSignUp && (
                <>
                  {!isCodeSent ? (
                    <button
                      type="button"
                      onClick={handleSendVerificationCode}
                      disabled={isCodeSending || !formData.email}
                      className="mt-2 w-full bg-[#00A676]/20 hover:bg-[#00A676]/30 text-[#00A676] border border-[#00A676]/30 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {isCodeSending ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <FiShield className="h-4 w-4" />
                          <span>Send Verification Code</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="mt-2 flex items-center space-x-2 text-green-600">
                      <FiCheck className="h-4 w-4" />
                      <span className="text-xs">Code sent! Check your email.</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Verification Code Field - Only for Sign Up */}
            {isSignUp && isCodeSent && (
              <div className="mt-2">
                <label htmlFor="verificationCode" className="block text-xs sm:text-sm font-medium text-[#1F1F1F] mb-2">
                  Verification Code
                </label>
                <input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  maxLength={6}
                  value={formData.verificationCode}
                  onChange={handleChange}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-[#00A676]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] bg-[#FAFAFA] text-sm sm:text-base text-[#1F1F1F] placeholder:text-[#666666] text-center tracking-widest font-mono ${errors.verificationCode ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter 6-digit code"
                />
                {errors.verificationCode && (
                  <p className="mt-1 text-xs text-red-600">{errors.verificationCode}</p>
                )}
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={resendCooldown > 0}
                  className="mt-2 text-xs text-[#00A676] hover:text-[#008A5E] disabled:text-gray-400 transition-colors"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            )}

            {/* Password Field */}
            <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-[#1F1F1F] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-[#666666]" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={!formData.password ? 'text' : (showPassword ? 'text' : 'password')}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 pr-9 sm:pr-10 border border-[#00A676]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] bg-[#FAFAFA] text-sm sm:text-base text-[#1F1F1F] placeholder:text-[#666666] ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="●●●●●●●●"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                        <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#666666] hover:text-[#00A676]" />
                  ) : (
                        <FiEye className="h-4 w-4 sm:h-5 sm:w-5 text-[#666666] hover:text-[#00A676]" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator - Only for Sign Up */}
              {isSignUp && passwordStrength && formData.password && (
                <div className="mt-2 space-y-2">
                  {/* Password Requirements Checklist */}
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center ${passwordStrength.requirements?.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1.5">{passwordStrength.requirements?.minLength ? '✓' : '○'}</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center ${passwordStrength.requirements?.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1.5">{passwordStrength.requirements?.hasUpperCase ? '✓' : '○'}</span>
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center ${passwordStrength.requirements?.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1.5">{passwordStrength.requirements?.hasLowerCase ? '✓' : '○'}</span>
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center ${passwordStrength.requirements?.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      <span className="mr-1.5">{passwordStrength.requirements?.hasNumber ? '✓' : '○'}</span>
                      <span>One number</span>
                    </div>
                  </div>
                  
                  {/* Password Strength Bar */}
                  {passwordStrength.valid && (
                    <div className="h-1 bg-green-500 rounded-full transition-all duration-300"></div>
                  )}
                </div>
              )}
              
              {errors.password && (
                    <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}

              {/* Forgot Password Link - Only for Login */}
                  {!isSignUp && (
                <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-xs text-[#00A676] hover:text-[#008A5E] transition-colors duration-200 font-medium"
                      >
                        Forgot password?
                      </Link>
                </div>
                  )}
            </div>

            {/* Confirm Password Field - Only for Sign Up */}
            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-xs sm:text-sm font-medium text-[#1F1F1F] mb-2">
                  Confirm password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-[#666666]" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={!formData.confirmPassword ? 'text' : (showConfirmPassword ? 'text' : 'password')}
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 pr-9 sm:pr-10 border border-[#00A676]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] bg-[#FAFAFA] text-sm sm:text-base text-[#1F1F1F] placeholder:text-[#666666] ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : formData.confirmPassword && formData.password === formData.confirmPassword ? 'border-green-500' : ''}`}
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[#666666] hover:text-[#00A676]" />
                    ) : (
                      <FiEye className="h-4 w-4 sm:h-5 sm:w-5 text-[#666666] hover:text-[#00A676]" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                  <p className="mt-1 text-xs text-black">✓ Passwords match</p>
                )}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Resend Verification Button */}
          {showResendVerification && !isSignUp && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
            >
              <p className="text-sm text-yellow-800 mb-3">
                Didn't receive the verification email?
              </p>
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full bg-yellow-500 text-white text-sm font-semibold py-2 px-4 rounded-lg hover:bg-yellow-600 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Resend Verification Email</span>
                    <FiSend className="w-4 h-4" />
                  </>
                )}
              </button>
            </motion.div>
          )}

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
                className="w-full bg-black text-white text-sm sm:text-base font-semibold py-2.5 sm:py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
                  <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-[#FAFAFA] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                    <span>{isSignUp ? 'Sign up' : 'Sign in'}</span>
                    <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </>
            )}
          </motion.button>
            </motion.form>

            {/* Toggle Sign Up/Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-[#666666]">
                {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                    setErrors({});
                    setPasswordStrength(null);
                    setShowConfirmPassword(false);
                  }}
                  className="font-semibold text-[#00A676] hover:text-[#008A5E] transition-colors duration-200"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
            </p>
          </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;

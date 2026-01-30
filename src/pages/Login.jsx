import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiArrowRight, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useDispatch } from 'react-redux';
import { loginUser, registerUser } from '../store/slices/userSlice';
import { addToWishlistLocal } from '../store/slices/wishlistSlice';
import { addToCart } from '../store/slices/cartSlice';
import toast from 'react-hot-toast';
import Logo3D from '../components/Logo3D';

const Login = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [errors, setErrors] = useState({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

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
    
    if (!validateForm()) {
      toast.error('Please fix the errors below');
      return;
    }

    try {
      const loadingMessage = isSignUp ? 'Creating your account...' : 'Signing you in...';
      toast.loading(loadingMessage, { id: 'login-submit' });
      
      let result;
      if (isSignUp) {
        result = await dispatch(registerUser(formData)).unwrap();
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
          
          dispatch(addToCart({
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
      toast.error(errorMessage, { id: 'login-submit', duration: 4000 });
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
                      className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 pl-9 sm:pl-10 border border-[#00A676]/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] bg-[#FAFAFA] text-sm sm:text-base text-[#1F1F1F] placeholder:text-[#666666] ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="john.doe@example.com"
                />
              </div>
              {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

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
                  type={showPassword ? 'text' : 'password'}
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
                    type={showConfirmPassword ? 'text' : 'password'}
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
                  <p className="mt-1 text-xs text-green-600">✓ Passwords match</p>
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

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
                className="w-full bg-[#00A676] text-[#FAFAFA] text-sm sm:text-base font-semibold py-2.5 sm:py-3 px-4 rounded-lg hover:bg-[#008A5E] transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

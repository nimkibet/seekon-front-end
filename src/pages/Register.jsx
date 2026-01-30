import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiArrowRight, FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useDispatch } from 'react-redux';
import { registerUser } from '../store/slices/userSlice';
import toast from 'react-hot-toast';
import Logo3D from '../components/Logo3D';

const Register = () => {
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
    
    if (failedRequirements.length > 0) {
      return {
        valid: false,
        message: `Password must contain ${failedRequirements.join(', ')}`,
        requirements
      };
    }
    
    return { valid: true, requirements };
  };

  const { register, isLoading, error, clearError, isAuthenticated, user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect based on role
      if (user.role === 'admin' || user.role === 'superadmin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
      navigate('/', { replace: true });
    }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    return () => clearError();
  }, [clearError]);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time password strength check
    if (name === 'password' && value) {
      const validation = validatePasswordStrength(value);
      setPasswordStrength(validation);
    } else if (name === 'password' && !value) {
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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Production-ready password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else {
      const passwordValidation = validatePasswordStrength(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.message;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      toast.loading('Creating your account...', { id: 'register-submit' });
      const result = await dispatch(registerUser({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      })).unwrap();
      
      toast.success('Account created successfully! Welcome to Seekon!', { id: 'register-submit' });
      
      // Redirect to home page
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Registration error:', err);
      // Show the actual error message from the backend
      const errorMessage = err?.message || err || 'Registration failed. Please try again.';
      toast.error(errorMessage, { id: 'register-submit', duration: 4000 });
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

      {/* Content Wrapper */}
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

        {/* Main Content */}
        <div className="flex flex-grow items-center justify-center py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-4 sm:p-6 space-y-4"
          >
            {/* Form Header */}
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Create your account
          </h2>
              <p className="mt-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300">
            Join Seekon Apparel and start your style journey
          </p>
            </div>

        {/* Registration Form */}
        <form
          className="space-y-3"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2.5">
            {/* Name Field */}
            <div>
                  <label htmlFor="name" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-9 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400 ${errors.name ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-0.5 text-[10px] text-red-600 dark:text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-9 sm:pl-10 py-2.5 sm:py-3 text-sm sm:text-base bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400 ${errors.email ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-0.5 text-[10px] text-red-600 dark:text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400 ${errors.password ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <FiEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {passwordStrength && formData.password && (
                <div className="mt-2 space-y-2">
                  {/* Password Requirements Checklist */}
                  <div className="text-xs space-y-1">
                    <div className={`flex items-center ${passwordStrength.requirements?.minLength ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span className="mr-1.5">{passwordStrength.requirements?.minLength ? '✓' : '○'}</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center ${passwordStrength.requirements?.hasUpperCase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span className="mr-1.5">{passwordStrength.requirements?.hasUpperCase ? '✓' : '○'}</span>
                      <span>One uppercase letter</span>
                    </div>
                    <div className={`flex items-center ${passwordStrength.requirements?.hasLowerCase ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      <span className="mr-1.5">{passwordStrength.requirements?.hasLowerCase ? '✓' : '○'}</span>
                      <span>One lowercase letter</span>
                    </div>
                    <div className={`flex items-center ${passwordStrength.requirements?.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
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
                <p className="mt-0.5 text-[10px] text-red-600 dark:text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2.5 sm:py-3 text-sm sm:text-base bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  ) : (
                    <FiEye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                  )}
                </button>
              </div>
                {errors.confirmPassword && (
                <p className="mt-0.5 text-[10px] text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
              {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
                <p className="mt-0.5 text-[10px] text-green-600 dark:text-green-400">✓ Passwords match</p>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
              <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Terms and Conditions */}
          <div className="flex items-start -mt-1">
            <div className="flex items-center h-4">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-3.5 w-3.5 accent-[#00A676] text-[#00A676] focus:ring-[#00A676] border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
            <div className="ml-2.5 text-[10px] sm:text-xs">
              <label htmlFor="terms" className="text-gray-700 dark:text-gray-300">
                I agree to the{' '}
                <Link
                  to="/terms"
                  className="font-semibold text-[#00A676] hover:text-[#008A5E] transition-colors duration-200"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  to="/privacy"
                  className="font-semibold text-[#00A676] hover:text-[#008A5E] transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-[#00A676] hover:bg-[#008A5E] text-white font-semibold py-2 sm:py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isLoading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Create account</span>
                <FiArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </>
            )}
          </motion.button>

          {/* Sign In Link */}
          <div className="text-center mt-2">
            <p className="text-[10px] sm:text-xs text-gray-700 dark:text-gray-300">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[#00A676] hover:text-[#008A5E] transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>
        </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Register;


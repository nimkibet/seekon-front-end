import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../store/slices/userSlice';
import toast from 'react-hot-toast';
import Logo3D from '../components/Logo3D';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
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

    setIsLoading(true);
    toast.loading('Sending reset instructions...', { id: 'forgot-password' });

    try {
      const result = await dispatch(forgotPassword(email)).unwrap();
      toast.success(result.message || 'Password reset email sent!', { id: 'forgot-password' });
      setIsSubmitted(true);
    } catch (err) {
      const errorMessage = err?.message || err || 'Failed to send reset email. Please try again.';
      toast.error(errorMessage, { id: 'forgot-password', duration: 4000 });
    } finally {
      setIsLoading(false);
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

          {/* Back to Login Button */}
          <Link
            to="/login"
            className="flex items-center text-white hover:text-[#00A676] font-medium text-sm transition-colors duration-200"
          >
            <FiArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            <span className="hidden sm:inline">Back to Login</span>
          </Link>
        </header>

        {/* Main Content */}
        <div className="flex flex-grow items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-6 sm:p-8"
          >
            {!isSubmitted ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    Forgot Password?
                  </motion.h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                </div>

                {/* Forgot Password Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiMail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) {
                            setErrors(prev => ({ ...prev, email: '' }));
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400 transition-all duration-200 ${
                          errors.email ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="Enter your registered email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                    )}
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#00A676] text-white font-semibold py-3 px-4 rounded-lg hover:bg-[#008A5E] transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <FiArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Back to Login */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 text-center"
                >
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Remember your password?{' '}
                    <Link
                      to="/login"
                      className="font-semibold text-[#00A676] hover:text-[#008A5E] transition-colors duration-200"
                    >
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              </>
            ) : (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Check Your Email
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  We've sent password reset instructions to{' '}
                  <span className="font-semibold text-[#00A676]">{email}</span>.
                  <br />
                  Please check your inbox and follow the link to reset your password.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setEmail('');
                    }}
                    className="text-[#00A676] hover:text-[#008A5E] font-medium underline"
                  >
                    try again
                  </button>
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-6 py-3 bg-[#00A676] text-white font-semibold rounded-lg hover:bg-[#008A5E] transition-colors duration-200"
                >
                  <FiArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

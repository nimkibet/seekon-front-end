import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader, FiArrowRight, FiMail } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { verifyEmail } from '../store/slices/userSlice';
import toast from 'react-hot-toast';
import Logo3D from '../components/Logo3D';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const performVerification = async () => {
      if (!token) {
        setVerificationStatus('error');
        setErrorMessage('Invalid verification link');
        return;
      }

      try {
        const result = await dispatch(verifyEmail(token)).unwrap();
        
        if (isMounted) {
          if (result.success) {
            setVerificationStatus('success');
            toast.success(result.message || 'Email verified successfully!');
          } else {
            setVerificationStatus('error');
            setErrorMessage(result.message || 'Verification failed');
          }
        }
      } catch (err) {
        if (isMounted) {
          setVerificationStatus('error');
          const errorMsg = err?.message || err || 'Invalid or expired verification token. Please contact support.';
          setErrorMessage(errorMsg);
          toast.error(errorMsg);
        }
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token, dispatch]);

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

          {/* Login Link */}
          {verificationStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:block"
            >
              <Link
                to="/login"
                className="flex items-center text-[#00A676] hover:text-[#008A5E] font-medium text-sm transition-colors duration-200"
              >
                <FiArrowRight className="w-4 h-4 mr-1" />
                Log In
              </Link>
            </motion.div>
          )}
        </header>

        {/* Main Content */}
        <div className="flex flex-grow items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl p-8 sm:p-10"
          >
            {verificationStatus === 'verifying' && (
              /* Verifying State */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-center py-8"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <motion.div
                    className="absolute inset-0 rounded-full border-4 border-[#00A676]/20"
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FiLoader className="w-10 h-10 text-[#00A676] animate-spin" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Verifying Your Email
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Please wait while we verify your email address...
                </p>
              </motion.div>
            )}

            {verificationStatus === 'success' && (
              /* Success State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiCheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Email Verified!
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Your email has been successfully verified. You can now log in to your account and start shopping!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center justify-center px-6 py-3 bg-[#00A676] text-white font-semibold rounded-lg hover:bg-[#008A5E] transition-colors duration-200"
                  >
                    Log In
                    <FiArrowRight className="w-4 h-4 ml-2" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {verificationStatus === 'error' && (
              /* Error State */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <FiXCircle className="w-10 h-10 text-red-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Verification Failed
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  {errorMessage || 'The verification link is invalid or has expired.'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                  Please try registering again or contact our support team if you need assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/login')}
                    className="inline-flex items-center justify-center px-6 py-3 bg-[#00A676] text-white font-semibold rounded-lg hover:bg-[#008A5E] transition-colors duration-200"
                  >
                    Go to Login
                  </motion.button>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href="mailto:support@seekonapparel.com"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white/20 text-gray-900 dark:text-white font-semibold rounded-lg hover:bg-white/30 transition-colors duration-200 backdrop-blur-md border border-white/30"
                  >
                    <FiMail className="w-4 h-4 mr-2" />
                    Contact Support
                  </motion.a>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;

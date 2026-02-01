import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiEye, FiEyeOff, FiLock, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { resetPassword, verifyEmail } from '../store/slices/userSlice';
import toast from 'react-hot-toast';
import Logo3D from '../components/Logo3D';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    
    if (value) {
      const validation = validatePasswordStrength(value);
      setPasswordStrength(validation);
    } else {
      setPasswordStrength(null);
    }

    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (errors.confirmPassword && value === password) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
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

    setIsLoading(true);
    toast.loading('Resetting your password...', { id: 'reset-password' });

    try {
      await dispatch(resetPassword({ token, password })).unwrap();
      toast.success('Password reset successfully!', { id: 'reset-password' });
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err?.message || err || 'Failed to reset password. The link may have expired.';
      toast.error(errorMessage, { id: 'reset-password', duration: 4000 });
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
            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.h2
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    Reset Password
                  </motion.h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Create a new password for your account.
                  </p>
                </div>

                {/* Reset Password Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* New Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={handlePasswordChange}
                        className={`w-full pl-10 pr-10 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400 transition-all duration-200 ${
                          errors.password ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        ) : (
                          <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {passwordStrength && password && (
                      <div className="mt-3 space-y-2">
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
                        {passwordStrength.valid && (
                          <div className="h-1 bg-green-500 rounded-full transition-all duration-300"></div>
                        )}
                      </div>
                    )}
                    
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                    )}
                  </motion.div>

                  {/* Confirm Password Field */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiLock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className={`w-full pl-10 pr-10 py-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00A676]/50 focus:border-[#00A676] text-gray-900 dark:text-white placeholder:text-gray-600 dark:placeholder:text-gray-400 transition-all duration-200 ${
                          errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <FiEyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        ) : (
                          <FiEye className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                    )}
                    {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                      <p className="mt-1 text-sm text-green-600 dark:text-green-400">✓ Passwords match</p>
                    )}
                  </motion.div>

                  {/* Submit Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
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
                        <span>Reset Password</span>
                        <FiCheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </form>

                {/* Note about token expiration */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-xs text-center text-gray-500 dark:text-gray-400"
                >
                  This reset link is valid for 10 minutes to ensure your account security.
                </motion.p>
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
                  <FiCheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Password Reset Successful
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-8">
                  Your password has been reset successfully. You can now log in with your new password.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-6 py-3 bg-[#00A676] text-white font-semibold rounded-lg hover:bg-[#008A5E] transition-colors duration-200"
                >
                  Go to Login
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

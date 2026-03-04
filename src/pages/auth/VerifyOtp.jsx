import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyOTP, resendOTP } from '../../store/slices/userSlice';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const { isLoading, error } = useSelector((state) => state.user);
  
  // Get email from location state, URL params, or localStorage
  const emailFromState = location.state?.email;
  const emailFromParams = searchParams.get('email');
  const email = emailFromState || emailFromParams || localStorage.getItem('registrationEmail');

  useEffect(() => {
    if (!email) {
      toast.error('Please register first');
      navigate('/register');
    }
  }, [email, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    try {
      const result = await dispatch(verifyOTP({ email, otp })).unwrap();
      toast.success('Email verified successfully!');
      
      // Clear localStorage
      localStorage.removeItem('registrationEmail');
      
      // Redirect to login page
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('OTP verification error:', err);
      toast.error(err || 'Invalid OTP. Please try again.');
    }
  };

  const handleResend = async () => {
    try {
      await dispatch(resendOTP(email)).unwrap();
      toast.success('New OTP sent to your email!');
    } catch (err) {
      toast.error(err || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#00A676]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiMail className="w-8 h-8 text-[#00A676]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
            <p className="text-gray-600">
              Enter the 6-digit code sent to<br />
              <span className="font-semibold text-[#00A676]">{email}</span>
            </p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00A676] focus:border-transparent text-center text-2xl tracking-widest font-mono"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-[#00A676] hover:bg-[#008A5E] disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Verifying...
                </>
              ) : (
                <>
                  Verify & Continue
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Resend Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={isLoading}
                className="text-[#00A676] font-semibold hover:underline disabled:text-gray-400"
              >
                Resend OTP
              </button>
            </p>
          </div>

          {/* Back to Register */}
          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/register')}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              ← Back to Registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;

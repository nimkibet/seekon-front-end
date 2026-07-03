import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiAlertTriangle, FiRefreshCw, FiArrowLeft } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { adminApi } from '../../utils/adminApi';
import toast from 'react-hot-toast';

const BotStatus = () => {
  const [status, setStatus] = useState({ connected: false, qr: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pollingActive, setPollingActive] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await adminApi.refreshBotStatus();
      toast.success('WhatsApp client reinitializing...');
      // Brief delay to allow backend to start re-linking
      setTimeout(() => {
        fetchStatus();
      }, 1500);
    } catch (err) {
      console.error('Failed to refresh bot status:', err.message);
      toast.error(err.message || 'Failed to reinitialize WhatsApp client.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    if (!window.confirm('Are you sure you want to force log out of the WhatsApp gateway and delete the session data? You will need to scan a new QR code to link it again.')) {
      return;
    }
    setLoggingOut(true);
    try {
      await adminApi.logoutBotStatus();
      toast.success('Successfully logged out and cleared session.');
      setTimeout(() => {
        fetchStatus();
      }, 1500);
    } catch (err) {
      console.error('Failed to log out bot status:', err.message);
      toast.error(err.message || 'Failed to log out WhatsApp client.');
    } finally {
      setLoggingOut(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await adminApi.getBotStatus();
      setStatus(response);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch bot status:', err.message);
      setError('Failed to connect to authentication server. Retrying...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    
    // Poll status every 3 seconds
    const interval = setInterval(() => {
      if (pollingActive) {
        fetchStatus();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pollingActive]);

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#0C0A09] font-sans py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Liquid Glass Glows */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#A16207]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#1C1917]/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-xl mx-auto relative z-10">
        {/* Back Link */}
        <Link 
          to="/admin/dashboard" 
          className="inline-flex items-center gap-2 text-sm text-[#44403C] hover:text-[#0C0A09] transition-colors duration-200 mb-8 font-medium cursor-pointer"
        >
          <FiArrowLeft size={16} />
          Back to Dashboard
        </Link>

        {/* Brand Header */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl sm:text-5xl font-medium tracking-wide text-[#1C1917] mb-2">
            SEEKON
          </h1>
          <p className="text-xs uppercase tracking-widest text-[#A16207] font-semibold">
            Boutique Concierge & Dispatch Gateway
          </p>
        </div>

        {/* Main Status Card */}
        <div className="bg-white/80 backdrop-blur-md border border-[#D6D3D1] rounded-2xl shadow-xl p-8 sm:p-10 relative overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <FiRefreshCw className="animate-spin text-[#A16207] mb-4" size={32} />
              <p className="text-sm font-medium text-[#44403C]">Loading dispatcher credentials...</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {status.connected ? (
                <motion.div 
                  key="connected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center text-center py-6"
                >
                  <div className="relative mb-6">
                    {/* Animated Pulsing Ring */}
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping scale-150" />
                    <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20 relative z-10">
                      <FiCheckCircle className="text-white" size={36} />
                    </div>
                  </div>
                  
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider mb-3">
                    Connected & Routing
                  </span>
                  
                  <h2 className="font-serif text-2xl font-semibold text-[#1C1917] mb-3">
                    Communication Engine Active
                  </h2>
                  
                  <p className="text-sm text-[#44403C] max-w-sm mb-8 leading-relaxed">
                    The WhatsApp gateway is authenticated and active. Order receipts and delivery dispatch confirmations are currently being routed through your business number.
                  </p>
                  
                  <div className="w-full bg-[#FAFAF9] border border-[#D6D3D1] rounded-xl p-4 text-left text-xs text-[#44403C] space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#1C1917]">Gateway Service:</span>
                      <span>whatsapp-web.js (Puppeteer)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#1C1917]">Anti-Crash Protocol:</span>
                      <span className="text-emerald-600 font-semibold">Enabled</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-[#1C1917]">Memory Pool Limit:</span>
                      <span>500MB Throttled</span>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full mt-6">
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing || loggingOut}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#D6D3D1] hover:border-[#A16207] rounded-lg text-xs font-semibold text-[#44403C] hover:text-[#A16207] transition-all bg-white shadow-sm hover:shadow active:scale-95 cursor-pointer disabled:opacity-50 flex-1"
                    >
                      <FiRefreshCw className={refreshing ? 'animate-spin' : ''} size={14} />
                      {refreshing ? 'Reinitializing...' : 'Restart Gateway'}
                    </button>
                    <button
                      onClick={handleLogout}
                      disabled={refreshing || loggingOut}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-rose-200 hover:border-rose-500 rounded-lg text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50/50 transition-all bg-white shadow-sm hover:shadow active:scale-95 cursor-pointer disabled:opacity-50 flex-1"
                    >
                      {loggingOut ? 'Logging out...' : 'Force Logout'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="disconnected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-4 text-amber-600">
                    <FiAlertTriangle size={24} />
                  </div>

                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider mb-3">
                    Awaiting Link
                  </span>

                  <h2 className="font-serif text-2xl font-semibold text-[#1C1917] mb-3">
                    Authenticate Dispatcher
                  </h2>

                  <p className="text-sm text-[#44403C] max-w-sm mb-6 leading-relaxed">
                    Scan the QR code below using your mobile device's linked devices screen in WhatsApp to register the session.
                  </p>

                  {/* QR Code Frame */}
                  <div className="bg-white p-6 rounded-2xl shadow-md border border-[#D6D3D1] mb-6 flex items-center justify-center min-h-[280px] w-full">
                    {status.qr ? (
                      <div className="p-2 bg-white border border-stone-100 rounded-lg">
                        <QRCodeCanvas value={status.qr} size={256} />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3">
                        <FiRefreshCw className="animate-spin text-[#A16207]" size={24} />
                        <span className="text-xs text-[#44403C] font-medium">Generating new QR code token...</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-[#44403C] leading-relaxed max-w-xs bg-[#FAFAF9] p-3 rounded-lg border border-[#D6D3D1] mb-6">
                    <strong>Instructions:</strong> Open WhatsApp → Settings → Linked Devices → Link a Device. Scan this code within 30 seconds before it refreshes.
                  </div>

                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#A16207] hover:bg-[#854D0E] text-white rounded-lg text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95 cursor-pointer disabled:opacity-50 w-full"
                  >
                    <FiRefreshCw className={refreshing ? 'animate-spin' : ''} size={16} />
                    {refreshing ? 'Refreshing QR Code...' : 'Refresh QR Code'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {error && (
            <div className="mt-6 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs text-center font-medium">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BotStatus;

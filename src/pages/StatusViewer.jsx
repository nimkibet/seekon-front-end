import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronLeft, ChevronRight, X, Volume2, VolumeX, Loader2, Phone, CheckCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '../config/api';

// ─── Buy Modal ────────────────────────────────────────────────────────────────
const BuyModal = ({ status, onClose }) => {
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { success, message }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/status/buy`, {
        statusId: status._id,
        customerPhone: phone.trim(),
      });
      setResult({ success: true, message: res.data.message });
    } catch (err) {
      setResult({
        success: false,
        message: err.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm mx-4 mb-6 sm:mb-0 bg-[#111827] rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="relative p-5 pb-3 bg-gradient-to-br from-[#25D366]/20 to-transparent border-b border-white/5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {/* Status thumbnail */}
          {status.mediaType === 'image' && (
            <img
              src={status.mediaUrl}
              alt="Status item"
              className="w-14 h-14 rounded-2xl object-cover border border-white/10 mb-3"
            />
          )}
          <h3 className="text-white font-bold text-lg leading-tight">Buy This Item</h3>
          {status.caption && (
            <p className="text-white/50 text-xs mt-1 line-clamp-2">{status.caption}</p>
          )}
          <p className="text-white/40 text-[11px] mt-1">Ref: #{String(status._id).slice(-8).toUpperCase()}</p>
        </div>

        {/* Body */}
        <div className="p-5">
          {!result ? (
            <>
              <p className="text-white/60 text-sm mb-4 leading-relaxed">
                Enter your WhatsApp number — our team will message you directly to arrange your purchase. No redirect needed.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07XXXXXXXX or 2547XXXXXXXX"
                    required
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#25D366]/60 transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting || !phone.trim()}
                  className="w-full bg-[#25D366] hover:bg-[#20BA5A] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-lg shadow-[#25D366]/20"
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Sending Request...</>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.73.001-2.597-1.002-5.037-2.825-6.863-1.823-1.825-4.251-2.83-6.852-2.831-5.437 0-9.862 4.371-9.865 9.73-.001 1.761.472 3.483 1.371 5.017l-.995 3.636 3.737-.981z"/>
                      </svg>
                      Send My Request
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              {result.success ? (
                <CheckCircle className="w-12 h-12 text-[#25D366] mx-auto mb-3" />
              ) : (
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              )}
              <p className={`font-semibold text-base mb-1 ${result.success ? 'text-white' : 'text-red-400'}`}>
                {result.success ? 'Request Sent!' : 'Something went wrong'}
              </p>
              <p className="text-white/50 text-sm leading-relaxed">{result.message}</p>
              <button
                onClick={onClose}
                className="mt-5 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium border border-white/10 transition"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main StatusViewer ────────────────────────────────────────────────────────
const StatusViewer = () => {
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const videoRef = useRef(null);
  const progressInterval = useRef(null);

  // Fetch active status updates
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await axios.get(`${API_URL}/status`);
        if (res.data && res.data.success) {
          setStatuses(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching active statuses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStatuses();
  }, []);

  // Pause when modal is open
  useEffect(() => {
    if (showBuyModal) setIsPaused(true);
  }, [showBuyModal]);

  // Reset pause state and progress when shifting index
  useEffect(() => {
    setIsPaused(false);
    setProgress(0);
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < statuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    } else {
      setProgress(0);
    }
  };

  // Progress Bar Management
  useEffect(() => {
    if (statuses.length === 0) return;
    const currentStatus = statuses[currentIndex];

    if (isPaused) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    if (currentStatus.mediaType === 'image') {
      const duration = 5000;
      const intervalTime = 50;
      const step = (intervalTime / duration) * 100;

      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval.current);
            handleNext();
            return 100;
          }
          return prev + step;
        });
      }, intervalTime);

      return () => {
        if (progressInterval.current) clearInterval(progressInterval.current);
      };
    } else {
      const video = videoRef.current;
      if (!video) return;

      const handleTimeUpdate = () => {
        if (video.duration) {
          setProgress((video.currentTime / video.duration) * 100);
        }
      };

      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => {
        if (video) video.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [currentIndex, statuses, isPaused]);

  // Video play/pause sync
  useEffect(() => {
    const video = videoRef.current;
    if (!video || statuses.length === 0 || statuses[currentIndex]?.mediaType !== 'video') return;
    if (isPaused) {
      video.pause();
    } else {
      video.play().catch(err => console.log('Autoplay blocked:', err));
    }
  }, [isPaused, currentIndex, statuses]);

  const handleTap = (clientX) => {
    if (showBuyModal) return;
    const screenWidth = window.innerWidth;
    const leftBound = screenWidth * 0.25;
    const rightBound = screenWidth * 0.75;

    if (clientX < leftBound) {
      handlePrev();
    } else if (clientX > rightBound) {
      handleNext();
    } else {
      setIsPaused(prev => !prev);
    }
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.no-tap-navigation')) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    handleTap(clientX);
  };

  const handleMouseDown = (e) => {
    if (window.innerWidth >= 1024) return;
    if (e.target.closest('.no-tap-navigation')) return;
    handleTap(e.clientX);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[#0B0F19] flex flex-col items-center justify-center text-white z-50">
        <Loader2 className="w-12 h-12 text-[#25D366] animate-spin mb-4" />
        <p className="text-gray-400 font-medium tracking-wide">Loading Seekon Stories...</p>
      </div>
    );
  }

  if (statuses.length === 0) {
    return (
      <div className="fixed inset-0 bg-[#0B0F19] flex flex-col items-center justify-center text-white p-6 z-50">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6 border border-gray-700">
            <X className="w-10 h-10 text-gray-500" />
          </div>
          <h2 className="text-2xl font-bold mb-3 tracking-tight">No Active Updates</h2>
          <p className="text-gray-400 mb-8 leading-relaxed">Seekon Apparel doesn't have any active status updates right now. Check back later!</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#00A676] hover:bg-[#008F64] text-white rounded-full font-semibold transition-all duration-300 shadow-lg shadow-[#00a676]/20"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const currentStatus = statuses[currentIndex];

  return (
    <>
      {/* BUY MODAL */}
      {showBuyModal && (
        <BuyModal
          status={currentStatus}
          onClose={() => {
            setShowBuyModal(false);
            setIsPaused(false);
          }}
        />
      )}

      <div className="fixed inset-0 bg-black overflow-hidden select-none z-50 flex items-center justify-center">

        {/* DESKTOP BACKGROUND: Blurred Pillarbox */}
        <div className="absolute inset-0 hidden lg:block overflow-hidden z-0">
          {currentStatus.mediaType === 'image' ? (
            <img
              src={currentStatus.mediaUrl}
              alt="Pillarbox background"
              className="w-full h-full object-cover filter blur-[40px] opacity-60 scale-105"
            />
          ) : (
            <video
              src={currentStatus.mediaUrl}
              className="w-full h-full object-cover filter blur-[40px] opacity-60 scale-105"
              autoPlay
              muted
              playsInline
              loop
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* VIEWER CONTAINER */}
        <div
          className="w-full h-full lg:max-w-[400px] lg:h-[85vh] lg:aspect-[9/16] relative bg-black lg:rounded-[32px] lg:border-[8px] lg:border-gray-800 lg:shadow-2xl overflow-hidden z-10 flex flex-col justify-between"
          onTouchStart={handleTouchStart}
          onMouseDown={handleMouseDown}
        >
          {/* TOP STATUS PROGRESS BAR & INFO */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-30 no-tap-navigation">

            {/* Segmented Progress Indicator */}
            <div className="flex gap-1.5 mb-4">
              {statuses.map((status, idx) => {
                let fillWidth = '0%';
                if (idx < currentIndex) fillWidth = '100%';
                else if (idx === currentIndex) fillWidth = `${progress}%`;

                return (
                  <div key={status._id || idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                      style={{ width: fillWidth }}
                    />
                  </div>
                );
              })}
            </div>

            {/* User Details & Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#00A676] flex items-center justify-center font-bold text-white border border-white/20 text-sm shadow">
                  SA
                </div>
                <div>
                  <h4 className="text-white text-sm font-semibold tracking-wide">Seekon Apparel</h4>
                  <p className="text-white/60 text-xs">
                    {new Date(currentStatus.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {currentStatus.mediaType === 'video' && (
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white border border-white/10 transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                )}
                <button
                  onClick={() => navigate('/')}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white border border-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* MEDIA CONTENT */}
          <div className="flex-1 flex items-center justify-center bg-black relative z-10">
            {currentStatus.mediaType === 'image' ? (
              <img
                src={currentStatus.mediaUrl}
                alt="Seekon status update"
                className="w-full h-full object-contain pointer-events-none select-none"
              />
            ) : (
              <video
                ref={videoRef}
                src={currentStatus.mediaUrl}
                className="w-full h-full object-contain pointer-events-none"
                autoPlay
                muted={isMuted}
                playsInline
                loop={false}
                onEnded={handleNext}
              />
            )}

            {/* PAUSE INDICATOR */}
            {isPaused && !showBuyModal && (
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center z-20 pointer-events-none">
                <div className="bg-black/60 p-4 rounded-full text-white backdrop-blur-sm animate-pulse">
                  <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                  </svg>
                </div>
              </div>
            )}

            {/* CAPTION OVERLAY */}
            {currentStatus.caption && (
              <div className="absolute bottom-24 inset-x-0 px-6 py-4 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-center z-20 pointer-events-none">
                <p className="text-white text-sm md:text-base leading-relaxed tracking-wide font-medium drop-shadow-md">
                  {currentStatus.caption}
                </p>
              </div>
            )}
          </div>

          {/* CTA BUTTON — triggers phone modal */}
          <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 to-transparent z-30 flex justify-center no-tap-navigation">
            <button
              onClick={() => setShowBuyModal(true)}
              className="w-full bg-[#25D366] hover:bg-[#20BA5A] active:scale-[0.97] text-white py-3.5 px-6 rounded-full font-bold shadow-lg shadow-[#25D366]/20 transition-all duration-300 transform hover:scale-[1.03] flex items-center justify-center gap-2.5 text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.863-9.73.001-2.597-1.002-5.037-2.825-6.863-1.823-1.825-4.251-2.83-6.852-2.831-5.437 0-9.862 4.371-9.865 9.73-.001 1.761.472 3.483 1.371 5.017l-.995 3.636 3.737-.981zm12.56-5.834c-.3-.15-1.771-.875-2.046-.975-.276-.1-.476-.15-.676.15-.2.3-.775.975-.95 1.175-.175.2-.35.225-.65.075-.3-.15-1.267-.467-2.414-1.492-.893-.797-1.496-1.78-1.671-2.08-.175-.3-.019-.462.13-.611.135-.135.3-.35.45-.525.15-.175.2-.3.3-.5.1-.2.05-.375-.025-.525-.075-.15-.676-1.631-.926-2.238-.244-.587-.492-.507-.676-.516-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8 1.05-.275.975-1.05 3.075-1.125 3.225-.075.15-.15.3-.025.525.9 1.484 2.22 2.69 4.025 3.284.475.156.844.25 1.135.342.477.151.91.13 1.25.079.379-.057 1.77-.726 2.021-1.426.251-.7 251-1.3 1.176-1.426-.075-.125-.275-.2-.575-.35z"/>
              </svg>
              Buy on WhatsApp
            </button>
          </div>
        </div>

        {/* DESKTOP NAVIGATION CHEVRONS */}
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-[calc(50%-270px)] top-1/2 -translate-y-1/2 hidden lg:flex w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-all backdrop-blur border border-white/10 shadow z-25"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {currentIndex < statuses.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-[calc(50%-270px)] top-1/2 -translate-y-1/2 hidden lg:flex w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center text-white transition-all backdrop-blur border border-white/10 shadow z-25"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </>
  );
};

export default StatusViewer;

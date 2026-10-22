import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { FiX, FiCamera, FiAlertCircle, FiZap, FiRefreshCw } from 'react-icons/fi';

const BarcodeScannerModal = ({ isOpen, onClose, onDetected, onScanSuccess }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const scannerRef = useRef(null);
  const qrRegionId = 'seekon-html5qr-code-region';
  const handleScanSuccess = onScanSuccess || onDetected;

  // Audio & Haptic Feedback on Successful Capture
  const playCaptureFeedback = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        // Play a cheerful high-pitched confirmation chirp (1046Hz -> 1318Hz)
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.14);
      }
    } catch (e) {
      // Audio playback might be restricted without prior gesture
    }

    try {
      if (navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch (e) {}
  };

  // Discover available cameras
  useEffect(() => {
    if (!isOpen) return;

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices);
          // Prefer back/environment camera
          const backCam = devices.find(
            (d) =>
              d.label.toLowerCase().includes('back') ||
              d.label.toLowerCase().includes('rear') ||
              d.label.toLowerCase().includes('environment')
          );
          setSelectedCameraId(backCam ? backCam.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.warn('Could not list cameras:', err);
      });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setErrorMsg('');
        setTorchSupported(false);
        setTorchOn(false);

        // Standard retail 1D & 2D formats
        const formatsToSupport = [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.CODE_93,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE
        ];

        const html5QrCode = new Html5Qrcode(qrRegionId, {
          formatsToSupport,
          verbose: false
        });
        scannerRef.current = html5QrCode;

        // Config optimized for rapid 1D barcode auto-capture
        const config = {
          fps: 20, // 20 frames per sec for fast acquisition
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            // Barcodes are wide, rectangular
            const w = Math.floor(Math.min(viewfinderWidth * 0.88, 360));
            const h = Math.floor(Math.min(viewfinderHeight * 0.52, 180));
            return {
              width: Math.max(260, w),
              height: Math.max(120, h)
            };
          },
          aspectRatio: 1.333334,
          disableFlip: false
        };

        const cameraChoice = selectedCameraId
          ? { deviceId: { exact: selectedCameraId } }
          : { facingMode: 'environment' };

        await html5QrCode.start(
          cameraChoice,
          config,
          (decodedText) => {
            if (isMounted) {
              playCaptureFeedback();
              if (typeof handleScanSuccess === 'function') {
                handleScanSuccess(decodedText);
              }
              stopScanner();
              onClose();
            }
          },
          (errorMessage) => {
            // Frame parse attempts fail normally until a clean barcode aligns
          }
        );

        if (isMounted) {
          setIsScanning(true);

          // Check if torch/flashlight is supported on active track
          try {
            const track = html5QrCode.getRunningTrackCapabilities?.();
            if (track && track.torch) {
              setTorchSupported(true);
            }
          } catch (e) {}
        }
      } catch (err) {
        console.error('Camera scanner init failed:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Unable to access camera. Please allow camera permissions.');
          setIsScanning(false);
        }
      }
    };

    const timer = setTimeout(startScanner, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen, selectedCameraId]);

  const stopScanner = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err) => console.error('Stop scanner error:', err));
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !torchSupported) return;
    try {
      const nextState = !torchOn;
      await scannerRef.current.applyVideoConstraints({
        advanced: [{ torch: nextState }]
      });
      setTorchOn(nextState);
    } catch (err) {
      console.warn('Torch toggle failed:', err);
    }
  };

  const handleSwitchCamera = () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    stopScanner();
    setSelectedCameraId(cameras[nextIndex].id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/80 backdrop-blur-md animate-fade-in">
      <style>{`
        @keyframes scanLaser {
          0% { top: 12%; opacity: 0.9; }
          50% { top: 88%; opacity: 1; }
          100% { top: 12%; opacity: 0.9; }
        }
        .laser-line {
          position: absolute;
          left: 6%;
          right: 6%;
          height: 2px;
          background: linear-gradient(90deg, transparent, #10b981, #34d399, #10b981, transparent);
          box-shadow: 0 0 12px #10b981, 0 0 4px #34d399;
          animation: scanLaser 2s ease-in-out infinite;
          pointer-events: none;
          z-index: 20;
        }
        #${qrRegionId} video {
          border-radius: 0.875rem;
          object-fit: cover !important;
          width: 100% !important;
          height: auto !important;
        }
      `}</style>

      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <FiCamera className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Camera Barcode Scanner</h3>
              <p className="text-[11px] text-zinc-400">
                {isScanning ? '⚡ Auto-captures instantly upon detection' : 'Initializing camera...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cameras.length > 1 && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title="Switch Camera"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            )}

            {torchSupported && (
              <button
                type="button"
                onClick={toggleTorch}
                className={`p-2 rounded-lg transition-colors ${
                  torchOn ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={torchOn ? 'Turn Flashlight Off' : 'Turn Flashlight On'}
              >
                <FiZap className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors text-lg"
              title="Close Scanner (Esc)"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder Body */}
        <div className="p-4 bg-zinc-950 flex flex-col items-center justify-center min-h-[340px]">
          {errorMsg ? (
            <div className="p-4 text-center max-w-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl space-y-2">
              <FiAlertCircle className="w-8 h-8 mx-auto text-red-400" />
              <p className="text-xs font-semibold leading-relaxed">{errorMsg}</p>
              <p className="text-[11px] text-zinc-400">
                Check camera permissions in your browser or connect a physical barcode scanner.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center relative">
              <div
                id={qrRegionId}
                className="w-full max-w-[340px] rounded-xl overflow-hidden border-2 border-dashed border-emerald-500/60 relative bg-black min-h-[220px]"
              >
                {/* Visual Laser Line Scan Indicator */}
                {isScanning && <div className="laser-line" />}
              </div>

              <div className="mt-3 text-center space-y-1">
                <p className="text-xs font-bold text-zinc-200">
                  Aim camera at product barcode or Code 128 sticker
                </p>
                <p className="text-[11px] text-zinc-500">
                  Detects Code 128, EAN-13, UPC, Code 39, and QR codes automatically.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <span className="text-[11px] text-zinc-400">
            {cameras.length > 0 && selectedCameraId
              ? `Camera: ${cameras.find((c) => c.id === selectedCameraId)?.label?.slice(0, 24) || 'Active Camera'}`
              : 'Auto Camera'}
          </span>
          <button
            type="button"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-zinc-300 hover:text-white bg-zinc-800 hover:bg-zinc-700 active:scale-95 rounded-xl transition-all"
          >
            Close Scanner (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;

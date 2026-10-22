import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { FiX, FiCamera, FiAlertCircle, FiZap, FiRefreshCw, FiUnlock, FiHelpCircle } from 'react-icons/fi';

const BarcodeScannerModal = ({ isOpen, onClose, onDetected, onScanSuccess }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);

  const scannerRef = useRef(null);
  const isMountedRef = useRef(false);
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
        osc.frequency.setValueAtTime(1046.5, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.14);
      }
    } catch (e) {}

    try {
      if (navigator.vibrate) {
        navigator.vibrate([80, 40, 80]);
      }
    } catch (e) {}
  };

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().catch((err) => console.warn('Stop scanner warn:', err));
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  const initAndStartScanner = useCallback(
    async (cameraId = null) => {
      try {
        stopScanner();

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

        const config = {
          fps: 20,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
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

        const cameraChoice = cameraId
          ? { deviceId: { exact: cameraId } }
          : { facingMode: 'environment' };

        await html5QrCode.start(
          cameraChoice,
          config,
          (decodedText) => {
            if (isMountedRef.current) {
              playCaptureFeedback();
              if (typeof handleScanSuccess === 'function') {
                handleScanSuccess(decodedText);
              }
              stopScanner();
              onClose();
            }
          },
          () => {
            // Frame parse attempts fail normally until a clean barcode aligns
          }
        );

        if (isMountedRef.current) {
          setIsScanning(true);
          setErrorMsg('');
          setPermissionDenied(false);

          // Check if torch/flashlight is supported
          try {
            const track = html5QrCode.getRunningTrackCapabilities?.();
            if (track && track.torch) {
              setTorchSupported(true);
            }
          } catch (e) {}
        }
      } catch (err) {
        console.error('initAndStartScanner error:', err);
        throw err;
      }
    },
    [handleScanSuccess, onClose, stopScanner]
  );

  // Proactively request camera access & immediately prompt browser permission
  const requestCameraAccess = useCallback(async () => {
    setIsRequesting(true);
    setErrorMsg('');
    setPermissionDenied(false);

    try {
      if (!window.isSecureContext && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        throw new Error('Camera access requires HTTPS. Please load Seekon POS over HTTPS or localhost.');
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera media devices API is not supported by this browser. Please use Chrome, Safari, or Edge.');
      }

      // 1. Explicitly prompt the user for camera access immediately
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } }
      });

      // 2. Permission granted! Release test tracks so Html5Qrcode can bind
      stream.getTracks().forEach((track) => track.stop());

      // 3. Query available video devices
      const devices = await Html5Qrcode.getCameras().catch(() => []);
      let targetCamId = null;
      if (devices && devices.length > 0) {
        setCameras(devices);
        const backCam = devices.find(
          (d) =>
            d.label.toLowerCase().includes('back') ||
            d.label.toLowerCase().includes('rear') ||
            d.label.toLowerCase().includes('environment')
        );
        targetCamId = backCam ? backCam.id : devices[0].id;
        setSelectedCameraId(targetCamId);
      }

      // 4. Start scanner
      await initAndStartScanner(targetCamId);
    } catch (err) {
      console.error('Camera request / init error:', err);
      const isDenied =
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError' ||
        String(err.message || '').toLowerCase().includes('denied') ||
        String(err.message || '').toLowerCase().includes('permission');

      setPermissionDenied(isDenied);

      let msg = err.message || 'Unable to access camera.';
      if (isDenied) {
        msg = 'Camera permission was denied. Tap "Request Camera Permission Now" below or grant permission in your browser address bar.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera hardware found on this device.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        msg = 'Camera is currently in use by another app or browser tab. Please close other camera apps and retry.';
      }
      setErrorMsg(msg);
      setIsScanning(false);
    } finally {
      setIsRequesting(false);
    }
  }, [initAndStartScanner]);

  // Main lifecycle when modal opens
  useEffect(() => {
    isMountedRef.current = true;

    if (!isOpen) {
      stopScanner();
      return () => {
        isMountedRef.current = false;
      };
    }

    // Immediately request camera permission upon opening
    requestCameraAccess();

    // Listen to browser permission changes if available
    let permObj = null;
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'camera' })
        .then((permissionStatus) => {
          permObj = permissionStatus;
          permObj.onchange = () => {
            if (isMountedRef.current && permObj.state === 'granted') {
              requestCameraAccess();
            }
          };
        })
        .catch(() => {});
    }

    return () => {
      isMountedRef.current = false;
      if (permObj) permObj.onchange = null;
      stopScanner();
    };
  }, [isOpen, requestCameraAccess, stopScanner]);

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

  const handleSwitchCamera = async () => {
    if (cameras.length <= 1) return;
    const currentIndex = cameras.findIndex((c) => c.id === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamId = cameras[nextIndex].id;
    setSelectedCameraId(nextCamId);
    try {
      await initAndStartScanner(nextCamId);
    } catch (err) {
      console.warn('Switch camera failed:', err);
    }
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
                {isScanning
                  ? '⚡ Auto-captures instantly upon detection'
                  : isRequesting
                  ? 'Requesting camera access...'
                  : errorMsg
                  ? 'Action required'
                  : 'Initializing camera...'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {cameras.length > 1 && isScanning && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                title="Switch Camera"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            )}

            {torchSupported && isScanning && (
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

        {/* Viewfinder / Permission Request Body */}
        <div className="p-4 bg-zinc-950 flex flex-col items-center justify-center min-h-[340px]">
          {errorMsg ? (
            <div className="p-5 text-center max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl space-y-4 animate-fade-in shadow-xl w-full">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
                <FiAlertCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">
                  {permissionDenied ? 'Camera Permission Needed' : 'Camera Unavailable'}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed">{errorMsg}</p>
              </div>

              {/* Action Buttons: Request Permission Immediately */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => requestCameraAccess()}
                  disabled={isRequesting}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
                >
                  <FiUnlock className="w-4 h-4" />
                  <span>{isRequesting ? 'Requesting Access...' : 'Request Camera Permission Now'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopScanner();
                    onClose();
                  }}
                  className="w-full py-2 px-3 text-zinc-400 hover:text-white text-xs font-semibold rounded-xl hover:bg-zinc-800/80 transition-colors"
                >
                  Use Manual / USB Barcode Scanner Instead
                </button>
              </div>

              {/* Helper tip for unlocking in address bar */}
              <div className="p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 text-[11px] text-zinc-400 text-left space-y-1">
                <p className="font-bold text-zinc-300 flex items-center gap-1.5">
                  <FiHelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>How to unblock in your browser:</span>
                </p>
                <p className="text-[10px] text-zinc-400 pl-5">
                  Tap the lock/camera icon (🔒) in your browser address bar &rarr; select <strong>Permissions</strong> &rarr; set Camera to <strong>Allow</strong>.
                </p>
              </div>
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
            {isScanning && cameras.length > 0 && selectedCameraId
              ? `Camera: ${cameras.find((c) => c.id === selectedCameraId)?.label?.slice(0, 24) || 'Active Camera'}`
              : isScanning
              ? 'Active Camera'
              : errorMsg
              ? 'Permission Required'
              : 'Waiting for permission...'}
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

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { FiX, FiCamera, FiAlertCircle } from 'react-icons/fi';

const BarcodeScannerModal = ({ isOpen, onClose, onDetected }) => {
  const [errorMsg, setErrorMsg] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef(null);
  const qrRegionId = 'html5qr-code-full-region';

  useEffect(() => {
    if (!isOpen) {
      stopScanner();
      return;
    }

    let isMounted = true;

    const startScanner = async () => {
      try {
        setErrorMsg('');
        const html5QrCode = new Html5Qrcode(qrRegionId);
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 160 },
          aspectRatio: 1.333334
        };

        await html5QrCode.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (isMounted) {
              onDetected(decodedText);
              stopScanner();
              onClose();
            }
          },
          (errorMessage) => {
            // Frame parse failures are normal while aligning
          }
        );

        if (isMounted) setIsScanning(true);
      } catch (err) {
        console.error('Camera scanner init failed:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Unable to access camera. Please allow camera permissions.');
          setIsScanning(false);
        }
      }
    };

    // Small delay to ensure DOM element is ready
    const timer = setTimeout(startScanner, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopScanner();
    };
  }, [isOpen]);

  const stopScanner = () => {
    if (scannerRef.current) {
      if (scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(err => console.error('Stop scanner error:', err));
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-black">
          <div className="flex items-center space-x-2">
            <FiCamera className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-base">Barcode Scanner</h3>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Body */}
        <div className="p-4 bg-neutral-950 flex flex-col items-center justify-center min-h-[320px]">
          {errorMsg ? (
            <div className="p-4 text-center max-w-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-xl">
              <FiAlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
              <p className="text-xs leading-relaxed">{errorMsg}</p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center">
              <div
                id={qrRegionId}
                className="w-full max-w-[320px] rounded-xl overflow-hidden border-2 border-dashed border-emerald-500/50"
              />
              <p className="mt-3 text-xs text-gray-400 text-center">
                Center product barcode or QR code within the frame to scan
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-neutral-900 border-t border-neutral-800 flex justify-end">
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="px-4 py-2 text-xs font-semibold text-gray-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            Close Scanner
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;

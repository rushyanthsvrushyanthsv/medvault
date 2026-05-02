import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        onScan(decodedText);
        if (scannerRef.current) {
          scannerRef.current.clear();
        }
      },
      (error) => {
        // console.warn(error);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
            console.error("Failed to clear scanner on unmount", error);
        });
      }
    };
  }, [onScan]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm"
    >
      <div className="bg-white rounded-[32px] p-6 w-full max-w-md relative overflow-hidden">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full transition-colors z-10"
        >
          <X className="w-6 h-6 text-slate-500" />
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Scan Patient QR</h2>
          <p className="text-slate-500 text-sm mt-1">Position the QR code within the frame</p>
        </div>

        <div id="qr-reader" className="overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50"></div>
        
        <div className="mt-6 flex justify-center">
            <div className="px-4 py-2 bg-slate-100 text-slate-500 text-xs font-bold rounded-full uppercase tracking-widest border border-slate-200">
                Camera Active
            </div>
        </div>
      </div>
    </motion.div>
  );
};

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, X } from 'lucide-react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-8 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-[100]"
        >
          <div className="bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 flex flex-col gap-6">
            <div className="flex items-start justify-between gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <Shield size={24} />
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-slate-900">Cookie Consent</h3>
              <p className="text-slate-600 leading-relaxed">
                We use cookies to enhance your experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleAccept}
                className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95"
              >
                Accept All
              </button>
              <button
                onClick={() => setIsVisible(false)}
                className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

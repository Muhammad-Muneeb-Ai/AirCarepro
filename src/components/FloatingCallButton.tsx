import { MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function FloatingCallButton() {
  const handleWhatsAppClick = () => {
    if (typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'Contact', {
        content_name: 'WhatsApp Floating Button',
        content_category: 'Chat Initiation'
      });
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes scale-pulse {
            0% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(96, 165, 250, 0.6); }
            50% { transform: scale(1.05); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 0 0 15px rgba(96, 165, 250, 0); }
            100% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 0 0 0 rgba(96, 165, 250, 0); }
          }
          .whatsapp-btn {
            animation: scale-pulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
            transition: transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease;
          }
          .whatsapp-btn:hover {
            animation: none;
            transform: scale(1.1);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1), 0 0 20px rgba(96, 165, 250, 0.8);
          }
          .shine-layer::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(to right, transparent, rgba(255,255,255,0.6), transparent);
            transform: skewX(-20deg);
          }
          .whatsapp-btn:hover .shine-layer::after {
            animation: shine 1s ease-in-out infinite;
          }
          @keyframes shine {
            100% { left: 200%; }
          }
        `}
      </style>
      <motion.a
        href="https://wa.me/16089250728?text=Hello%2C%20I%27m%20interested%20in%20your%20duct%20cleaning%20services"
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleWhatsAppClick}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        className="whatsapp-btn group fixed bottom-[20px] right-[20px] z-[60] w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700"
        aria-label="Chat on WhatsApp"
      >
        <div className="shine-layer absolute inset-0 rounded-full overflow-hidden pointer-events-none" />
        <MessageCircle size={32} className="relative z-10" />
        <span className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block z-10">
          Chat on WhatsApp
        </span>
      </motion.a>
    </>
  );
}

import { Phone } from 'lucide-react';
import { motion } from 'motion/react';

export default function FloatingCallButton() {
  return (
    <motion.a
      href="tel:+18588464843"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.1, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-[20px] right-[20px] z-[60] w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-2xl transition-colors hover:bg-blue-700"
      aria-label="Call Apex Duct Cleaning"
    >
      <Phone size={28} className="fill-current" />
      <span className="absolute right-full mr-4 bg-slate-900 text-white px-3 py-1 rounded-lg text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden md:block">
        Call Us Now
      </span>
    </motion.a>
  );
}

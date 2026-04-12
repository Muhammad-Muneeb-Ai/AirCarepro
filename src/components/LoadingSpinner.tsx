import { motion } from 'motion/react';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[9999]">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
          className="w-16 h-16 border-4 border-slate-100 border-t-[#0f3b5e] rounded-full shadow-lg"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="text-[#0f3b5e] font-bold tracking-widest uppercase text-sm"
        >
          Loading...
        </motion.p>
      </div>
    </div>
  );
}

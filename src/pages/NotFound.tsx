import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Wind, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen pt-32 pb-24 flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-2xl w-full text-center flex flex-col items-center gap-8">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-32 h-32 bg-blue-600 text-white rounded-[40px] flex items-center justify-center shadow-2xl"
        >
          <Wind size={64} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-4"
        >
          <h1 className="text-8xl font-black text-slate-900 tracking-tighter">404</h1>
          <h2 className="text-3xl font-bold text-slate-800">Page Not Found</h2>
          <p className="text-xl text-slate-500 max-w-md mx-auto leading-relaxed">
            Oops! It seems the air has cleared and this page has vanished. Let's get you back on track.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl active:scale-95"
          >
            <ArrowLeft size={24} /> Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

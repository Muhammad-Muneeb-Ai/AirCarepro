import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/admin-ddk/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-slate-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-[40px] shadow-2xl border border-slate-100 flex flex-col gap-10"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-blue-600 rounded-3xl text-white shadow-xl">
            <Shield size={40} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-slate-900">Admin Login</h1>
            <p className="text-slate-500 font-medium">Secure access to AirCare Pro management</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="admin@aircarepro.com"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                placeholder="Enter password"
              />
            </div>
          </div>

          <button
            disabled={isLoggingIn}
            type="submit"
            className="w-full bg-blue-600 text-white py-5 rounded-2xl text-xl font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {isLoggingIn ? 'Signing In...' : 'Sign In'} <ArrowRight size={24} />
          </button>
        </form>

        <p className="text-center text-sm text-slate-400">
          Authorized personnel only. All access is monitored.
        </p>
      </motion.div>
    </div>
  );
}

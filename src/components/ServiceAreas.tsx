import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, CheckCircle2, X, Phone, ArrowRight } from 'lucide-react';

const cities = [
  'Austin', 'Dallas', 'Houston', 'San Antonio', 'Fort Worth', 
  'Plano', 'Irving', 'Arlington', 'Frisco', 'El Paso', 'Corpus Christi'
];

export default function ServiceAreas() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [checkResult, setCheckResult] = useState<'success' | 'other' | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return;
    
    if (selectedCity === 'Other') {
      setCheckResult('other');
    } else {
      setCheckResult('success');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCity('');
    setCheckResult(null);
  };

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="bg-slate-900 rounded-[48px] p-8 md:p-16 overflow-hidden relative">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
            <MapPin className="w-full h-full text-blue-500 -rotate-12 translate-x-1/4" />
          </div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <span className="text-blue-400 font-bold tracking-widest uppercase text-sm">Major Metros & Coverage Area</span>
                <h2 className="text-4xl md:text-6xl font-bold text-white tracking-tight">
                  TEXAS Service Zone
                </h2>
                <p className="text-xl text-slate-400 leading-relaxed max-w-xl">
                  We provide professional HVAC cleaning services across the greater metropolitan area and surrounding communities.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {cities.map((city) => (
                  <div key={city} className="flex items-center gap-3 text-slate-300">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-medium">{city}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="w-fit bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-all hover:shadow-xl active:scale-95 flex items-center gap-2"
              >
                Check Your Area <ArrowRight size={20} />
              </button>
            </div>

            <div className="hidden lg:block relative">
              <div className="aspect-square rounded-full border-2 border-slate-800 flex items-center justify-center p-12">
                <div className="aspect-square w-full rounded-full border-2 border-slate-700 flex items-center justify-center p-12">
                  <div className="aspect-square w-full rounded-full bg-blue-600/20 flex items-center justify-center relative">
                    <MapPin className="text-blue-500 w-24 h-24 animate-bounce" />
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-3xl font-bold text-slate-900">Find Your Area</h3>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  >
                    <X size={24} className="text-slate-500" />
                  </button>
                </div>

                {!checkResult ? (
                  <form onSubmit={handleCheck} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Select Your City</label>
                      <select
                        required
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Choose a city...</option>
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all active:scale-95 shadow-lg"
                    >
                      Check Availability
                    </button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-8"
                  >
                    {checkResult === 'success' ? (
                      <div className="p-6 rounded-3xl bg-green-50 border border-green-100 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-green-600">
                          <CheckCircle2 size={24} />
                          <span className="font-bold text-xl">Great! We serve {selectedCity}.</span>
                        </div>
                        <p className="text-green-800 leading-relaxed">
                          Call <a href="tel:+18588464843" className="font-bold underline">+1 858 8464843</a> or fill the contact form to book.
                        </p>
                      </div>
                    ) : (
                      <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex flex-col gap-4">
                        <div className="flex items-center gap-3 text-blue-600">
                          <Phone size={24} />
                          <span className="font-bold text-xl">Confirm Service Area</span>
                        </div>
                        <p className="text-blue-800 leading-relaxed">
                          Please call us at <a href="tel:+18588464843" className="font-bold underline">+1 858 8464843</a> to confirm service in your area.
                        </p>
                      </div>
                    )}
                    <button
                      onClick={closeModal}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-95"
                    >
                      Close
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Wind, 
  Shield, 
  Sparkles, 
  Droplets, 
  Flame, 
  Construction, 
  CheckCircle, 
  ArrowLeft, 
  Calendar,
  Clock,
  Award,
  Zap,
  Loader2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Service } from '../types';
import { cn } from '../lib/utils';

const iconMap: { [key: string]: any } = {
  Wind, Shield, Sparkles, Droplets, Flame, Construction
};

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'services', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setService({ id: docSnap.id, ...docSnap.data() } as Service);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchService();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <h2 className="text-3xl font-bold text-slate-900">Service Not Found</h2>
        <Link to="/services" className="text-blue-600 font-bold hover:underline flex items-center gap-2">
          <ArrowLeft size={20} /> Back to Services
        </Link>
      </div>
    );
  }

  const Icon = iconMap[(service as any).iconName] || Wind;

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs & Back */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <Link to="/services" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors group">
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Back to All Services
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: Content */}
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("w-16 h-16 rounded-2xl flex items-center justify-center", (service as any).color || 'bg-blue-50 text-blue-600')}
              >
                <Icon size={32} />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight"
              >
                {service.title}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-4"
              >
                <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock size={18} />
                  <span>2-4 Hours Average</span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prose prose-lg prose-slate max-w-none"
            >
              <p className="text-xl text-slate-600 leading-relaxed">
                {service.fullDescription}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {service.benefits?.map((benefit, i) => (
                <div key={i} className="flex items-start gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <CheckCircle size={18} />
                  </div>
                  <span className="font-bold text-slate-900">{benefit}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to="/contact"
                state={{ service: service.title }}
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl active:scale-95"
              >
                {service.ctaText} <Calendar size={24} />
              </Link>
            </motion.div>
          </div>

          {/* Right: Image & Features */}
          <div className="flex flex-col gap-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[40px] overflow-hidden shadow-2xl aspect-[4/5] relative"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { icon: Award, title: 'Certified Pros', desc: 'NADCA certified technicians.' },
                { icon: Zap, title: 'Fast Service', desc: 'Same-day appointments available.' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm flex flex-col gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                    <feature.icon size={24} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-slate-900">{feature.title}</h4>
                    <p className="text-sm text-slate-500">{feature.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

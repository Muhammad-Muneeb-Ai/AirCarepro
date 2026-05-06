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
    <div className="pt-20 lg:pt-32 pb-12 lg:pb-24">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs & Back */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 lg:mb-12"
        >
          <Link to="/services" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm sm:text-base">Back to All Services</span>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
          {/* Left: Content */}
          <div className="flex flex-col gap-6 lg:gap-10">
            {/* Header Section */}
            <div className="flex flex-col gap-4 lg:gap-6 order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("w-12 h-12 lg:w-16 lg:h-16 rounded-xl lg:rounded-2xl flex items-center justify-center", (service as any).color || 'bg-blue-50 text-blue-600')}
              >
                <Icon className="w-6 h-6 lg:w-8 lg:h-8" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight"
              >
                {service.title}
              </motion.h1>
              
              {/* Desktop Price/Clock Info - Hidden on mobile in this spot to follow desired order */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden lg:flex items-center gap-4"
              >
                <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                <div className="h-6 w-px bg-slate-200" />
                <div className="flex items-center gap-2 text-slate-500 font-medium">
                  <Clock size={18} />
                  <span>2-4 Hours Average</span>
                </div>
              </motion.div>
            </div>

            {/* CTA Button - Order-2 on mobile, last on desktop */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="order-2 lg:order-last"
            >
              <Link
                to={`/contact?service=${encodeURIComponent(service.title)}`}
                className="inline-flex items-center justify-center gap-3 bg-blue-600 text-white w-full sm:w-auto px-8 lg:px-10 py-4 lg:py-5 rounded-full text-lg lg:text-xl font-bold hover:bg-blue-700 transition-all shadow-xl hover:shadow-2xl active:scale-95"
              >
                {service.ctaText} <Calendar className="w-5 h-5 lg:w-6 lg:h-6" />
              </Link>
            </motion.div>

            {/* Mobile Price/Clock Info - Shown here to follow description order */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex lg:hidden items-center gap-3 sm:gap-4 order-3"
            >
              <span className="text-xl sm:text-2xl font-bold text-blue-600">{service.price}</span>
              <div className="h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-2 text-slate-500 text-sm sm:text-base font-medium">
                <Clock size={16} />
                <span>2-4 Hours</span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="prose prose-sm sm:prose-base lg:prose-lg prose-slate max-w-none order-4"
            >
              <p className="text-base sm:text-lg lg:text-xl text-slate-600 leading-relaxed">
                {service.fullDescription}
              </p>
            </motion.div>

            {/* Benefits List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 order-5"
            >
              {service.benefits?.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3 sm:gap-4 p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <CheckCircle size={14} className="sm:w-4.5 sm:h-4.5" />
                  </div>
                  <span className="font-bold text-sm sm:text-base text-slate-900">{benefit}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right: Image & Features */}
          <div className="flex flex-col gap-8 lg:gap-12 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-[24px] lg:rounded-[40px] overflow-hidden shadow-2xl aspect-[16/9] lg:aspect-[4/5] relative"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                { icon: Award, title: 'Certified Pros', desc: 'NADCA certified technicians.' },
                { icon: Zap, title: 'Fast Service', desc: 'Same-day appointments.' },
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="p-6 lg:p-8 rounded-[24px] lg:rounded-[32px] bg-white border border-slate-100 shadow-sm flex flex-col gap-3 lg:gap-4"
                >
                  <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                    <feature.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-bold text-sm lg:text-base text-slate-900">{feature.title}</h4>
                    <p className="text-xs lg:text-sm text-slate-500">{feature.desc}</p>
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

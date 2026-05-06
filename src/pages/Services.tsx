import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Wind, Shield, Sparkles, Droplets, Flame, Construction, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import ServiceAreas from '../components/ServiceAreas';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, getDocs } from 'firebase/firestore';
import { Service } from '../types';

const iconMap: { [key: string]: any } = {
  Wind, Shield, Sparkles, Droplets, Flame, Construction
};

const colorMap: { [key: string]: string } = {
  'bg-blue-50 text-blue-600': 'bg-blue-50 text-blue-600',
  'bg-green-50 text-green-600': 'bg-green-50 text-green-600',
  'bg-orange-50 text-orange-600': 'bg-orange-50 text-orange-600',
  'bg-red-50 text-red-600': 'bg-red-50 text-red-600',
  'bg-slate-50 text-slate-600': 'bg-slate-50 text-slate-600',
  'bg-cyan-50 text-cyan-600': 'bg-cyan-50 text-cyan-600',
};

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services');
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="pt-20 lg:pt-32 pb-12 lg:pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-blue-600 font-bold tracking-widest uppercase text-xs lg:text-sm"
          >
            Our Services
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-6xl font-bold text-slate-900 tracking-tight mt-4"
          >
            Professional HVAC Solutions in the <span className="text-blue-600">USA</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-600 mt-4 lg:mt-6 leading-relaxed"
          >
            We offer a full range of HVAC cleaning and restoration services to ensure your home or business has the cleanest air possible.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {services.map((service, index) => {
            const Icon = iconMap[(service as any).iconName] || Wind;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-[24px] lg:rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col md:flex-row"
              >
                <div className="md:w-2/5 relative overflow-hidden aspect-[16/9] md:aspect-auto">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <div className="md:w-3/5 p-6 lg:p-10 flex flex-col gap-4 lg:gap-6">
                  <div className="flex items-center justify-between">
                    <div className={cn("p-3 rounded-2xl", (service as any).color || 'bg-blue-50 text-blue-600')}>
                      <Icon size={24} />
                    </div>
                    <span className="text-blue-600 font-bold text-lg">{service.price}</span>
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-2xl font-bold text-slate-900">{service.title}</h3>
                    <p className="text-slate-600 leading-relaxed">
                      {service.shortDescription}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {service.benefits?.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                        <CheckCircle className="text-blue-500 shrink-0" size={16} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to={`/services/${service.id}`}
                    className="mt-auto bg-slate-900 text-white px-6 py-3 rounded-2xl text-center font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    {service.ctaText || 'Learn More'} <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Before/After Slider Section */}
        <div className="mt-32">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-600 font-bold tracking-widest uppercase text-sm"
            >
              See the Difference
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mt-4"
            >
              Transform Your Air Quality
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 mt-6 leading-relaxed"
            >
              Visualize the impact of professional cleaning. Our advanced equipment removes years of hidden buildup, ensuring a healthier environment for your family.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Air Duct Cleaning Slider */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div className="rounded-[32px] overflow-hidden shadow-2xl border-4 border-white aspect-[3/2]">
                <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src="https://q3zyn4woatazi.ok.kimi.link/images/before-duct.jpg" alt="Air Duct Before" referrerPolicy="no-referrer" style={{ objectFit: 'cover' }} />}
                  itemTwo={<ReactCompareSliderImage src="https://q3zyn4woatazi.ok.kimi.link/images/after-duct.jpg" alt="Air Duct After" referrerPolicy="no-referrer" style={{ objectFit: 'cover' }} />}
                  className="h-full"
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900">Air Duct Cleaning</h3>
                <p className="text-slate-500 font-medium">Removing years of dust and microbial growth</p>
              </div>
            </motion.div>

            {/* Dryer Vent Cleaning Slider */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-6"
            >
              <div className="rounded-[32px] overflow-hidden shadow-2xl border-4 border-white aspect-[3/2]">
                <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src="https://i.ibb.co/mrTLCkfG/Screenshot-2026-0412-144522.png" alt="Dryer Vent Before" referrerPolicy="no-referrer" style={{ objectFit: 'cover' }} />}
                  itemTwo={<ReactCompareSliderImage src="https://i.ibb.co/8gjkbTjs/Screenshot-2026-0412-144542.png" alt="Dryer Vent After" referrerPolicy="no-referrer" style={{ objectFit: 'cover' }} />}
                  className="h-full"
                />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-900">Dryer Vent Cleaning</h3>
                <p className="text-slate-500 font-medium">Eliminating fire hazards and improving efficiency</p>
              </div>
            </motion.div>
          </div>
        </div>

        <ServiceAreas />

        {/* Trust Section */}
        <div className="mt-16 lg:mt-32 bg-slate-50 rounded-[24px] lg:rounded-[40px] p-8 lg:p-20 flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <div className="lg:w-1/2 flex flex-col gap-6 lg:gap-8">
            <h2 className="text-2xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Our Multi-Step Cleaning Process
            </h2>
            <p className="text-base lg:text-lg text-slate-600 leading-relaxed">
              We follow NADCA standards to ensure a thorough cleaning of your entire HVAC system. Our process includes source removal, HEPA filtration, and optional antimicrobial treatment.
            </p>
            <div className="flex flex-col gap-4 lg:gap-6">
              {[
                { title: 'Inspection', desc: 'Detailed assessment of your system and air quality.' },
                { title: 'Preparation', desc: 'Protecting your home and sealing the system.' },
                { title: 'Source Removal', desc: 'Agitation and high-powered vacuum extraction.' },
                { title: 'Verification', desc: 'Final inspection to ensure complete cleanliness.' },
              ].map((step, i) => (
                <div key={step.title} className="flex gap-4">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 text-sm lg:text-base">
                    {i + 1}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h4 className="font-bold text-slate-900 text-sm lg:text-base">{step.title}</h4>
                    <p className="text-slate-600 text-xs lg:text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="rounded-3xl overflow-hidden shadow-2xl">
              <img src="https://picsum.photos/seed/process/800/1000" alt="Our process" className="w-full h-auto" referrerPolicy="no-referrer" loading="lazy" />
            </div>
            <div className="absolute -bottom-10 -right-10 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hidden md:block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                  <Shield size={32} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-slate-900">100%</span>
                  <span className="text-sm text-slate-500 font-medium">Satisfaction Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

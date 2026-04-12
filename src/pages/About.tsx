import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, Wind, Award, Sparkles, Heart, CheckCircle, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const iconMap: { [key: string]: any } = {
  Award, Users, Wind, Shield
};

export default function About() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'page_content', 'about'), (docSnap) => {
      if (docSnap.exists()) {
        setContent(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching page content:", error);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <div className="pt-32 pb-24 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="pt-32 pb-24 text-center">
        <h1 className="text-4xl font-bold text-slate-900">Content Not Found</h1>
        <p className="text-slate-500 mt-4">Please seed the content from the admin panel.</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">{content.story?.badge}</span>
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight">
              {content.story?.title}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed">
              {content.story?.description1}
            </p>
            <p className="text-lg text-slate-600 leading-relaxed">
              {content.story?.description2}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                'Family Owned & Operated',
                'NADCA Certified Technicians',
                'State-of-the-Art Equipment',
                'Eco-Friendly Solutions',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 font-bold text-slate-800">
                  <CheckCircle className="text-blue-600" size={20} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <div className="rounded-[40px] overflow-hidden shadow-2xl border-8 border-white">
              <img src={content.story?.image} alt="Our team at work" className="w-full h-auto" referrerPolicy="no-referrer" loading="lazy" />
            </div>
            <div className="absolute -bottom-10 -left-10 bg-blue-600 p-8 rounded-3xl shadow-xl text-white hidden md:block">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl">
                  <Award size={32} />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">#1 Rated</span>
                  <span className="text-sm font-medium opacity-80 text-blue-100">HVAC Cleaner in TX</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-32">
          {content.stats?.map((stat: any, index: number) => {
            const Icon = iconMap[stat.iconName] || Award;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 text-center flex flex-col items-center gap-4 hover:bg-white hover:shadow-xl transition-all"
              >
                <div className="p-4 bg-blue-100 text-blue-600 rounded-2xl">
                  <Icon size={32} />
                </div>
                <span className="text-4xl font-bold text-slate-900">{stat.value}</span>
                <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">{stat.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-12 rounded-[40px] bg-slate-900 text-white flex flex-col gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[120px] opacity-20" />
            <div className="p-4 bg-blue-600 rounded-2xl w-fit relative z-10">
              <Sparkles size={32} />
            </div>
            <h2 className="text-3xl font-bold relative z-10">{content.mission?.title}</h2>
            <p className="text-lg text-slate-400 leading-relaxed relative z-10">
              {content.mission?.description}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="p-12 rounded-[40px] bg-blue-600 text-white flex flex-col gap-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[120px] opacity-20" />
            <div className="p-4 bg-white/20 rounded-2xl w-fit relative z-10">
              <Heart size={32} />
            </div>
            <h2 className="text-3xl font-bold relative z-10">{content.vision?.title}</h2>
            <p className="text-lg text-blue-100 leading-relaxed relative z-10">
              {content.vision?.description}
            </p>
          </motion.div>
        </div>

        {/* Team Section */}
        {content.team && (
          <div className="mb-32">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-5xl font-bold text-slate-900 mb-6"
              >
                Meet Our Expert Team
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-slate-600"
              >
                Dedicated, NADCA-certified technicians with years of experience in HVAC restoration and air quality solutions.
              </motion.p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {content.team.map((member: any, index: number) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="aspect-square rounded-2xl overflow-hidden mb-6">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{member.name}</h3>
                  <p className="text-blue-600 font-semibold text-sm mb-3">{member.role}</p>
                  <p className="text-slate-500 text-sm leading-relaxed">{member.bio}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Send, CheckCircle, Facebook, Twitter, Instagram, Linkedin, Loader2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc, serverTimestamp, doc, onSnapshot, query, orderBy } from 'firebase/firestore';
import { toast } from 'sonner';
import { Service } from '../types';

const iconMap: { [key: string]: any } = {
  Phone, Mail, MapPin
};

export default function Contact() {
  const [content, setContent] = useState<any>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const unsubContent = onSnapshot(doc(db, 'page_content', 'contact'), (docSnap) => {
      if (docSnap.exists()) {
        setContent(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'page_content/contact');
      setLoading(false);
    });

    const qServices = query(collection(db, 'services'), orderBy('title', 'asc'));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services');
    });

    return () => {
      unsubContent();
      unsubServices();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Store in Firestore
      await addDoc(collection(db, 'leads'), {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'leads');
    }

    try {
      // 2. Send Email Notification via Netlify Function
      try {
        const response = await fetch('/.netlify/functions/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Email error response:', errorData);
        }
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
      }
      
      setIsSuccess(true);
      toast.success('Message sent successfully! We will contact you soon.');
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const contactItems = [
    { icon: Phone, label: 'Call Us', value: content.info?.phone, href: `tel:${content.info?.phone?.replace(/\D/g, '')}`, color: 'bg-blue-100 text-blue-600' },
    { icon: Mail, label: 'Email Us', value: content.info?.email, href: `mailto:${content.info?.email}`, color: 'bg-green-100 text-green-600' },
    { icon: MapPin, label: 'Visit Us', value: content.info?.address, color: 'bg-orange-100 text-orange-600' },
  ];

  return (
    <div className="pt-32 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-blue-600 font-bold tracking-widest uppercase text-sm"
          >
            Contact Us
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mt-4"
          >
            {content.info?.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 mt-6 leading-relaxed"
          >
            {content.info?.description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[40px] shadow-2xl border border-slate-100"
          >
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-12">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-bold text-slate-900">Message Sent!</h2>
                <p className="text-lg text-slate-600 max-w-md">
                  Thank you for reaching out. One of our experts will contact you shortly to discuss your needs.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-700 transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Full Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Email Address</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Select Service</label>
                    <select
                      required
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all appearance-none"
                    >
                      <option value="">Select a service</option>
                      {services.map((s) => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Your Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                    placeholder="Tell us about your needs..."
                  />
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="bg-blue-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl active:scale-95"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'} <Send size={24} />
                </button>
              </form>
            )}
          </motion.div>

          {/* Contact Info Cards */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            {contactItems.map((info, index) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-6 hover:bg-white hover:shadow-xl transition-all"
              >
                <div className={`p-4 rounded-2xl ${info.color}`}>
                  <info.icon size={24} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">{info.label}</span>
                  {info.href ? (
                    <a 
                      href={info.href} 
                      className="text-lg font-bold text-[#0f3b5e] hover:text-blue-600 hover:underline transition-all"
                    >
                      {info.value}
                    </a>
                  ) : (
                    <span className="text-lg font-bold text-slate-900">{info.value}</span>
                  )}
                </div>
              </motion.div>
            ))}

            {/* Support Image Placeholder */}
            <div className="mt-4 rounded-3xl overflow-hidden shadow-lg h-80 bg-slate-200 relative group">
              <img 
                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800" 
                alt="Friendly HVAC Technician" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/hvac-support/800/600';
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 backdrop-blur-[2px]">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mb-4 shadow-xl animate-bounce">
                  <Phone size={32} />
                </div>
                <h4 className="text-2xl font-bold text-white mb-2">Expert Support</h4>
                <p className="text-blue-50 font-medium leading-relaxed">
                  Our certified technicians are ready to help you with all your HVAC needs.
                </p>
                <a 
                  href={`tel:${content.info?.phone?.replace(/\D/g, '')}`}
                  className="mt-6 bg-white text-blue-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-50 transition-all shadow-lg"
                >
                  Call Now
                </a>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="mt-8 p-8 rounded-3xl bg-blue-600 text-white shadow-xl">
              <h3 className="text-xl font-bold mb-6">Connect With Us</h3>
              <div className="flex gap-4">
                {[
                  { icon: Facebook, label: 'Facebook' },
                  { icon: Twitter, label: 'Twitter' },
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Linkedin, label: 'LinkedIn' },
                ].map((social) => (
                  <a
                    key={social.label}
                    href="#"
                    className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/40 transition-all active:scale-90"
                    aria-label={social.label}
                  >
                    <social.icon size={24} />
                  </a>
                ))}
              </div>
              <p className="mt-6 text-blue-100 text-sm leading-relaxed">
                Follow us for air quality tips, special offers, and behind-the-scenes looks at our restoration projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'motion/react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { 
  Shield, 
  CheckCircle, 
  Star, 
  ArrowRight,
  ArrowDown,
  Wind, 
  Sparkles, 
  Phone, 
  Camera, 
  ClipboardCheck, 
  Award, 
  BadgeDollarSign,
  Loader2,
  Droplets,
  Clock,
  Users,
  Play,
  Calendar,
  Search,
  Zap,
  MessageCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { Service, BlogPost } from '../types';

// Lazy load below-the-fold components
const ServiceAreas = lazy(() => import('../components/ServiceAreas'));
const Testimonials = lazy(() => import('../components/Testimonials'));
const BlogPreview = lazy(() => import('../components/BlogPreview'));

const services = [
  {
    title: 'Air Duct Cleaning',
    description: 'Clinical-grade removal of dust, debris, and microbial growth. Improves airflow and eliminates allergens.',
    benefits: ['Improved Air Quality', 'Energy Efficiency', 'Reduced Allergens'],
    icon: Wind,
    color: 'bg-blue-50 text-blue-600',
    image: 'https://q3zyn4woatazi.ok.kimi.link/images/blog-1.jpg',
    price: 'From $299',
    isBestSeller: true,
  },
  {
    title: 'HVAC Restoration',
    description: 'Complete internal system deep clean and restoration. Extends equipment life and reduces energy costs.',
    benefits: ['System Longevity', 'Peak Performance', 'Cost Savings'],
    icon: Shield,
    color: 'bg-blue-50 text-blue-600',
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800',
    price: 'From $499',
  },
  {
    title: 'Dryer Vent Cleaning',
    description: 'High-pressure lint removal to prevent fire hazards and improve drying efficiency.',
    benefits: ['Fire Prevention', 'Faster Drying', 'Energy Savings'],
    icon: Sparkles,
    color: 'bg-blue-50 text-blue-600',
    image: 'https://i.ibb.co/JRH1Hvg1/image-2.png',
    price: 'From $129',
  },
];

const whyChooseUs = [
  {
    title: 'Before & After Photo Proof',
    description: 'We document our work with high-resolution photos so you can see the results for yourself.',
    icon: Camera,
  },
  {
    title: '127-Point Cleaning Checklist',
    description: 'Our rigorous inspection and cleaning protocol ensures no detail is overlooked.',
    icon: ClipboardCheck,
  },
  {
    title: 'Certified & Insured Technicians',
    description: 'Our team is NADCA certified and fully insured for your complete peace of mind.',
    icon: Award,
  },
  {
    title: 'Upfront Honest Pricing',
    description: 'No hidden fees or surprise upcharges. We provide clear, detailed quotes before any work begins.',
    icon: BadgeDollarSign,
  },
];

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Homeowner',
    text: 'Apex Duct Cleaning did an amazing job cleaning our ducts. The air feels so much fresher now!',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Property Manager',
    text: 'Professional, punctual, and thorough. We use them for all our commercial properties.',
    rating: 5,
  },
  {
    name: 'Emily Davis',
    role: 'Homeowner',
    text: 'The team was very respectful of our home and the results were immediate. Highly recommend!',
    rating: 5,
  },
];

export default function Home() {
  const [latestPosts, setLatestPosts] = useState<BlogPost[]>([]);
  const [servicesList, setServicesList] = useState<Service[]>([]);
  const [pageContent, setPageContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch latest 3 blog posts
    const qPosts = query(
      collection(db, 'blog_posts'),
      where('status', '==', 'published'),
      orderBy('publish_date', 'desc'),
      limit(3)
    );

    const unsubPosts = onSnapshot(qPosts, (snapshot) => {
      setLatestPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'blog_posts');
    });

    // Fetch top 3 services for preview
    const qServices = query(
      collection(db, 'services'),
      orderBy('order', 'asc'),
      limit(3)
    );

    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServicesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services');
    });

    // Fetch page content
    const unsubContent = onSnapshot(doc(db, 'page_content', 'homepage'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPageContent(data);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'page_content/homepage');
      setLoading(false);
    });

    return () => {
      unsubPosts();
      unsubServices();
      unsubContent();
    };
  }, []);

  const rawHero = pageContent?.hero || {
    badge: 'Certified HVAC Professionals',
    title: 'Breathe Cleaner Air with Apex Care Pro',
    description: 'Professional air duct cleaning and HVAC restoration services for homes and businesses. We improve your health and save you money.',
    image: 'https://q3zyn4woatazi.ok.kimi.link/images/hero-technician.jpg'
  };

  const heroContent = {
    ...rawHero,
    title: rawHero.title?.replace('AirCare Pro', 'Apex Care Pro').replace('ApexCare Pro', 'Apex Care Pro') || 'Breathe Cleaner Air with Apex Care Pro'
  };

  const whyChooseUsContent = pageContent?.whyChooseUs || [
    {
      title: 'Before & After Photo Proof',
      description: 'We document our work with high-resolution photos so you can see the results for yourself.',
      iconName: 'Camera',
    },
    {
      title: '127-Point Cleaning Checklist',
      description: 'Our rigorous inspection and cleaning protocol ensures no detail is overlooked.',
      iconName: 'ClipboardCheck',
    },
    {
      title: 'Certified & Insured Technicians',
      description: 'Our team is NADCA certified and fully insured for your complete peace of mind.',
      iconName: 'Award',
    },
    {
      title: 'Upfront Honest Pricing',
      description: 'No hidden fees or surprise upcharges. We provide clear, detailed quotes before any work begins.',
      iconName: 'BadgeDollarSign',
    },
  ];

  const testimonialsContent = pageContent?.testimonials || [
    {
      name: 'Sarah Johnson',
      role: 'Homeowner',
            text: 'Apex Duct Cleaning did an amazing job cleaning our ducts. The air feels so much fresher now!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Property Manager',
      text: 'Professional, punctual, and thorough. We use them for all our commercial properties.',
      rating: 5,
    },
    {
      name: 'Emily Davis',
      role: 'Homeowner',
      text: 'The team was very respectful of our home and the results were immediate. Highly recommend!',
      rating: 5,
    },
  ];

  const statsContent = pageContent?.stats || [
    { label: 'Years Experience', value: '15+' },
    { label: 'Happy Clients', value: '5k+' },
    { label: 'Average Rating', value: '4.9/5' },
  ];

  const ctaContent = {
    ...(pageContent?.cta || {
      title: 'Ready for a Healthier Home Environment?',
      description: 'Contact us today for a free inspection and quote. Our experts are ready to help you breathe easier.',
      phone: '(608) 925-0728'
    }),
    phone: '(608) 925-0728'
  };

  const iconMap: any = {
    Camera, ClipboardCheck, Award, BadgeDollarSign, Wind, Shield, Sparkles, Droplets, Phone
  };
  return (
    <div className="overflow-hidden">
      {/* LocalBusiness Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "name": "Apex Duct Cleaning",
          "image": heroContent.image,
          "@id": "",
          "url": window.location.origin,
          "telephone": ctaContent.phone,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "123 Clean Air Way",
            "addressLocality": "Houston",
            "addressRegion": "TX",
            "postalCode": "77001",
            "addressCountry": "US"
          },
          "geo": {
            "@type": "GeoCoordinates",
            "latitude": 29.7604,
            "longitude": -95.3698
          },
          "openingHoursSpecification": {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday"
            ],
            "opens": "00:00",
            "closes": "23:59"
          }
        })}
      </script>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex flex-col gap-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold w-fit">
              <Shield size={16} />
              <span>{heroContent.badge}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 leading-[1.1]">
              {heroContent.title}
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-xl">
              {heroContent.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/contact"
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-all hover:shadow-xl active:scale-95 flex items-center justify-center gap-2"
              >
                Request Service <ArrowRight size={20} />
              </Link>
              <Link
                to="/services"
                className="w-full sm:w-auto bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-slate-50 transition-all active:scale-95 text-center"
              >
                Our Services
              </Link>
            </div>
            <div className="flex items-center gap-8 pt-4">
              {statsContent.map((stat: any, i: number) => (
                <div key={i} className="flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-slate-900">{stat.value}</span>
                    <span className="text-sm text-slate-500 font-medium">{stat.label}</span>
                  </div>
                  {i < statsContent.length - 1 && <div className="w-px h-10 bg-slate-200" />}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="relative"
          >
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <img
                src={heroContent.image}
                alt="HVAC Professional at work"
                className="w-full h-auto object-contain hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
                loading="eager"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-green-200 rounded-full blur-3xl opacity-50 -z-10 animate-pulse" />
          </motion.div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-600 font-bold tracking-widest uppercase text-sm"
            >
              Our Expertise
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mt-4"
            >
              Our Complete Solutions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 mt-6 leading-relaxed"
            >
              Clinical-grade environmental restoration for residential and commercial spaces. Engineered for purity, performance, and peace of mind.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {servicesList.map((service, index) => {
              const ServiceIcon = iconMap[service.iconName] || Wind;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="group relative bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
                >
                  {index === 0 && (
                    <div className="absolute top-4 right-4 z-20 bg-blue-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                      Best Seller
                    </div>
                  )}
                  <div className="h-64 relative overflow-hidden">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <div className="p-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                      <div className={cn("p-3 rounded-2xl bg-blue-50 text-blue-600")}>
                        <ServiceIcon size={24} />
                      </div>
                      <span className="text-blue-600 font-bold text-lg">{service.price}</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <h3 className="text-2xl font-bold text-slate-900">{service.title}</h3>
                      <p className="text-slate-600 leading-relaxed line-clamp-2">
                        {service.shortDescription}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {service.benefits?.slice(0, 3).map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2 text-sm font-medium text-slate-700">
                          <CheckCircle className="text-blue-500 shrink-0" size={16} />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                    <Link
                      to={`/services/${service.id}`}
                      className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-2xl text-center font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                      {service.ctaText || 'Learn More'} <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Before/After Slider Section */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
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
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-[#f8fafc]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-600 font-bold tracking-widest uppercase text-sm"
            >
              Our Process
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-blue-600 tracking-tight mt-4"
            >
              OUR PROCESS
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-slate-600 mt-6 leading-relaxed"
            >
              Professional air duct cleaning in four simple steps
            </motion.p>
          </div>

          <div className="flex flex-col md:flex-row items-stretch justify-center gap-4 md:gap-0">
            {[
              {
                title: 'Advanced System Audit',
                desc: 'Our experts perform a clinical-grade assessment of your HVAC infrastructure and provide a transparent, detailed report.',
                step: 1
              },
              {
                title: 'Schedule Service',
                desc: 'Choose a convenient time. We offer flexible scheduling including weekends.',
                step: 2
              },
              {
                title: 'Professional Cleaning',
                desc: 'Our certified technicians complete the job using industry-leading equipment.',
                step: 3
              },
              {
                title: 'Enjoy Clean Air',
                desc: 'Breathe easier with improved air quality and energy efficiency.',
                step: 4
              }
            ].map((item, index, array) => (
              <div key={index} className="flex flex-col md:flex-row items-center w-full md:flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="flex flex-col items-center text-center p-6 bg-white rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.1)] transition-all duration-300 w-full h-full"
                >
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold shrink-0 mb-6 shadow-lg shadow-blue-200">
                    {item.step}
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <h3 className="text-xl font-semibold text-[#0f3b5e] leading-tight">{item.title}</h3>
                    <p className="text-[#334155] text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
                
                {index < array.length - 1 && (
                  <div className="flex items-center justify-center py-6 md:py-0 md:px-2 z-10">
                    <div className="w-10 h-10 rounded-full bg-[#e0edf5] flex items-center justify-center text-[#0f3b5e] shadow-sm shrink-0">
                      <ArrowRight className="hidden md:block" size={20} />
                      <ArrowDown className="md:hidden" size={20} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-blue-600 font-bold tracking-widest uppercase text-sm"
            >
              The Apex Advantage
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mt-4"
            >
              Why Choose Us
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUsContent.map((item: any, index: number) => {
              const ItemIcon = iconMap[item.iconName] || Shield;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col gap-6"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                    <ItemIcon size={28} />
                  </div>
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight">{item.title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="py-24 text-center text-slate-400">Loading areas...</div>}>
        <ServiceAreas />
      </Suspense>

      {/* Testimonials */}
      <Suspense fallback={<div className="py-24 text-center text-slate-400">Loading testimonials...</div>}>
        <Testimonials content={testimonialsContent} />
      </Suspense>

      {/* Blog Preview */}
      <Suspense fallback={<div className="py-24 text-center text-slate-400">Loading blog...</div>}>
        <BlogPreview posts={latestPosts} />
      </Suspense>

      {/* CTA Section */}
      <section className="py-24 container mx-auto px-4">
        <div className="bg-blue-600 rounded-[40px] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
            <Wind className="absolute -top-10 -left-10 w-64 h-64 rotate-45" />
            <Wind className="absolute -bottom-10 -right-10 w-64 h-64 -rotate-45" />
          </div>
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col gap-8">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              {ctaContent.title}
            </h2>
            <p className="text-xl text-blue-100 leading-relaxed">
              {ctaContent.description}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/contact"
                className="w-full sm:w-auto bg-white text-blue-600 px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-50 transition-all hover:shadow-xl active:scale-95"
              >
                Get Started Now
              </Link>
              <a
                href="https://wa.me/16089250728?text=Hello%2C%20I%27m%20interested%20in%20your%20duct%20cleaning%20services"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-blue-700 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-3"
              >
                <MessageCircle size={24} /> {ctaContent.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

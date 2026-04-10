import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  CheckCircle, 
  Star, 
  ArrowRight, 
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
  Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import ServiceAreas from '../components/ServiceAreas';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc } from 'firebase/firestore';
import { Service, BlogPost } from '../types';

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
    text: 'AirCare Pro did an amazing job cleaning our ducts. The air feels so much fresher now!',
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
      console.error("Error fetching latest blog posts:", error);
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
      console.error("Error fetching services:", error);
    });

    // Fetch page content
    const unsubContent = onSnapshot(doc(db, 'page_content', 'homepage'), (docSnap) => {
      if (docSnap.exists()) {
        setPageContent(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching page content:", error);
      setLoading(false);
    });

    return () => {
      unsubPosts();
      unsubServices();
      unsubContent();
    };
  }, []);

  const heroContent = pageContent?.hero || {
    badge: 'Certified HVAC Professionals',
    title: 'Breathe Cleaner Air with AirCare Pro',
    description: 'Professional air duct cleaning and HVAC restoration services for homes and businesses. We improve your health and save you money.',
    image: 'https://q3zyn4woatazi.ok.kimi.link/images/hero-technician.jpg'
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
      text: 'AirCare Pro did an amazing job cleaning our ducts. The air feels so much fresher now!',
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

  const ctaContent = pageContent?.cta || {
    title: 'Ready for a Healthier Home Environment?',
    description: 'Contact us today for a free inspection and quote. Our experts are ready to help you breathe easier.',
    phone: '(800) 555-0199'
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
          "name": "AirCare Pro",
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
                loading="lazy"
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
              The AirCare Advantage
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
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
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

      <ServiceAreas />

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mt-4">
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsContent.map((t: any, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="p-8 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-6"
              >
                <div className="flex gap-1">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                  ))}
                </div>
                <p className="text-lg text-slate-700 italic leading-relaxed">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-4 mt-auto">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                    {t.name[0]}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{t.name}</span>
                    <span className="text-sm text-slate-500">{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Preview */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col items-center text-center gap-4 mb-16">
            <div className="flex flex-col gap-4 max-w-2xl mx-auto">
              <span className="text-blue-600 font-bold tracking-widest uppercase text-sm">Latest Insights</span>
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
                From Our Blog
              </h2>
            </div>
            <Link 
              to="/blog" 
              className="md:absolute md:right-0 md:bottom-0 text-blue-600 font-bold flex items-center gap-2 hover:gap-4 transition-all mt-4 md:mt-0"
            >
              View All Posts <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.featured_image_url || 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=800'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=800';
                    }}
                  />
                </div>
                <div className="p-8">
                  <span className="text-blue-600 text-xs font-bold uppercase tracking-widest">{post.category || 'Maintenance'}</span>
                  <h3 className="text-xl font-bold text-slate-900 mt-2 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <Link to={`/blog/${post.slug}`} className="text-blue-600 font-bold flex items-center gap-2 group/link">
                    Read More <ArrowRight size={16} className="group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
                href={`tel:${ctaContent.phone.replace(/\D/g, '')}`}
                className="w-full sm:w-auto bg-blue-700 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center gap-3"
              >
                <Phone size={24} /> {ctaContent.phone}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

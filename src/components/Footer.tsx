import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-slate-800 pb-16">
        {/* Brand */}
        <div className="flex flex-col gap-6">
          <Link to="/" className="w-fit">
            <Logo textSize="text-xl text-white" />
          </Link>
          <p className="text-slate-400 leading-relaxed">
            Professional air duct cleaning and HVAC restoration services. We improve your indoor air quality and system efficiency.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all">
              <Facebook size={18} />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all">
              <Twitter size={18} />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all">
              <Instagram size={18} />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-6">
          <h4 className="text-white font-bold text-lg">Quick Links</h4>
          <ul className="flex flex-col gap-4">
            <li><Link to="/" className="hover:text-blue-500 transition-colors">Home</Link></li>
            <li><Link to="/about" className="hover:text-blue-500 transition-colors">About Us</Link></li>
            <li><Link to="/services" className="hover:text-blue-500 transition-colors">Our Services</Link></li>
            <li><Link to="/contact" className="hover:text-blue-500 transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Services */}
        <div className="flex flex-col gap-6">
          <h4 className="text-white font-bold text-lg">Services</h4>
          <ul className="flex flex-col gap-4">
            <li><Link to="/services" className="hover:text-blue-500 transition-colors">Air Duct Cleaning</Link></li>
            <li><Link to="/services" className="hover:text-blue-500 transition-colors">HVAC Restoration</Link></li>
            <li><Link to="/services" className="hover:text-blue-500 transition-colors">Dryer Vent Cleaning</Link></li>
            <li><Link to="/services" className="hover:text-blue-500 transition-colors">Damage Restoration</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-6">
          <h4 className="text-white font-bold text-lg">Contact Info</h4>
          <ul className="flex flex-col gap-4">
            <li className="flex items-start gap-3">
              <MapPin className="text-blue-500 shrink-0" size={20} />
              <span>123 Clean Air Way, Suite 100, Houston, TX 77001</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="text-blue-500 shrink-0" size={20} />
              <a href="tel:+18005550199" className="hover:text-blue-400 transition-colors">(800) 555-0199</a>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="text-blue-500 shrink-0" size={20} />
              <a href="mailto:info@aircarepro.com" className="hover:text-blue-400 transition-colors">info@aircarepro.com</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container mx-auto px-4 pt-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} AirCare Pro. All rights reserved.</p>
        <div className="flex items-center gap-8">
          <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}

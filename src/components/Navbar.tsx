import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LayoutDashboard, MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { useAuth } from '../context/AuthContext';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Blog', path: '/blog' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 w-full z-50 transition-all duration-300',
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link to="/">
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-medium transition-colors hover:text-blue-600',
                location.pathname === link.path ? 'text-blue-600' : 'text-slate-600'
              )}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/contact"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-all hover:shadow-lg active:scale-95"
          >
            Request Service
          </Link>
          <div className="flex items-center gap-2 border-l border-slate-200 pl-6 ml-2">
            <MessageCircle className="text-blue-500 shrink-0" size={20} />
            <a
              href="https://wa.me/16089250728?text=Hello%2C%20I%27m%20interested%20in%20your%20duct%20cleaning%20services"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-800 font-bold hover:text-blue-600 transition-colors"
            >
              (608) 925-0728
            </a>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden p-2 text-slate-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    'text-lg font-medium py-2',
                    location.pathname === link.path ? 'text-blue-600' : 'text-slate-600'
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/contact"
                className="bg-blue-600 text-white px-5 py-3 rounded-xl text-center font-semibold hover:bg-blue-700 transition-all"
              >
                Request Service
              </Link>
              <div className="flex items-center justify-center gap-2 mt-4 pb-2">
                <MessageCircle className="text-blue-500 shrink-0" size={20} />
                <a
                  href="https://wa.me/16089250728?text=Hello%2C%20I%27m%20interested%20in%20your%20duct%20cleaning%20services"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-800 font-bold hover:text-blue-600 transition-colors"
                >
                  (608) 925-0728
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

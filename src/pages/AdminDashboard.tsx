import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle, 
  XCircle, 
  Download, 
  Search,
  Eye,
  Wind,
  Shield,
  Sparkles,
  Menu,
  X,
  FileText,
  Database
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, updateDoc, doc, deleteDoc, addDoc, where, getDocs, Timestamp } from 'firebase/firestore';
import { Lead, Service, BlogPost } from '../types';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

const formatDate = (date: any, includeTime: boolean = true) => {
  if (!date) return '';
  const d = date instanceof Date ? date : date?.toDate ? date.toDate() : null;
  if (!d) return String(date);
  return includeTime ? d.toLocaleString() : d.toLocaleDateString();
};

export default function AdminDashboard() {
  const { logout } = useAuth();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showConfirm = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const sidebarLinks = [
    { name: 'Dashboard', path: '/admin-ddk/dashboard', icon: LayoutDashboard },
    { name: 'Leads', path: '/admin-ddk/dashboard/leads', icon: Users },
    { name: 'Services', path: '/admin-ddk/dashboard/services', icon: Sparkles },
    { name: 'Blog', path: '/admin-ddk/dashboard/blog', icon: FileText },
    { name: 'Page Content', path: '/admin-ddk/dashboard/content', icon: Database },
    { name: 'Settings', path: '/admin-ddk/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex pt-20">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 pt-24 transition-transform duration-300 md:translate-x-0 md:static md:pt-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col p-6 gap-8">
          <div className="flex flex-col gap-2">
            {sidebarLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl font-bold transition-all",
                  location.pathname === link.path 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <link.icon size={20} />
                {link.name}
              </Link>
            ))}
          </div>

          <button
            onClick={logout}
            className="mt-auto flex items-center gap-3 p-3 rounded-xl font-bold text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<DashboardOverview showConfirm={showConfirm} />} />
            <Route path="/leads" element={<LeadsManager showConfirm={showConfirm} />} />
            <Route path="/services" element={<ServicesManager showConfirm={showConfirm} />} />
            <Route path="/blog" element={<BlogManager showConfirm={showConfirm} />} />
            <Route path="/content" element={<PageContentManager showConfirm={showConfirm} />} />
            <Route path="/settings" element={<SettingsManager />} />
          </Routes>
        </div>
      </main>

      {/* Mobile Toggle */}
      <button
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 text-white rounded-full shadow-2xl md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl border border-slate-100 flex flex-col gap-6"
            >
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-bold text-slate-900">{confirmModal.title}</h3>
                <p className="text-slate-500 font-medium">{confirmModal.message}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                  }}
                  className="flex-1 px-6 py-4 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DashboardOverview({ showConfirm }: { showConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    const qLeads = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubLeads = onSnapshot(qLeads, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });

    const qServices = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'services');
    });

    return () => {
      unsubLeads();
      unsubServices();
    };
  }, []);

  const stats = [
    { label: 'Total Leads', value: leads.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'New Leads', value: leads.filter(l => l.status === 'new').length, icon: Shield, color: 'bg-green-100 text-green-600' },
    { label: 'Active Services', value: services.length, icon: Sparkles, color: 'bg-orange-100 text-orange-600' },
  ];

  const seedAllData = async () => {
    showConfirm(
      'Seed All Data',
      'This will initialize services, blog posts, and page content with sample data. Existing data will be preserved. Continue?',
      async () => {
        try {
          toast.info('Starting seed process...');
          
          // Seed Services (if empty)
          if (services.length === 0) {
            const initialServices = [
              {
                title: 'Air Duct Cleaning',
                shortDescription: 'Our comprehensive air duct cleaning removes dust, allergens, and microbial growth from your entire HVAC system.',
                fullDescription: 'Our comprehensive air duct cleaning removes dust, allergens, and microbial growth from your entire HVAC system. We use state-of-the-art HEPA-filtered vacuums and specialized agitation tools to ensure every inch of your ductwork is pristine.',
                benefits: ['Improved Air Quality', 'Energy Efficiency', 'Reduced Allergens', 'Extended HVAC Life'],
                price: 'From $299',
                iconName: 'Wind',
                image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=1200',
                color: 'bg-blue-50 text-blue-600',
                ctaText: 'Book Now',
                order: 0,
                createdAt: new Date()
              },
              {
                title: 'HVAC Restoration',
                shortDescription: 'We restore your HVAC system to factory-new condition, improving performance and extending its lifespan.',
                fullDescription: 'We restore your HVAC system to factory-new condition, improving performance and extending its lifespan. Our restoration process involves deep cleaning of coils, blowers, and internal components.',
                benefits: ['System Longevity', 'Peak Performance', 'Cost Savings', 'Corrosion Protection'],
                price: 'From $499',
                iconName: 'Shield',
                image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200',
                color: 'bg-green-50 text-green-600',
                ctaText: 'Book Now',
                order: 1,
                createdAt: new Date()
              }
            ];
            for (const s of initialServices) {
              await addDoc(collection(db, 'services'), s);
            }
          }

          // Seed Page Content
          const pages = ['homepage', 'about', 'contact'];
          for (const page of pages) {
            const docSnap = await getDocs(query(collection(db, 'page_content'), where('__name__', '==', page)));
            if (docSnap.empty) {
              // Basic seed for each page
              let content = {};
              if (page === 'homepage') {
                content = {
                  hero: { title: 'Breathe Cleaner Air with Apex Care Pro', description: 'Expert air duct cleaning and HVAC restoration.', badge: 'Certified Professionals', image: 'https://images.unsplash.com/photo-1581094288338-2314dddb79a8?auto=format&fit=crop&q=80' },
                  stats: [{ label: 'Happy Clients', value: '5k+' }, { label: 'Years Exp', value: '15+' }, { label: 'Rating', value: '4.9/5' }]
                };
              } else if (page === 'about') {
                content = { story: { title: 'Our Mission', description1: 'Dedicated to pure air.', image: 'https://picsum.photos/seed/about/800/600' } };
              } else if (page === 'contact') {
                content = { info: { title: 'Get in Touch', phone: '(800) 555-0199', email: 'info@apexductcleaning.com', address: '123 Air Way, Houston, TX' } };
              }
              await updateDoc(doc(db, 'page_content', page), content).catch(async () => {
                const { setDoc } = await import('firebase/firestore');
                await setDoc(doc(db, 'page_content', page), content);
              });
            }
          }

          toast.success('Initial data seeded successfully!');
        } catch (error: any) {
          console.error('Seed error:', error);
          toast.error(`Seed failed: ${error.message}`);
        }
      }
    );
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium">Welcome back, Admin. Here's what's happening today.</p>
        </div>
        <button
          onClick={seedAllData}
          className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
        >
          <Database size={20} /> Seed All Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex items-center gap-6">
            <div className={cn("p-4 rounded-2xl", stat.color)}>
              <stat.icon size={32} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-slate-500 font-bold uppercase tracking-widest">{stat.label}</span>
              <span className="text-4xl font-bold text-slate-900">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-slate-900">Recent Leads</h2>
          <Link to="/admin-ddk/dashboard/leads" className="text-blue-600 font-bold text-sm hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-sm uppercase tracking-widest border-b border-slate-100">
                <th className="pb-4 font-bold">Name</th>
                <th className="pb-4 font-bold">Service</th>
                <th className="pb-4 font-bold">Status</th>
                <th className="pb-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.slice(0, 5).map((lead) => (
                <tr key={lead.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 font-bold text-slate-900">{lead.name}</td>
                  <td className="py-4 text-slate-600">{lead.service}</td>
                  <td className="py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                      lead.status === 'new' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-4 text-slate-500 text-sm">
                    {formatDate(lead.createdAt, false) || 'Just now'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LeadsManager({ showConfirm }: { showConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'leads');
    });
    return unsub;
  }, []);

  const handleStatusUpdate = async (id: string, status: Lead['status']) => {
    try {
      await updateDoc(doc(db, 'leads', id), { status });
      toast.success('Lead status updated!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `leads/${id}`);
      toast.error('Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      'Delete Lead',
      'Are you sure you want to delete this lead? This action cannot be undone.',
      async () => {
        try {
          await deleteDoc(doc(db, 'leads', id));
          toast.success('Lead deleted!');
        } catch (error) {
          handleFirestoreError(error, OperationType.DELETE, `leads/${id}`);
          toast.error('Failed to delete lead.');
        }
      }
    );
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(filter.toLowerCase()) || 
    l.email.toLowerCase().includes(filter.toLowerCase()) ||
    l.service.toLowerCase().includes(filter.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Service', 'Message', 'Status', 'Date'];
    const csvData = leads.map(l => [
      l.name,
      l.email,
      l.phone,
      l.service,
      l.message.replace(/,/g, ';'), // Escape commas
      l.status,
      formatDate(l.createdAt) || ''
    ]);
    
    const csvContent = [headers, ...csvData].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `apex_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leads Management</h1>
          <p className="text-slate-500 font-medium">View and manage all contact form submissions.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={20} /> Export CSV
          </button>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search leads..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-sm uppercase tracking-widest border-b border-slate-100">
                <th className="p-6 font-bold">Name</th>
                <th className="p-6 font-bold">Contact</th>
                <th className="p-6 font-bold">Service</th>
                <th className="p-6 font-bold">Message</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{lead.name}</span>
                      <span className="text-xs text-slate-400">{formatDate(lead.createdAt)}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col text-sm">
                      <span className="text-slate-700 font-medium">{lead.email}</span>
                      <span className="text-slate-500">{lead.phone}</span>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest">
                      {lead.service}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex flex-col gap-2">
                      <p className="text-sm text-slate-600 max-w-xs line-clamp-2">{lead.message}</p>
                      {lead.message.length > 50 && (
                        <button 
                          onClick={() => setSelectedMessage(lead.message)}
                          className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:text-blue-700 flex items-center gap-1 w-fit"
                        >
                          <Eye size={12} /> Read More
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-6">
                    <select
                      value={lead.status}
                      onChange={(e) => handleStatusUpdate(lead.id, e.target.value as Lead['status'])}
                      className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest focus:outline-none",
                        lead.status === 'new' ? "bg-green-100 text-green-700" : 
                        lead.status === 'contacted' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                      )}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="p-6">
                    <button
                      onClick={() => handleDelete(lead.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedMessage && (
        <MessageModal message={selectedMessage} onClose={() => setSelectedMessage(null)} />
      )}
    </div>
  );
}

function MessageModal({ message, onClose }: { message: string, onClose: () => void }) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-lg rounded-[32px] p-8 shadow-2xl border border-slate-100 flex flex-col gap-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Full Message</h3>
            <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400">
              <X size={24} />
            </button>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-h-[60vh] overflow-y-auto">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg"
          >
            Close
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ServicesManager({ showConfirm }: { showConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState<Partial<Service>>({
    title: '',
    shortDescription: '',
    fullDescription: '',
    benefits: [],
    price: '',
    image: '',
    ctaText: 'Book Now',
    iconName: 'Wind',
    order: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'services'), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setServices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (editingService) {
      setFormData(editingService);
    } else {
      setFormData({
        title: '',
        shortDescription: '',
        fullDescription: '',
        benefits: [],
        price: '',
        image: '',
        ctaText: 'Book Now',
        iconName: 'Wind',
        order: services.length
      });
    }
  }, [editingService, isModalOpen]);

  const handleDelete = async (id: string) => {
    showConfirm(
      'Delete Service',
      'Are you sure you want to delete this service? This action cannot be undone.',
      async () => {
        try {
          await deleteDoc(doc(db, 'services', id));
          toast.success('Service deleted!');
        } catch (error: any) {
          console.error('Error deleting service:', error);
          toast.error(`Failed to delete service: ${error.message || 'Unknown error'}`);
        }
      }
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const { id, ...dataToSave } = formData;
      
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), dataToSave);
        toast.success('Service updated successfully!');
      } else {
        await addDoc(collection(db, 'services'), {
          ...dataToSave,
          createdAt: new Date()
        });
        toast.success('Service added successfully!');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving service:', error);
      toast.error(`Failed to save service: ${error.message || 'Unknown error'}`);
    }
  };

  const handleBenefitChange = (index: number, value: string) => {
    const newBenefits = [...(formData.benefits || [])];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const addBenefit = () => {
    setFormData({ ...formData, benefits: [...(formData.benefits || []), ''] });
  };

  const removeBenefit = (index: number) => {
    const newBenefits = (formData.benefits || []).filter((_, i) => i !== index);
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleSeedServices = async () => {
    const seed = async () => {
      const initialServices = [
        {
          title: 'Air Duct Cleaning',
          shortDescription: 'Our comprehensive air duct cleaning removes dust, allergens, and microbial growth from your entire HVAC system.',
          fullDescription: 'Our comprehensive air duct cleaning removes dust, allergens, and microbial growth from your entire HVAC system. We use state-of-the-art HEPA-filtered vacuums and specialized agitation tools to ensure every inch of your ductwork is pristine. This service is essential for maintaining high indoor air quality and ensuring your HVAC system operates at peak efficiency.',
          benefits: ['Improved Air Quality', 'Energy Efficiency', 'Reduced Allergens', 'Extended HVAC Life'],
          price: 'From $299',
          iconName: 'Wind',
          image: 'https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=1200',
          color: 'bg-blue-50 text-blue-600',
          ctaText: 'Book Now',
          order: 0
        },
        {
          title: 'HVAC Restoration',
          shortDescription: 'We restore your HVAC system to factory-new condition, improving performance and extending its lifespan.',
          fullDescription: 'We restore your HVAC system to factory-new condition, improving performance and extending its lifespan. Our restoration process involves deep cleaning of coils, blowers, and internal components, followed by the application of protective coatings to prevent future corrosion and microbial growth.',
          benefits: ['System Longevity', 'Peak Performance', 'Cost Savings', 'Corrosion Protection'],
          price: 'From $499',
          iconName: 'Shield',
          image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200',
          color: 'bg-green-50 text-green-600',
          ctaText: 'Book Now',
          order: 1
        },
        {
          title: 'Dryer Vent Cleaning',
          shortDescription: 'Prevent dryer fires and improve drying efficiency with our professional vent cleaning service.',
          fullDescription: 'Prevent dryer fires and improve drying efficiency with our professional vent cleaning service. Lint buildup in dryer vents is a leading cause of household fires. Our high-pressure cleaning removes all obstructions, allowing your dryer to breathe and reducing drying times significantly.',
          benefits: ['Fire Prevention', 'Faster Drying', 'Energy Savings', 'Dryer Longevity'],
          price: 'From $129',
          iconName: 'Sparkles',
          image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200',
          color: 'bg-orange-50 text-orange-600',
          ctaText: 'Book Now',
          order: 2
        },
        {
          title: 'Coil Cleaning & Maintenance',
          shortDescription: 'Professional cleaning of evaporator and condenser coils to maximize heat transfer and efficiency.',
          fullDescription: 'Dirty coils can increase energy consumption by up to 30%. Our professional coil cleaning service removes dirt, debris, and oxidation from both evaporator and condenser coils, ensuring maximum heat transfer and reducing the load on your compressor.',
          benefits: ['Lower Energy Bills', 'Better Cooling', 'Compressor Protection', 'System Reliability'],
          price: 'From $199',
          iconName: 'Droplets',
          image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=1200',
          color: 'bg-cyan-50 text-cyan-600',
          ctaText: 'Schedule Now',
          order: 3
        },
        {
          title: 'Damage Restoration',
          shortDescription: 'Expert cleaning and restoration of HVAC systems following fire, water, or mold damage.',
          fullDescription: 'When disaster strikes, your HVAC system can become a distribution point for contaminants. Our expert team specializes in the thorough cleaning and decontamination of systems affected by fire, water, or mold damage, restoring safety and air quality to your property.',
          benefits: ['Odor Removal', 'Contaminant Elimination', 'Safe Re-occupancy', 'Insurance Coordination'],
          price: 'Custom Quote',
          iconName: 'Activity',
          image: 'https://images.unsplash.com/photo-1584622781564-1d987f7333c1?auto=format&fit=crop&q=80&w=1200',
          color: 'bg-red-50 text-red-600',
          ctaText: 'Get Quote',
          order: 4
        }
      ];

      try {
        for (const service of initialServices) {
          await addDoc(collection(db, 'services'), {
            ...service,
            createdAt: new Date()
          });
        }
        toast.success('5 services seeded successfully!');
      } catch (error: any) {
        console.error('Error seeding services:', error);
        toast.error(`Failed to seed services: ${error.message || 'Unknown error'}`);
      }
    };

    if (services.length > 0) {
      showConfirm(
        'Seed Services',
        'Services already exist. Do you want to add the initial 5 services anyway?',
        seed
      );
    } else {
      seed();
    }
  };
  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Services Manager</h1>
          <p className="text-slate-500 font-medium">Add, edit, or remove services from the website.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSeedServices}
            className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            Seed Initial Data
          </button>
          <button
            onClick={() => {
              setEditingService(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <Plus size={20} /> Add Service
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm group">
            <div className="h-48 relative overflow-hidden">
              <img src={service.image} alt={service.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={() => {
                    setEditingService(service);
                    setIsModalOpen(true);
                  }}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-lg"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="p-2 bg-white/90 backdrop-blur-md rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                <span className="text-blue-600 font-bold">{service.price}</span>
              </div>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{service.shortDescription}</p>
              <div className="flex flex-wrap gap-2">
                {service.benefits?.slice(0, 3).map(b => (
                  <span key={b} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-slate-100">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-3xl rounded-[40px] p-8 md:p-12 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Service Title</label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Air Duct Cleaning"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Price Label</label>
                    <input
                      required
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. From $299"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Short Description</label>
                  <textarea
                    required
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="Brief summary for the grid view..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Description</label>
                  <textarea
                    required
                    value={formData.fullDescription}
                    onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="Detailed explanation for the service page..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image URL</label>
                    <input
                      required
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://unsplash.com/..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Icon Name</label>
                    <select
                      value={formData.iconName}
                      onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Wind">Wind</option>
                      <option value="Shield">Shield</option>
                      <option value="Sparkles">Sparkles</option>
                      <option value="Droplets">Droplets</option>
                      <option value="Flame">Flame</option>
                      <option value="Construction">Construction</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CTA Button Text</label>
                  <input
                    required
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Book Now"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Benefits / Advantages</label>
                    <button
                      type="button"
                      onClick={addBenefit}
                      className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} /> Add Benefit
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {formData.benefits?.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={benefit}
                          onChange={(e) => handleBenefitChange(index, e.target.value)}
                          className="flex-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Benefit..."
                        />
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    {editingService ? 'Update Service' : 'Create Service'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function BlogManager({ showConfirm }: { showConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    featured_image_url: '',
    publish_date: new Date().toISOString().split('T')[0],
    status: 'draft',
    category: 'Maintenance',
    excerpt: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'blog_posts'), orderBy('created_at', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost)));
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (editingPost) {
      setFormData({
        ...editingPost,
        publish_date: editingPost.publish_date instanceof Date 
          ? editingPost.publish_date.toISOString().split('T')[0]
          : editingPost.publish_date?.toDate 
            ? editingPost.publish_date.toDate().toISOString().split('T')[0]
            : String(editingPost.publish_date || '')
      });
    } else {
      setFormData({
        title: '',
        slug: '',
        content: '',
        featured_image_url: '',
        publish_date: new Date().toISOString().split('T')[0],
        status: 'draft',
        category: 'Maintenance',
        excerpt: ''
      });
    }
  }, [editingPost, isModalOpen]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title)
    });
  };

  const handleDelete = async (id: string) => {
    showConfirm(
      'Delete Blog Post',
      'Are you sure you want to delete this post? This action cannot be undone.',
      async () => {
        try {
          await deleteDoc(doc(db, 'blog_posts', id));
          toast.success('Post deleted!');
        } catch (error: any) {
          console.error('Error deleting post:', error);
          toast.error(`Failed to delete post: ${error.message || 'Unknown error'}`);
        }
      }
    );
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const { id, ...rest } = formData;
      const dataToSave = {
        ...rest,
        publish_date: formData.publish_date ? new Date(formData.publish_date) : new Date()
      };

      if (editingPost) {
        await updateDoc(doc(db, 'blog_posts', editingPost.id), dataToSave);
        toast.success('Post updated successfully!');
      } else {
        await addDoc(collection(db, 'blog_posts'), {
          ...dataToSave,
          created_at: Timestamp.now()
        });
        toast.success('Post created successfully!');
      }
      setIsModalOpen(false);
    } catch (error: any) {
      console.error('Error saving post:', error);
      toast.error(`Failed to save post: ${error.message || 'Unknown error'}`);
    }
  };

  const seedBlogPosts = async () => {
    const seedData = [
      {
        title: "Why Air Duct Cleaning is Essential for Your Health",
        slug: "why-air-duct-cleaning-is-essential-for-your-health",
        category: "Health",
        excerpt: "Hidden mold growth and allergens in HVAC systems can lead to serious respiratory issues. Learn why clean air starts with clean ducts.",
        featured_image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1200",
        publish_date: new Date("2026-04-01"),
        status: "published",
        content: `
          <h2>The Invisible Threat in Your Home</h2>
          <p>Mold thrives in dark, damp environments, making your HVAC system's air ducts the perfect breeding ground. When moisture from condensation meets the dust and organic matter that naturally accumulates in ducts, mold spores can begin to colonize rapidly.</p>
          
          <h3>Why It's Dangerous</h3>
          <p>As your HVAC system circulates air, it also circulates these microscopic mold spores. For families, this can lead to a range of health issues, including:</p>
          <ul>
            <li>Persistent coughing and wheezing</li>
            <li>Chronic sinus infections</li>
            <li>Unexplained fatigue</li>
            <li>Worsening of asthma symptoms</li>
          </ul>

          <h3>The Solution: Professional Sanitization</h3>
          <p>Standard vacuuming isn't enough to kill mold. At Apex Duct Cleaning, we use clinical-grade, EPA-approved antimicrobial treatments that eliminate mold at the source and prevent its return. Our process includes moisture source identification to ensure your home stays mold-free for the long term.</p>
        `
      },
      {
        title: "10 Signs Your Dryer Vent Needs Cleaning",
        slug: "10-signs-your-dryer-vent-needs-cleaning",
        category: "Safety",
        excerpt: "Lint buildup in dryer vents is a leading cause of residential fires. Learn the warning signs and why annual cleaning is non-negotiable.",
        featured_image_url: "https://images.unsplash.com/photo-1590001158193-798d316167d1?auto=format&fit=crop&q=80&w=1200",
        publish_date: new Date("2026-03-25"),
        status: "published",
        content: `
          <h2>A Fire Hazard in Every Laundry Room</h2>
          <p>According to the National Fire Protection Association, thousands of home fires are caused by clothes dryers every year. The primary culprit? A failure to clean the dryer vents. Lint is one of the most flammable substances in your home, and when it builds up in a restricted vent, the heat from the dryer can easily ignite it.</p>
          
          <h3>Warning Signs You Shouldn't Ignore</h3>
          <p>Your dryer will often tell you when the vent is dangerously clogged. Watch for these signs:</p>
          <ul>
            <li>Clothes take more than one cycle to dry</li>
            <li>The dryer feels unusually hot to the touch</li>
            <li>A musty smell during the drying cycle</li>
            <li>The outside vent flap doesn't open properly when the dryer is on</li>
            <li>Excessive lint behind the dryer</li>
            <li>No lint on the lint screen</li>
          </ul>

          <h3>Professional vs. DIY Cleaning</h3>
          <p>While cleaning the lint trap is a good start, it only catches about 25% of the lint. The rest travels into the vent line. Our professional equipment uses high-pressure compressed air and specialized brushes to clear the entire length of the vent, ensuring your home is safe and your dryer is efficient.</p>
        `
      },
      {
        title: "Why Your Energy Bills Are Skyrocketing (And It's Not the Rates)",
        slug: "why-your-energy-bills-are-skyrocketing",
        category: "Maintenance",
        excerpt: "Clogged ducts and leaky HVAC systems are the primary culprits behind high energy costs. Discover how deep cleaning can save you thousands.",
        featured_image_url: "https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=1200",
        publish_date: new Date("2026-03-28"),
        status: "published",
        content: `
          <h2>The Cost of Dirty Air</h2>
          <p>Have you noticed your energy bills creeping up month after month? While utility rates do fluctuate, the most common cause of rising costs is an inefficient HVAC system. When your air ducts are clogged with dust and debris, your system has to work twice as hard to maintain your desired temperature.</p>
          
          <h3>The 'Drag' Effect</h3>
          <p>Think of your HVAC system like a car. If the air filters are clogged and the exhaust is blocked, the engine burns more fuel to move the same distance. In your home, a buildup of just 1/16th of an inch of dust on your blower wheel can reduce efficiency by up to 20%.</p>

          <h3>Instant ROI with Duct Cleaning</h3>
          <p>Professional duct cleaning and system restoration provide an immediate return on investment. By removing the 'drag' on your system, you can expect:</p>
          <ul>
            <li>Up to 25% reduction in monthly energy costs</li>
            <li>Fewer mechanical breakdowns</li>
            <li>Extended lifespan of your HVAC equipment</li>
          </ul>
        `
      },
      {
        title: "Allergies That Won't Go Away? Check Your Vents",
        slug: "allergies-that-won-t-go-away-check-your-vents",
        category: "Health",
        excerpt: "Recirculating pet dander, pollen, and dust mites can make allergy season year-round. See how HEPA-filtered cleaning provides instant relief.",
        featured_image_url: "https://images.unsplash.com/photo-1558403194-611308249627?auto=format&fit=crop&q=80&w=1200",
        publish_date: new Date("2026-03-20"),
        status: "published",
        content: `
          <h2>When Your Home Makes You Sneeze</h2>
          <p>If you find yourself suffering from allergy symptoms even when you're indoors with the windows closed, your HVAC system might be the problem. Air ducts act as a reservoir for allergens like pollen, pet dander, and dust mites. Every time your heater or air conditioner kicks on, it blasts these particles back into your living space.</p>
          
          <h3>The Cycle of Recirculation</h3>
          <p>In a typical home, air is recirculated 5 to 7 times per day. This means that if your ducts are dirty, you are breathing in the same contaminants over and over again. High-quality air filters help, but they can't stop the buildup that already exists deep within your ductwork.</p>

          <h3>The HEPA Difference</h3>
          <p>At Apex Duct Cleaning, we use advanced HEPA-filtered vacuum systems that capture 99.97% of particles as small as 0.3 microns. This ensures that the allergens we remove from your ducts stay out of your home, providing immediate relief for allergy and asthma sufferers.</p>
        `
      },
      {
        title: "HVAC Restoration vs. Replacement: Saving Thousands",
        slug: "hvac-restoration-vs-replacement-saving-thousands",
        category: "Maintenance",
        excerpt: "Don't replace your entire system just because it's dirty. Professional restoration can return old units to factory-new performance levels.",
        featured_image_url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200",
        publish_date: new Date("2026-03-15"),
        status: "published",
        content: `
          <h2>The Myth of the 'Dead' HVAC System</h2>
          <p>Many homeowners are told they need a full HVAC replacement when their system begins to lose power or blow weak air. While replacement is sometimes necessary, many systems are simply suffering from extreme neglect. Before you spend $10,000+ on a new unit, consider the power of professional restoration.</p>
          
          <h3>What is HVAC Restoration?</h3>
          <p>Restoration goes far beyond simple cleaning. It involves a deep, clinical cleaning of every component in your system, including:</p>
          <ul>
            <li>Evaporator and condenser coils</li>
            <li>Blower motor and housing</li>
            <li>Drain pans and lines</li>
            <li>Internal insulation and cabinet</li>
          </ul>

          <h3>The Results Speak for Themselves</h3>
          <p>A restored system can operate at factory-new efficiency levels. By removing the insulating layer of grime from the coils and the drag from the blower motor, we can often restore 15-25% of a system's lost capacity, saving you from a premature and expensive replacement.</p>
        `
      }
    ];

    showConfirm(
      'Seed Blog Posts',
      'This will add 5 sample blog posts to your database. Continue?',
      async () => {
        try {
          for (const post of seedData) {
            await addDoc(collection(db, 'blog_posts'), {
              ...post,
              created_at: Timestamp.now()
            });
          }
          toast.success('5 blog posts seeded successfully!');
        } catch (error: any) {
          console.error('Error seeding blog posts:', error);
          toast.error(`Failed to seed blog posts: ${error.message || 'Unknown error'}`);
        }
      }
    );
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Blog Management</h1>
          <p className="text-slate-500 font-medium">Create and manage your website's blog content.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={seedBlogPosts}
            className="bg-slate-100 text-slate-600 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            <Database size={20} /> Seed Posts
          </button>
          <button
            onClick={() => {
              setEditingPost(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
          >
            <Plus size={20} /> Create Post
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 text-sm uppercase tracking-widest border-b border-slate-100">
                <th className="p-6 font-bold">Title</th>
                <th className="p-6 font-bold">Slug</th>
                <th className="p-6 font-bold">Date</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {posts.map((post) => (
                <tr key={post.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <img src={post.featured_image_url} alt="" className="w-12 h-12 rounded-lg object-cover" referrerPolicy="no-referrer" />
                      <span className="font-bold text-slate-900">{post.title}</span>
                    </div>
                  </td>
                  <td className="p-6 text-slate-500 text-sm">{post.slug}</td>
                  <td className="p-6 text-slate-500 text-sm">
                    {formatDate(post.publish_date, false)}
                  </td>
                  <td className="p-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                      post.status === 'published' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
                    )}>
                      {post.status}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPost(post);
                          setIsModalOpen(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[40px] p-8 md:p-12 shadow-2xl relative my-8"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={24} />
              </button>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Post Title</label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. Why Air Duct Cleaning is Essential..."
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Slug (URL)</label>
                    <input
                      required
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g. why-air-duct-cleaning-is-essential"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Health">Health</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Safety">Safety</option>
                      <option value="Tips">Tips</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Publish Date</label>
                    <input
                      required
                      type="date"
                      value={formData.publish_date}
                      onChange={(e) => setFormData({ ...formData, publish_date: e.target.value })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Featured Image URL</label>
                  <input
                    required
                    type="url"
                    value={formData.featured_image_url}
                    onChange={(e) => setFormData({ ...formData, featured_image_url: e.target.value })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Excerpt</label>
                  <textarea
                    required
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    placeholder="Brief summary for the blog list..."
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Content (Markdown/HTML)</label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={10}
                    placeholder="Write your post content here..."
                  />
                </div>

                <div className="flex justify-end gap-4 mt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                  >
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PageContentManager({ showConfirm }: { showConfirm: (title: string, message: string, onConfirm: () => void) => void }) {
  const [activeTab, setActiveTab] = useState<'homepage' | 'about' | 'contact'>('homepage');
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const unsub = onSnapshot(doc(db, 'page_content', activeTab), (docSnap) => {
      if (docSnap.exists()) {
        setContent(docSnap.data());
      } else {
        setContent(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching page content:", error);
      setLoading(false);
    });
    return unsub;
  }, [activeTab]);

  const handleSave = async (section: string, data: any) => {
    try {
      await updateDoc(doc(db, 'page_content', activeTab), {
        [section]: data
      });
      toast.success(`${section} updated successfully!`);
    } catch (error: any) {
      console.error('Error updating content:', error);
      toast.error(`Failed to update ${section}: ${error.message}`);
    }
  };

  const handleSeedContent = async () => {
    let initialContent = {};
    
    if (activeTab === 'homepage') {
      initialContent = {
        hero: {
          badge: 'Certified HVAC Professionals',
          title: 'Breathe Cleaner Air with Apex Care Pro',
          description: 'Professional air duct cleaning and HVAC restoration services for homes and businesses. We improve your health and save you money.',
          image: 'https://q3zyn4woatazi.ok.kimi.link/images/hero-technician.jpg'
        },
        whyChooseUs: [
          { title: 'Before & After Photo Proof', description: 'We document our work with high-resolution photos so you can see the results for yourself.', iconName: 'Camera' },
          { title: '127-Point Cleaning Checklist', description: 'Our rigorous inspection and cleaning protocol ensures no detail is overlooked.', iconName: 'ClipboardCheck' },
          { title: 'Certified & Insured Technicians', description: 'Our team is NADCA certified and fully insured for your complete peace of mind.', iconName: 'Award' },
          { title: 'Upfront Honest Pricing', description: 'No hidden fees or surprise upcharges. We provide clear, detailed quotes before any work begins.', iconName: 'BadgeDollarSign' },
        ],
        testimonials: [
          { name: 'Sarah Johnson', role: 'Homeowner', text: 'Apex Duct Cleaning did an amazing job cleaning our ducts. The air feels so much fresher now!', rating: 5 },
          { name: 'Michael Chen', role: 'Property Manager', text: 'Professional, punctual, and thorough. We use them for all our commercial properties.', rating: 5 },
          { name: 'Emily Davis', role: 'Homeowner', text: 'The team was very respectful of our home and the results were immediate. Highly recommend!', rating: 5 },
        ],
        stats: [
          { label: 'Years Experience', value: '15+' },
          { label: 'Happy Clients', value: '5k+' },
          { label: 'Average Rating', value: '4.9/5' },
        ],
        cta: {
          title: 'Ready for a Healthier Home Environment?',
          description: 'Contact us today for a free inspection and quote. Our experts are ready to help you breathe easier.',
          phone: '(800) 555-0199'
        }
      };
    } else if (activeTab === 'about') {
      initialContent = {
        story: {
          badge: 'Our Story',
          title: 'Dedicated to Pure Air and Healthy Homes',
          description1: 'Founded in 2009, Apex Duct Cleaning started with a simple mission: to provide the highest quality air duct cleaning services using the most advanced technology available.',
          description2: 'Over the years, we\'ve expanded our expertise to include full HVAC restoration, dryer vent cleaning, and specialized disaster recovery. Our team of NADCA-certified technicians is committed to excellence in every job, large or small.',
          image: 'https://picsum.photos/seed/about/800/1000'
        },
        stats: [
          { label: 'Years Experience', value: '15+', iconName: 'Award' },
          { label: 'Happy Clients', value: '5k+', iconName: 'Users' },
          { label: 'Service Areas', value: '20+', iconName: 'Wind' },
          { label: 'Expert Staff', value: '50+', iconName: 'Shield' },
        ],
        mission: {
          title: 'Our Mission',
          description: 'To provide our clients with the cleanest indoor air possible through professional, thorough, and transparent HVAC restoration services. We strive to improve health, safety, and energy efficiency in every building we enter.'
        },
        vision: {
          title: 'Our Vision',
          description: 'To be the most trusted name in indoor environmental restoration, setting the industry standard for quality and customer service. We envision a world where every home and workplace has pure, healthy air to breathe.'
        },
        team: [
          {
            name: "Michael Rodriguez",
            role: "Lead HVAC Technician",
            bio: "10+ years of experience in duct cleaning and fire damage restoration.",
            image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400&h=400"
          },
          {
            name: "Sarah Chen",
            role: "Certified Air Quality Specialist",
            bio: "Specializes in mold remediation and indoor allergen control solutions.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400&h=400"
          },
          {
            name: "David Kim",
            role: "Restoration Expert",
            bio: "Expert in large-scale HVAC restoration and system efficiency optimization.",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400&h=400"
          },
          {
            name: "Jessica Martinez",
            role: "Customer Care Manager",
            bio: "Ensuring every client receives top-tier service and professional care.",
            image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400&h=400"
          }
        ]
      };
    } else if (activeTab === 'contact') {
      initialContent = {
        info: {
          title: 'Get in Touch',
          description: 'Have questions about our services or need to schedule an inspection? Our team is here to help you breathe easier.',
          address: '123 Air Quality Way, Suite 100, Houston, TX 77001',
          phone: '(800) 555-0199',
          email: 'info@apexductcleaning.com',
          hours: 'Mon-Fri: 8am - 6pm, Sat: 9am - 2pm'
        }
      };
    }

    try {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'page_content', activeTab), initialContent);
      toast.success(`${activeTab} content seeded successfully!`);
    } catch (error: any) {
      console.error('Error seeding content:', error);
      toast.error(`Failed to seed content: ${error.message}`);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Page Content Manager</h1>
          <p className="text-slate-500 font-medium">Manage dynamic content for all pages.</p>
        </div>
        <button
          onClick={handleSeedContent}
          className="bg-slate-100 text-slate-700 px-6 py-3 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
        >
          Seed {activeTab} Content
        </button>
      </div>

      <div className="flex gap-4 border-b border-slate-100 pb-4">
        {(['homepage', 'about', 'contact'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-xl font-bold transition-all capitalize",
              activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {activeTab === 'homepage' && content && (
          <>
            {/* Hero Section */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
              <h3 className="text-xl font-bold text-slate-900">Hero Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Badge Text</label>
                  <input 
                    type="text" 
                    value={content?.hero?.badge || ''} 
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, badge: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hero Title</label>
                  <input 
                    type="text" 
                    value={content?.hero?.title || ''} 
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hero Description</label>
                  <textarea 
                    value={content?.hero?.description || ''} 
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, description: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                    rows={3} 
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Hero Image URL</label>
                  <input 
                    type="text" 
                    value={content?.hero?.image || ''} 
                    onChange={(e) => setContent({ ...content, hero: { ...content.hero, image: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSave('hero', content.hero)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
              >
                Save Hero Section
              </button>
            </div>

            {/* Stats Section */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
              <h3 className="text-xl font-bold text-slate-900">Stats Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {content?.stats?.map((stat: any, i: number) => (
                  <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Value</label>
                      <input 
                        type="text" 
                        value={stat.value} 
                        onChange={(e) => {
                          const newStats = [...content.stats];
                          newStats[i].value = e.target.value;
                          setContent({ ...content, stats: newStats });
                        }}
                        className="p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Label</label>
                      <input 
                        type="text" 
                        value={stat.label} 
                        onChange={(e) => {
                          const newStats = [...content.stats];
                          newStats[i].label = e.target.value;
                          setContent({ ...content, stats: newStats });
                        }}
                        className="p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => handleSave('stats', content.stats)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
              >
                Save Stats Section
              </button>
            </div>

            {/* CTA Section */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
              <h3 className="text-xl font-bold text-slate-900">CTA Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CTA Title</label>
                  <input 
                    type="text" 
                    value={content?.cta?.title || ''} 
                    onChange={(e) => setContent({ ...content, cta: { ...content.cta, title: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CTA Description</label>
                  <textarea 
                    value={content?.cta?.description || ''} 
                    onChange={(e) => setContent({ ...content, cta: { ...content.cta, description: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                    rows={3} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">CTA Phone</label>
                  <input 
                    type="text" 
                    value={content?.cta?.phone || ''} 
                    onChange={(e) => setContent({ ...content, cta: { ...content.cta, phone: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSave('cta', content.cta)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
              >
                Save CTA Section
              </button>
            </div>
          </>
        )}

        {activeTab === 'about' && content && (
          <>
            {/* Story Section */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
              <h3 className="text-xl font-bold text-slate-900">Story Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Badge</label>
                  <input 
                    type="text" 
                    value={content?.story?.badge || ''} 
                    onChange={(e) => setContent({ ...content, story: { ...content.story, badge: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
                  <input 
                    type="text" 
                    value={content?.story?.title || ''} 
                    onChange={(e) => setContent({ ...content, story: { ...content.story, title: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description 1</label>
                  <textarea 
                    value={content?.story?.description1 || ''} 
                    onChange={(e) => setContent({ ...content, story: { ...content.story, description1: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                    rows={3} 
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description 2</label>
                  <textarea 
                    value={content?.story?.description2 || ''} 
                    onChange={(e) => setContent({ ...content, story: { ...content.story, description2: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                    rows={3} 
                  />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image URL</label>
                  <input 
                    type="text" 
                    value={content?.story?.image || ''} 
                    onChange={(e) => setContent({ ...content, story: { ...content.story, image: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSave('story', content.story)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
              >
                Save Story Section
              </button>
            </div>

            {/* Team Section */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
              <h3 className="text-xl font-bold text-slate-900">Team Section</h3>
              <div className="flex flex-col gap-6">
                {content?.team?.map((member: any, index: number) => (
                  <div key={index} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Name</label>
                        <input 
                          type="text" 
                          value={member.name} 
                          onChange={(e) => {
                            const newTeam = [...content.team];
                            newTeam[index].name = e.target.value;
                            setContent({ ...content, team: newTeam });
                          }}
                          className="p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Role</label>
                        <input 
                          type="text" 
                          value={member.role} 
                          onChange={(e) => {
                            const newTeam = [...content.team];
                            newTeam[index].role = e.target.value;
                            setContent({ ...content, team: newTeam });
                          }}
                          className="p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio</label>
                        <input 
                          type="text" 
                          value={member.bio} 
                          onChange={(e) => {
                            const newTeam = [...content.team];
                            newTeam[index].bio = e.target.value;
                            setContent({ ...content, team: newTeam });
                          }}
                          className="p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Image URL</label>
                        <input 
                          type="text" 
                          value={member.image} 
                          onChange={(e) => {
                            const newTeam = [...content.team];
                            newTeam[index].image = e.target.value;
                            setContent({ ...content, team: newTeam });
                          }}
                          className="p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => handleSave('team', content.team)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
              >
                Save Team Section
              </button>
            </div>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
                <h3 className="text-xl font-bold text-slate-900">Mission Section</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
                    <input 
                      type="text" 
                      value={content?.mission?.title || ''} 
                      onChange={(e) => setContent({ ...content, mission: { ...content.mission, title: e.target.value } })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea 
                      value={content?.mission?.description || ''} 
                      onChange={(e) => setContent({ ...content, mission: { ...content.mission, description: e.target.value } })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                      rows={4} 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleSave('mission', content.mission)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
                >
                  Save Mission
                </button>
              </div>

              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
                <h3 className="text-xl font-bold text-slate-900">Vision Section</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
                    <input 
                      type="text" 
                      value={content?.vision?.title || ''} 
                      onChange={(e) => setContent({ ...content, vision: { ...content.vision, title: e.target.value } })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                    <textarea 
                      value={content?.vision?.description || ''} 
                      onChange={(e) => setContent({ ...content, vision: { ...content.vision, description: e.target.value } })}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                      rows={4} 
                    />
                  </div>
                </div>
                <button 
                  onClick={() => handleSave('vision', content.vision)}
                  className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
                >
                  Save Vision
                </button>
              </div>
            </div>
          </>
        )}

        {activeTab === 'contact' && content && (
          <>
            {/* Contact Info */}
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
              <h3 className="text-xl font-bold text-slate-900">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Title</label>
                  <input 
                    type="text" 
                    value={content?.info?.title || ''} 
                    onChange={(e) => setContent({ ...content, info: { ...content.info, title: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                  <input 
                    type="text" 
                    value={content?.info?.description || ''} 
                    onChange={(e) => setContent({ ...content, info: { ...content.info, description: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Address</label>
                  <input 
                    type="text" 
                    value={content?.info?.address || ''} 
                    onChange={(e) => setContent({ ...content, info: { ...content.info, address: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Phone</label>
                  <input 
                    type="text" 
                    value={content?.info?.phone || ''} 
                    onChange={(e) => setContent({ ...content, info: { ...content.info, phone: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                  <input 
                    type="text" 
                    value={content?.info?.email || ''} 
                    onChange={(e) => setContent({ ...content, info: { ...content.info, email: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Business Hours</label>
                  <input 
                    type="text" 
                    value={content?.info?.hours || ''} 
                    onChange={(e) => setContent({ ...content, info: { ...content.info, hours: e.target.value } })}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  />
                </div>
              </div>
              <button 
                onClick={() => handleSave('info', content.info)}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
              >
                Save Contact Info
              </button>
            </div>
          </>
        )}

        {!content && (
          <div className="text-center py-20 bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
            <p className="text-slate-500 font-medium">No content found for this page. Click "Seed Content" to initialize.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SettingsManager() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      } else {
        setSettings({
          contact: {
            phone: '(800) 555-0199',
            email: 'info@apexductcleaning.com',
            address: '123 Clean Air Way, Suite 100, Houston, TX 77001'
          },
          social: {
            facebook: '',
            instagram: '',
            linkedin: '',
            twitter: ''
          },
          payment: {
            googleWalletMerchantId: '',
            enableGoogleWallet: false,
            currency: 'USD'
          }
        });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleSave = async (section: string, data: any) => {
    try {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'settings', 'global'), {
        ...settings,
        [section]: data
      });
      toast.success(`${section} settings updated successfully!`);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error(`Failed to update ${section} settings: ${error.message}`);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Settings</h1>
        <p className="text-slate-500 font-medium">Manage global website configuration and content.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
          <h3 className="text-xl font-bold text-slate-900">Contact Information</h3>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Phone Number</label>
              <input 
                type="text" 
                value={settings?.contact?.phone || ''} 
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                value={settings?.contact?.email || ''} 
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Physical Address</label>
              <textarea 
                value={settings?.contact?.address || ''} 
                onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, address: e.target.value } })}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                rows={3} 
              />
            </div>
          </div>
          <button 
            onClick={() => handleSave('contact', settings.contact)}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
          >
            Save Contact Info
          </button>
        </div>

        {/* Social Links */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
          <h3 className="text-xl font-bold text-slate-900">Social Links</h3>
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Facebook URL</label>
              <input 
                type="text" 
                placeholder="https://facebook.com/..." 
                value={settings?.social?.facebook || ''} 
                onChange={(e) => setSettings({ ...settings, social: { ...settings.social, facebook: e.target.value } })}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Instagram URL</label>
              <input 
                type="text" 
                placeholder="https://instagram.com/..." 
                value={settings?.social?.instagram || ''} 
                onChange={(e) => setSettings({ ...settings, social: { ...settings.social, instagram: e.target.value } })}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">LinkedIn URL</label>
              <input 
                type="text" 
                placeholder="https://linkedin.com/..." 
                value={settings?.social?.linkedin || ''} 
                onChange={(e) => setSettings({ ...settings, social: { ...settings.social, linkedin: e.target.value } })}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
          </div>
          <button 
            onClick={() => handleSave('social', settings.social)}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
          >
            Save Social Links
          </button>
        </div>

        {/* Payment Settings (Google Wallet) */}
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col gap-8">
          <h3 className="text-xl font-bold text-slate-900">Payment Settings (Google Wallet)</h3>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-slate-900">Enable Google Wallet</span>
                <span className="text-xs text-slate-500">Allow customers to pay via Google Wallet</span>
              </div>
              <button 
                onClick={() => setSettings({ ...settings, payment: { ...settings.payment, enableGoogleWallet: !settings.payment.enableGoogleWallet } })}
                className={cn(
                  "w-14 h-8 rounded-full transition-all relative",
                  settings?.payment?.enableGoogleWallet ? "bg-blue-600" : "bg-slate-300"
                )}
              >
                <div className={cn(
                  "absolute top-1 w-6 h-6 bg-white rounded-full transition-all",
                  settings?.payment?.enableGoogleWallet ? "left-7" : "left-1"
                )} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Google Wallet Merchant ID</label>
              <input 
                type="text" 
                placeholder="Enter your Merchant ID" 
                value={settings?.payment?.googleWalletMerchantId || ''} 
                onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, googleWalletMerchantId: e.target.value } })}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-widest">Currency</label>
              <select 
                value={settings?.payment?.currency || 'USD'} 
                onChange={(e) => setSettings({ ...settings, payment: { ...settings.payment, currency: e.target.value } })}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>
          </div>
          <button 
            onClick={() => handleSave('payment', settings.payment)}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all w-fit"
          >
            Save Payment Settings
          </button>
        </div>
      </div>
    </div>
  );
}

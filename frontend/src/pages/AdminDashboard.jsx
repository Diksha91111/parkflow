import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { Sun, Moon, ShieldCheck, Crown } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';
import AdminTabs from '../components/admin/AdminTabs';
import OverviewTab from '../components/admin/OverviewTab';
import BookingsTab from '../components/admin/BookingsTab';
import ParkingSpotsTab from '../components/admin/ParkingSpotsTab';
import AnalyticsTab from '../components/admin/AnalyticsTab';
import FeedbackTab from '../components/admin/FeedbackTab';

const translations = {
  en: {
    adminConsole: "Admin Console",
    adminMode: "Admin Mode",
    welcomeMessage: "Welcome back, {name}. Manage parking, bookings, and analytics."
  },
  hi: {
    adminConsole: "एडमिन कंसोल",
    adminMode: "एडमिन मोड",
    welcomeMessage: "वापसी पर स्वागत है, {name}। पार्किंग, बुकिंग और एनालिटिक्स प्रबंधित करें।"
  }
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const [activeTab, setActiveTab] = useState('overview');
  const [adminMetrics, setAdminMetrics] = useState(null);
  const [adminBookings, setAdminBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const t = translations[lang];

  // Capitalize first letter helper
  const capitalizeName = (name) => {
    if (!name) return 'Admin';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Theme Sync
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  // Fetch Admin Data
  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, bookingsRes] = await Promise.all([
        api.get('/api/admin/metrics'),
        api.get('/api/admin/bookings'),
      ]);
      setAdminMetrics(metricsRes.data.data);
      setAdminBookings(bookingsRes.data.data);
    } catch (error) {
      console.error('Admin data fetch error:', error);
      if (error.response?.status === 401) {
        toast.error('Admin access denied.');
      } else {
        toast.error('Failed to load admin data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  if (loading) {
    return (
      <div className="flex h-screen bg-transparent font-sans overflow-hidden window-border-highlight">
        <Sidebar t={t} />
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto custom-scrollbar p-6">
          <div className="flex-1 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-transparent font-sans overflow-hidden window-border-highlight">
      {/* Sidebar */}
      <Sidebar t={t} />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-y-auto custom-scrollbar p-6">
        {/* Header */}
        <header className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight animate-fade-in-up heading-modern">
                {t.adminConsole}
              </h2>
              {/* Admin Mode Badge */}
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                <Crown className="w-3 h-3" />
                {t.adminMode}
              </span>
            </div>
            <p className="text-slate-500 font-medium text-sm mt-1">
              {t.welcomeMessage.replace('{name}', capitalizeName(user?.name))}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-600 dark:text-slate-300"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </header>

        {/* Admin Console Content */}
        <div className="w-full max-w-full xl:max-w-[1600px] mx-auto bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-700/50 section-highlight animate-slide-right flex-1 flex flex-col overflow-hidden">
          <AdminTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="mt-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
            {activeTab === 'overview' && <OverviewTab metrics={adminMetrics} />}
            {activeTab === 'bookings' && (
              <BookingsTab bookings={adminBookings} onBookingsChange={setAdminBookings} />
            )}
            {activeTab === 'spots' && <ParkingSpotsTab />}
            {activeTab === 'analytics' && <AnalyticsTab />}
            {activeTab === 'feedback' && <FeedbackTab />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

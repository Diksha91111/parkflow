import React, { useState, useEffect } from 'react';
import { LayoutDashboard, LogOut, Car, User, Navigation, MessageCircle, ShieldCheck, MapPin } from 'lucide-react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AddressModal from './AddressModal';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

const Sidebar = ({ t = {} }) => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressData, setAddressData] = useState(() => {
    const saved = localStorage.getItem('user_address');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('user_address');
      setAddressData(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddressConfirm = (data) => {
    // 1. Save the active header address (for display in Sidebar/Dashboard header)
    localStorage.setItem('user_address', JSON.stringify(data));
    setAddressData(data);

    // 2. Save to the persistent "Saved Addresses" list for the Profile page
    // Use user-specific key to separate addresses per user
    if (data.mode === 'manual') {
      const userId = user?._id || user?.id || 'guest';
      const userAddressesKey = `userAddresses_${userId}`;
      const existingSaved = JSON.parse(localStorage.getItem(userAddressesKey) || '[]');
      
      // Check if this address already exists to avoid duplicates
      const isDuplicate = existingSaved.some(addr => 
        addr.flatNo === data.flatNo && 
        addr.street === data.street && 
        addr.city === data.city
      );

      if (!isDuplicate) {
        const updatedSaved = [data, ...existingSaved].slice(0, 10); // Keep last 10
        localStorage.setItem(userAddressesKey, JSON.stringify(updatedSaved));
      }
    }

    toast.success("Location updated successfully");
    // Dispatch a storage event to notify other components in the same tab
    window.dispatchEvent(new Event('storage'));
  };
  
  const navItems = [
    { label: t?.dashboard || 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  ];

  // Only show Booking History for non-admin users
  if (user?.role !== 'admin') {
    navItems.push({ label: t?.bookingHistory || 'Booking History', path: '/booking-history', icon: Navigation });
  }

  // Only show Admin Console if the user is an admin
  if (user?.role === 'admin') {
    navItems.push({ label: t?.adminConsole || 'Admin Console', path: '/admin-dashboard', icon: ShieldCheck });
  }

  return (
    <div className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl z-20 sticky top-0 left-0">
      {/* Logo Block */}
      <div className="flex flex-col px-6 py-8 border-b border-slate-700/50 mb-4 shrink-0">
        <div className="flex items-center mb-4">
          <button 
            onClick={() => setIsAddressModalOpen(true)}
            className="bg-brand-500 p-2.5 rounded-2xl text-white shadow-lg shadow-brand-500/20 mr-3 logo-3d hover:scale-110 transition-transform cursor-pointer"
          >
            <Car className="w-7 h-7" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
              Park<span className="text-brand-400">Smart</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 mt-1 font-black">
              Finder Suite
            </p>
          </div>
        </div>
        
        {/* User Name Display */}
        <button 
          onClick={() => setIsAddressModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-700 hover:border-brand-400 transition-colors w-full group"
        >
          <MapPin className="w-3.5 h-3.5 text-brand-400 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-bold text-white truncate">
            {user?.name || 'Select Address'}
          </span>
        </button>
        
        {/* User Location/Address Display */}
        {user?.address && (
          <div className="flex items-center gap-2 px-4 py-1.5 mt-2 rounded-lg bg-slate-800/50 border border-slate-700/50 w-full">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="text-[10px] text-slate-400 truncate">
              {user.address}
            </span>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 space-y-2 font-medium">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 ${
                isActive && item.path !== '#'
                  ? 'bg-brand-600/10 text-brand-400 font-semibold shadow-inner border border-brand-500/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3 shrink-0" />
            {item.label}
          </NavLink>
        ))}
        <Link
          to="/ai-assistant"
          className="flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 hover:bg-slate-800 hover:text-white"
        >
          <MessageCircle className="w-5 h-5 mr-3 shrink-0" />
          {t?.chatbot || 'Chatbot'}
        </Link>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5 mr-3" />
          {t?.logout || 'Logout'}
        </button>
      </div>

      <AnimatePresence>
        {isAddressModalOpen && (
          <AddressModal
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            t={t}
            onConfirm={handleAddressConfirm}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;

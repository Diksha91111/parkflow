import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Navigation, MapPin, User, Phone, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';

const AddressModal = ({ isOpen, onClose, t, onConfirm }) => {
  const [mode, setManualMode] = useState('select'); // 'select', 'current', 'manual'
  const [formData, setFormData] = useState({ name: '', phone: '', flatNo: '', street: '', city: '', state: '' });
  const [isDetecting, setIsDetecting] = useState(false);

  if (!isOpen) return null;

  const handleGetCurrentLocation = () => {
    setIsDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setIsDetecting(false);
          onConfirm({ mode: 'current', lat: latitude, lng: longitude });
          onClose();
        },
        () => {
          toast.error(t.locationAccess || "Please allow location access");
          setIsDetecting(false);
        }
      );
    } else {
      toast.error("Geolocation not supported");
      setIsDetecting(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.flatNo || !formData.street || !formData.city || !formData.state) {
      toast.error(t.enterDetails || "Please enter all details");
      return;
    }
    const fullAddress = `${formData.flatNo}, ${formData.street}, ${formData.city}, ${formData.state}`;
    onConfirm({ mode: 'manual', ...formData, address: fullAddress });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-[#1e293b] rounded-[32px] shadow-2xl overflow-hidden p-8 border border-slate-700">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-200 transition-colors"><X className="w-6 h-6" /></button>
        <h2 className="text-2xl font-black text-white mb-6 text-center">{t.selectAddress || "Select Address"}</h2>

        {mode === 'select' && (
          <div className="space-y-4">
            <button onClick={() => handleGetCurrentLocation()} disabled={isDetecting} className="w-full flex items-center justify-between p-5 bg-brand-500/10 rounded-2xl border-2 border-brand-500/20 hover:border-brand-500 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-brand-500 text-white rounded-xl"><Navigation className={`w-6 h-6 ${isDetecting ? 'animate-spin' : ''}`} /></div>
                <div className="text-left">
                  <span className="block font-bold text-white">{isDetecting ? (t.detecting || "Detecting...") : (t.currentLocation || "Use Current Location")}</span>
                  <span className="text-xs text-slate-400">Fast & accurate detection</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-brand-500 group-hover:translate-x-1 transition-transform" />
            </button>

            <button onClick={() => setManualMode('manual')} className="w-full flex items-center justify-between p-5 bg-slate-800/50 rounded-2xl border-2 border-slate-700 hover:border-brand-500 transition-all group">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-700 text-slate-300 rounded-xl"><MapPin className="w-6 h-6" /></div>
                <div className="text-left">
                  <span className="block font-bold text-white">{t.manualAddress || "Enter Address Manually"}</span>
                  <span className="text-xs text-slate-400">Type details yourself</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleManualSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.fullName || "Full Name"}</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="John Doe" className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none text-white text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.phoneNumber || "Phone Number"}</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-500 transition-colors" />
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+91 98765 43210" className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none text-white text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.flatNo || "Flat No"}</label>
                <input type="text" required value={formData.flatNo} onChange={e => setFormData({...formData, flatNo: e.target.value})} placeholder="A-101" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none text-white text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.street || "Street"}</label>
                <input type="text" required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} placeholder="Main Road" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none text-white text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.cityLabel || "City"}</label>
                <input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} placeholder="Pune" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none text-white text-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{t.stateLabel || "State"}</label>
                <input type="text" required value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} placeholder="Maharashtra" className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none text-white text-sm" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setManualMode('select')} className="flex-1 py-4 bg-slate-700 text-slate-300 font-bold rounded-2xl hover:bg-slate-600 transition-all">Back</button>
              <button type="submit" className="flex-[2] py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 transition-all active:scale-95">{t.confirmSave || "Confirm & Save"}</button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default AddressModal;

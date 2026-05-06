import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LocateFixed, Car } from 'lucide-react';

const CarLoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-white/95 dark:bg-slate-900/95 z-[60] flex flex-col items-center justify-center backdrop-blur-sm rounded-3xl"
  >
    <div className="relative w-64 h-24 overflow-hidden border-b-4 border-dashed border-slate-200 dark:border-slate-700">
      <motion.div
        animate={{ 
          x: [-80, 260],
        }}
        transition={{ 
          duration: 1.8, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="absolute bottom-1"
      >
        <div className="bg-brand-500 p-2.5 rounded-xl shadow-xl shadow-brand-500/20 logo-3d">
          <Car className="w-10 h-10 text-white" />
        </div>
        {/* Wheels animation effect */}
        <div className="flex justify-between px-1 -mt-1">
          <div className="w-2 h-2 bg-slate-800 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-slate-800 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        </div>
      </motion.div>
    </div>
    <div className="mt-8 text-center">
      <motion.p 
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="font-black text-brand-600 dark:text-brand-400 tracking-[0.2em] text-sm uppercase"
      >
        Processing Spot
      </motion.p>
      <div className="flex justify-center gap-1 mt-2">
        <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse"></div>
        <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  </motion.div>
);

const SpotFormModal = ({ isOpen, onClose, onSave, spot }) => {
  const isEdit = !!spot;
  const [formData, setFormData] = useState({
    name: spot?.name || '',
    address: spot?.address || '',
    lat: spot?.lat || '',
    lng: spot?.lng || '',
    totalSlots: spot?.totalSlots || '',
    pricePerHour: spot?.pricePerHour || '',
    type: spot?.type || 'Open',
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(spot?.imageUrl || '');

  useEffect(() => {
    if (!isEdit && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (formData.lat === '' && formData.lng === '') {
            setFormData(prev => ({
              ...prev,
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }));
          }
        },
        () => {}
      );
    }
  }, [isEdit, formData.lat, formData.lng]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    let payload;
    
    if (imageFile) {
      payload = new FormData();
      payload.append('name', formData.name);
      payload.append('address', formData.address);
      payload.append('lat', formData.lat ? parseFloat(formData.lat) : 18.5204);
      payload.append('lng', formData.lng ? parseFloat(formData.lng) : 73.8567);
      payload.append('totalSlots', parseInt(formData.totalSlots, 10));
      payload.append('pricePerHour', parseFloat(formData.pricePerHour));
      payload.append('type', formData.type);
      payload.append('image', imageFile);
    } else {
      payload = {
        ...formData,
        lat: formData.lat ? parseFloat(formData.lat) : 18.5204,
        lng: formData.lng ? parseFloat(formData.lng) : 73.8567,
        totalSlots: parseInt(formData.totalSlots, 10),
        pricePerHour: parseFloat(formData.pricePerHour),
      };
    }

    await onSave(payload);
    setSaving(false);
  };

  if (!isOpen) return null;

  const fields = [
    { name: 'name', label: 'Spot Name', type: 'text', placeholder: 'e.g. Downtown Garage' },
    { name: 'address', label: 'Address', type: 'text', placeholder: 'Full street address' },
    { name: 'lat', label: 'Latitude', type: 'number', placeholder: 'e.g. 18.5204', step: 'any' },
    { name: 'lng', label: 'Longitude', type: 'number', placeholder: 'e.g. 73.8567', step: 'any' },
    { name: 'totalSlots', label: 'Total Slots', type: 'number', placeholder: 'e.g. 100', min: 1 },
    { name: 'pricePerHour', label: 'Price/Hour (₹)', type: 'number', placeholder: 'e.g. 50', min: 0 },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
      >
        <div 
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden relative" 
          style={{ maxHeight: '85vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Car Animation Overlay */}
          <AnimatePresence>
            {saving && <CarLoadingOverlay />}
          </AnimatePresence>

          <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-700 shrink-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isEdit ? 'Edit Parking Spot' : 'Add New Spot'}</h3>
            <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition">
              <X className="w-4 h-4 text-gray-600 dark:text-slate-400" />
            </button>
          </div>

          <form id="spot-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4 flex-1 bg-white dark:bg-slate-800" style={{ minHeight: 0 }}>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300">Spot Photo</label>
              {imagePreview && (
                <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-inner mb-2">
                  <img src={imagePreview} alt="Spot Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className="w-full text-sm text-gray-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-brand-50 dark:file:bg-brand-900/30 file:text-brand-600 dark:file:text-brand-400 hover:file:bg-brand-100 dark:hover:file:bg-brand-900/50 transition cursor-pointer"
              />
            </div>
            
            {fields.map((field) => (
              <div key={field.name} className="gap-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">{field.label}</label>
                <input
                  type={field.type}
                  name={field.name}
                  value={formData[field.name]}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  min={field.min}
                  max={field.max}
                  step={field.type === 'number' ? 'any' : undefined}
                  required
                  className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            ))}

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-1">Parking Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
              >
                {['Covered', 'Open', 'Basement', 'EV-friendly', 'Bike'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

          </form>

          <div className="p-6 py-4 border-t border-gray-100 dark:border-slate-700 flex gap-3 shrink-0 bg-gray-50/50 dark:bg-slate-800/50">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 font-semibold py-2.5 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
            >
              Cancel
            </button>
            <button
              form="spot-form"
              type="submit"
              disabled={saving}
              className="flex-1 bg-brand-600 text-white font-semibold py-2.5 rounded-xl hover:bg-brand-500 transition flex items-center justify-center relative overflow-hidden"
            >
              {saving ? (
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                   <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              ) : isEdit ? 'Update Spot' : 'Create Spot'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default SpotFormModal;

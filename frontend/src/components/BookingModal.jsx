import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BookingModal = ({ isOpen, onClose, spot, onConfirm, isBooking }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [bookingType, setBookingType] = useState('instant');
  const [durationHours, setDurationHours] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(0);
  const [advancedDate, setAdvancedDate] = useState('');
  const [advancedTime, setAdvancedTime] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen || !spot) return null;

  const handleSubmit = () => {
    onConfirm({
      vehicleNumber,
      bookingType,
      durationHours: durationHours + (durationMinutes / 60),
      advancedDate,
      advancedTime
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-700 relative"
        >
          {/* Car Animation Overlay */}
          {isAnimating && (
            <div className="absolute inset-0 z-[60] bg-white/90 dark:bg-slate-800/90 flex flex-col items-center justify-center overflow-hidden pointer-events-none">
              <div className="relative w-full h-48 flex items-center justify-center">
                {/* Parking Box */}
                <div className="absolute right-12 w-24 h-16 border-2 border-dashed border-brand-500 rounded-lg flex items-center justify-center bg-brand-50/30 dark:bg-brand-900/10">
                   <span className="text-[10px] font-bold text-brand-600 uppercase tracking-tighter">Vacant Box</span>
                </div>
                
                {/* Moving Car */}
                <motion.div
                  initial={{ x: -200, opacity: 0 }}
                  animate={{ 
                    x: [ -200, 0, 150 ], // Moves from left, stops in middle, then enters box
                    y: [ 0, -10, 0 ],    // Slight bounce
                    opacity: [0, 1, 1],
                    rotate: [0, 0, 0]
                  }}
                  transition={{ 
                    duration: 2.2, 
                    times: [0, 0.4, 1],
                    ease: "easeInOut" 
                  }}
                  className="text-brand-600 dark:text-brand-400"
                >
                  <Car size={48} fill="currentColor" />
                </motion.div>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg font-bold text-slate-800 dark:text-white mt-4"
              >
                Finding the best spot...
              </motion.p>
            </div>
          )}

          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{spot.name}</h3>
              <p className="text-sm font-semibold text-brand-600 dark:text-brand-400 mt-0.5">
                {'\u20B9'}{spot.pricePerHour || spot.price} / hour
              </p>
            </div>
            <button onClick={onClose} className="p-2 bg-white dark:bg-slate-700 rounded-full hover:bg-slate-100 dark:hover:bg-slate-600 transition shadow-sm border border-slate-200 dark:border-slate-600">
              <X className="w-5 h-5 text-slate-500 dark:text-slate-300" />
            </button>
          </div>

          {/* Form Content */}
          <div className="p-6 space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Vehicle Number</label>
              <input
                 type="text"
                 placeholder="e.g. MH-12-AB-1234"
                 className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium"
                 value={vehicleNumber}
                 onChange={e => setVehicleNumber(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Booking Type</label>
              <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
                <button 
                  onClick={() => setBookingType('instant')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${bookingType === 'instant' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  Instant
                </button>
                <button 
                  onClick={() => setBookingType('advanced')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${bookingType === 'advanced' ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  Advanced
                </button>
              </div>
            </div>

            {bookingType === 'advanced' && (
               <div className="grid grid-cols-2 gap-3">
                 <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Date</label>
                   <input type="date" className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-brand-500" value={advancedDate} onChange={e => setAdvancedDate(e.target.value)} />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Time</label>
                   <input type="time" className="w-full px-3 py-2.5 rounded-lg text-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:border-brand-500" value={advancedTime} onChange={e => setAdvancedTime(e.target.value)} />
                 </div>
               </div>
            )}
            
            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-200 dark:border-slate-600">
              <div>
                <span className="block text-sm font-bold text-slate-700 dark:text-slate-300">Duration</span>
                <span className="text-xs text-slate-500">How long will you park?</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between space-x-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden shadow-sm">
                  <span className="w-10 text-center text-[10px] text-slate-400 font-bold uppercase border-r border-slate-100 dark:border-slate-700">Hrs</span>
                  <button onClick={() => setDurationHours(Math.max(0, durationHours - 1))} disabled={durationHours === 0} className="px-3 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold disabled:opacity-30">-</button>
                  <span className="w-6 text-center font-bold text-slate-900 dark:text-white">{durationHours}</span>
                  <button onClick={() => setDurationHours(Math.min(24, durationHours + 1))} className="px-3 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold">+</button>
                </div>
                <div className="flex items-center justify-between space-x-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden shadow-sm">
                  <span className="w-10 text-center text-[10px] text-slate-400 font-bold uppercase border-r border-slate-100 dark:border-slate-700">Mins</span>
                  <button onClick={() => setDurationMinutes(Math.max(0, durationMinutes - 15))} disabled={durationHours === 0 && durationMinutes <= 15} className="px-3 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold disabled:opacity-30">-</button>
                  <span className="w-6 text-center font-bold text-slate-900 dark:text-white">{durationMinutes}</span>
                  <button onClick={() => setDurationMinutes(Math.min(45, durationMinutes + 15))} className="px-3 py-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 font-bold">+</button>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Total Amount:</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{'\u20B9'}{((spot.pricePerHour || spot.price) * (durationHours + (durationMinutes / 60))).toFixed(2)}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleSubmit}
              disabled={isBooking}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] flex justify-center items-center gap-2"
            >
              {isBooking ? (
                <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" /> Confirm {'&'} Pay
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BookingModal;

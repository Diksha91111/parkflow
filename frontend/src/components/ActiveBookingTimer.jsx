import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';

const ActiveBookingTimer = ({ booking, durationHours, onTimerEnd }) => {
  const [timeLeft, setTimeLeft] = useState(durationHours * 3600); // in seconds
  const [hasAlerted, setHasAlerted] = useState(false);

  useEffect(() => {
    if (!booking) return;

    // Reset when a new booking comes in
    setTimeLeft(durationHours * 3600);
    setHasAlerted(false);
  }, [booking, durationHours]);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimerEnd();
      return;
    }

    // 15 minutes = 900 seconds
    if (timeLeft === 900 && !hasAlerted) {
      toast.warning("Only 15 mins left in your booking!", { icon: <AlertTriangle className="w-5 h-5 text-amber-500" /> });
      setHasAlerted(true);
    } else if (timeLeft < 900 && !hasAlerted) {
      // Just in case we somehow missed the exact second
      setHasAlerted(true);
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onTimerEnd, hasAlerted]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 900; // less than 15 mins

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 flex items-center gap-4 min-w-[280px]"
      >
        <div className={`p-3 rounded-full flex-shrink-0 ${isLowTime ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse' : 'bg-brand-50 text-brand-600 dark:bg-brand-900/30'}`}>
          <Clock className="w-6 h-6" />
        </div>
        
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5">
            Active Booking Ends In
          </p>
          <div className={`text-2xl font-black font-mono tracking-tight ${isLowTime ? 'text-amber-500 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>
            {formatTime(Math.max(0, timeLeft))}
          </div>
        </div>

        <button 
          onClick={onTimerEnd}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          title="Stop Timer"
        >
          <X className="w-5 h-5" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};

export default ActiveBookingTimer;

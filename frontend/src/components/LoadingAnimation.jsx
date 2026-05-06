import React from 'react';
import { motion } from 'framer-motion';
import { Car } from 'lucide-react';

const LoadingAnimation = ({ onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      onAnimationComplete={() => onComplete && onComplete()}
      className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Road / Parking Lines Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white border-t-2 border-dashed border-white/40"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-32 border-2 border-white/20 rounded-lg"></div>
      </div>

      <div className="relative w-full max-w-2xl h-64 flex items-center justify-center">
        {/* The Car Animation */}
        <motion.div
          initial={{ x: '-120vw', rotate: 0 }}
          animate={{ 
            x: ['-120vw', '0vw', '0vw'],
            rotate: [0, 0, -15, 0],
            y: [0, 0, -10, 0]
          }}
          transition={{ 
            duration: 2.5,
            times: [0, 0.6, 0.8, 1],
            ease: "easeOut"
          }}
          className="relative"
        >
          <div className="bg-brand-500 p-4 rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.5)] logo-3d">
            <Car className="w-16 h-16 text-white" />
          </div>
          
          {/* Headlights effect */}
          <div className="absolute top-1/4 -right-4 w-12 h-8 bg-white/20 blur-xl rounded-full"></div>
          <div className="absolute bottom-1/4 -right-4 w-12 h-8 bg-white/20 blur-xl rounded-full"></div>

          {/* Wheels / Shadow */}
          <div className="flex justify-between px-2 -mt-2">
            <div className="w-3 h-3 bg-slate-800 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-3 h-3 bg-slate-800 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="mt-8 text-center"
      >
        <h2 className="text-2xl font-black text-white tracking-[0.3em] uppercase mb-2">
          Park<span className="text-brand-500">Smart</span>
        </h2>
        <p className="text-slate-400 text-sm font-medium tracking-widest animate-pulse">
          PREPARING YOUR SPOT...
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingAnimation;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, CheckCircle2, Search, MapPin, Navigation2 } from 'lucide-react';

const TopViewCar = ({ color = "#3b5bdb" }) => (
  <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
    {/* Shadow */}
    <rect x="2" y="2" width="76" height="36" rx="10" fill="black" fillOpacity="0.15" />
    {/* Body */}
    <rect width="80" height="40" rx="12" fill={color} />
    {/* Roof */}
    <rect x="20" y="5" width="35" height="30" rx="6" fill="white" fillOpacity="0.2" />
    {/* Windshield */}
    <path d="M55 8C55 8 65 10 65 20C65 30 55 32 55 32" stroke="white" strokeWidth="2" strokeOpacity="0.5" strokeLinecap="round" />
    {/* Rear window */}
    <path d="M20 8C20 8 12 10 12 20C12 30 20 32 20 32" stroke="white" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
    {/* Headlights */}
    <rect x="74" y="6" width="4" height="8" rx="2" fill="white" fillOpacity="0.8" />
    {/* Tail lights */}
    <rect x="2" y="6" width="3" height="8" rx="1.5" fill="#ff4d4d" />
    <rect x="2" y="26" width="3" height="8" rx="1.5" fill="#ff4d4d" />
    <rect x="74" y="26" width="4" height="8" rx="2" fill="white" fillOpacity="0.8" />
  </svg>
);

const ParkingSimulation = () => {
  const [stage, setStage] = useState('start'); // start, aligning, parking, arrived
  const [blocks, setBlocks] = useState([
    { id: 1, state: 'available' },
    { id: 2, state: 'available' },
    { id: 3, state: 'booked' }, // TARGET
    { id: 4, state: 'available' },
  ]);

  useEffect(() => {
    const sequence = async () => {
      // 1. Reset
      setStage('start');
      setBlocks(prev => prev.map(b => b.id === 3 ? { ...b, state: 'booked' } : b));
      await new Promise(r => setTimeout(r, 1000));

      // 2. Align horizontally with the 3rd block
      setStage('aligning');
      await new Promise(r => setTimeout(r, 2000));

      // 3. Move vertically upward into the 3rd block
      setStage('parking');
      await new Promise(r => setTimeout(r, 2000));

      // 4. Change block state to occupied
      setStage('arrived');
      setBlocks(prev => prev.map(b => b.id === 3 ? { ...b, state: 'occupied' } : b));

      // 5. Reset loop after 1s
      await new Promise(r => setTimeout(r, 1000));
    };

    sequence();
    const interval = setInterval(sequence, 6000);
    return () => clearInterval(interval);
  }, []);

  // Block dimensions and layout
  const blockWidth = 140;
  const blockHeight = 100;
  const gap = 15;
  const totalWidth = (blockWidth + gap) * blocks.length - gap;

  return (
    <div className="relative w-full max-w-4xl mx-auto h-[400px] bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border-2 border-[#3b5bdb]/30 dark:border-blue-500/30 shadow-2xl shadow-blue-500/10 transition-all duration-500 flex items-center justify-center">
      {/* Grid Canvas */}
      <div className="relative" style={{ width: `${totalWidth}px`, height: '350px' }}>
        
        {/* Parking Blocks */}
        <div className="flex gap-4 justify-center">
          {blocks.map((block) => (
            <div 
              key={block.id}
              className={`relative rounded-2xl border-2 transition-all duration-700 flex flex-col items-center justify-center overflow-hidden
                ${block.state === 'available' ? 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40' : ''}
                ${block.state === 'booked' ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20 shadow-[0_0_20px_rgba(59,91,219,0.15)]' : ''}
                ${block.state === 'occupied' ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-500 dark:bg-emerald-900/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]' : ''}
              `}
              style={{ width: `${blockWidth}px`, height: `${blockHeight}px` }}
            >
              <div className={`text-[10px] font-black uppercase tracking-widest mb-1 
                ${block.state === 'available' ? 'text-slate-300 dark:text-slate-600' : ''}
                ${block.state === 'booked' ? 'text-blue-500 animate-pulse' : ''}
                ${block.state === 'occupied' ? 'text-emerald-500' : ''}
              `}>
                {block.state}
              </div>
              <div className={`text-xs font-bold ${block.state === 'available' ? 'text-slate-200' : 'text-slate-400'}`}>Slot {block.id}</div>
            </div>
          ))}
        </div>

        {/* Animated Car */}
        <motion.div
          className="absolute z-20 pointer-events-none"
          initial={{ x: 0, y: 220 }} // Start below Block 1
          animate={
            stage === 'start' ? { x: 30, y: 220 } :
            stage === 'aligning' ? { x: (blockWidth + gap) * 2 + 30, y: 220 } : // Align horizontally with Block 3
            stage === 'parking' ? { x: (blockWidth + gap) * 2 + 30, y: 0 } : // Move vertically up into Block 3
            { x: (blockWidth + gap) * 2 + 30, y: 0 } // Arrived
          }
          transition={{
            duration: 1.5,
            ease: "easeInOut",
          }}
        >
          <div className="relative group scale-110">
            <TopViewCar />
            <div className="absolute inset-0 bg-black/10 blur-lg -z-10 translate-y-4 scale-90" />
          </div>
        </motion.div>

        {/* Path Visualizers (Optional but adds to "grid" feel) */}
        <div className="absolute inset-0 -z-10 opacity-5 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#3b5bdb 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
      </div>
    </div>
  );
};

export default ParkingSimulation;


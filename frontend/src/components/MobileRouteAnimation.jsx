import React from 'react';
import { motion } from 'framer-motion';

const MapMarker = ({ x, y, color }) => (
  <g transform={`translate(${x}, ${y}) scale(0.8)`}>
    <path
      d="M0 -30 C-10 -30, -20 -20, -20 -10 C-20 5, 0 30, 0 30 C0 30, 20 5, 20 -10 C20 -20, 10 -30, 0 -30 Z"
      fill={color}
    />
    <circle cx="0" cy="-12" r="6" fill="white" />
  </g>
);

const MobileRouteSimulation = () => {
  // S-Curve path for the route
  const routePath = "M120,80 C280,120 300,240 160,300 C20,360 40,480 160,520 C220,540 200,600 120,650";

  return (
    <div className="relative w-[320px] h-[640px] bg-[#0f172a] rounded-[3rem] border-[10px] border-slate-800 shadow-2xl overflow-hidden mx-auto ring-4 ring-slate-900/50">
      
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
          backgroundSize: '30px 30px'
        }}
      ></div>

      {/* Glassy Background Widgets */}
      <div className="absolute top-12 left-6 w-24 h-24 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50"></div>
      <div className="absolute bottom-24 right-8 w-32 h-20 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50"></div>
      <div className="absolute top-[280px] left-4 w-20 h-20 bg-green-900/20 backdrop-blur-md rounded-2xl border border-green-800/30"></div>

      {/* SVG Canvas for Animation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 320 640">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Thick Blurred Glowing Route */}
        <path
          d={routePath}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="12"
          strokeOpacity="0.3"
          filter="url(#glow)"
        />
        {/* Solid Inner Route */}
        <path
          d={routePath}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="4"
        />

        {/* Markers */}
        {/* Green - Near Top Curve */}
        <MapMarker x={200} y={190} color="#22c55e" />
        {/* Yellow - Middle Left Curve */}
        <MapMarker x={120} y={290} color="#eab308" />
        {/* Red - Bottom Curve */}
        <MapMarker x={180} y={500} color="#ef4444" />

        {/* Animated Car */}
        <g>
          <g transform="rotate(180)">
             {/* Car Body */}
             <rect x="-10" y="-16" width="20" height="32" rx="6" fill="#3b5bdb" />
             {/* Windshield */}
             <path d="M-8,-6 L8,-6 L6,-10 L-6,-10 Z" fill="#93c5fd" />
             {/* Back window */}
             <path d="M-8,10 L8,10 L6,14 L-6,14 Z" fill="#93c5fd" />
             {/* Headlights (Glowing) */}
             <circle cx="-6" cy="-16" r="2.5" fill="#ffffff" filter="url(#glow)" />
             <circle cx="6" cy="-16" r="2.5" fill="#ffffff" filter="url(#glow)" />
             {/* Taillights */}
             <rect x="-8" y="14" width="4" height="2" fill="#ef4444" />
             <rect x="4" y="14" width="4" height="2" fill="#ef4444" />
          </g>
          
          <animateMotion 
            dur="8s" 
            repeatCount="indefinite" 
            rotate="auto" 
            path={routePath} 
          />
        </g>
      </svg>
      
      {/* Mobile Top Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl shadow-inner"></div>
    </div>
  );
};

export default MobileRouteSimulation;

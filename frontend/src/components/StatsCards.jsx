import React from 'react';
import { BookOpen, ShieldCheck, Wallet, MapPin } from 'lucide-react';

const Card = ({ title, value, icon: Icon, colorClass, bgColorClass }) => ( // eslint-disable-line no-unused-vars
  <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex space-x-4 items-center card-hover glow-border">
    <div className={`p-4 rounded-full ${bgColorClass}`}>
      <Icon className={`w-6 h-6 ${colorClass}`} />
    </div>
    <div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
        {title}
      </p>
      <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
        {value}
      </h3>
    </div>
  </div>
);

const StatsCards = ({ metrics, availableSlots, t }) => {
  // metrics will come from the backend, availableSlots from the active list length
  const stats = [
    {
      title: t.totalBookings,
      value: metrics?.totalBookings || 0,
      icon: BookOpen,
      colorClass: 'text-indigo-600 dark:text-indigo-400',
      bgColorClass: 'bg-indigo-50 dark:bg-indigo-500/10'
    },
    {
      title: t.activeParkings,
      value: metrics?.activeBookings || 0,
      icon: ShieldCheck,
      colorClass: 'text-purple-600 dark:text-purple-400',
      bgColorClass: 'bg-purple-50 dark:bg-purple-500/10'
    },
    {
      title: t.totalSpent,
      value: `\u20B9${metrics?.totalSpent || 0}`,
      icon: Wallet,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      bgColorClass: 'bg-emerald-50 dark:bg-emerald-500/10'
    },
    {
      title: t.availableSlots,
      value: availableSlots || 0,
      icon: MapPin,
      colorClass: 'text-amber-600 dark:text-amber-400',
      bgColorClass: 'bg-amber-50 dark:bg-amber-500/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
      {stats.map((stat, idx) => (
        <Card key={idx} {...stat} />
      ))}
    </div>
  );
};

export default StatsCards;

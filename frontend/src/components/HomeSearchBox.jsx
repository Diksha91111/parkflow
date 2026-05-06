import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HomeSearchBox = () => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/dashboard?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="max-w-2xl mx-auto mb-12"
    >
      <form 
        onSubmit={handleSearch}
        className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-2xl shadow-blue-500/10 border border-gray-100 dark:border-slate-700 flex items-center gap-2 group focus-within:ring-2 focus-within:ring-[#3b5bdb]/20 transition-all duration-300"
      >
        <div className="flex-1 flex items-center px-4 py-2.5">
          <MapPin className="w-5 h-5 text-[#3b5bdb] mr-3 flex-shrink-0 group-focus-within:scale-110 transition-transform duration-300" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a city, street, or parking spot..."
            className="w-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 placeholder-gray-400 text-base font-medium outline-none"
          />
        </div>
        
        <button
          type="submit"
          className="bg-[#3b5bdb] hover:bg-[#364fc7] text-white px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-500/25"
        >
          <Search className="w-4 h-4" />
          <span className="hidden sm:inline">Find Parking</span>
          <span className="sm:hidden">Search</span>
        </button>
      </form>
    </motion.div>
  );
};

export default HomeSearchBox;

import { useState, useEffect, useRef } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

const SearchBar = ({ onSearchResults, onFiltersChange, userLocation }) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minPrice: null, maxPrice: null, availableOnly: false, types: [] });
  const debounceRef = useRef(null);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      onSearchResults(null); // null means reset to nearby
      return;
    }
    try {
      const params = { q: searchQuery };
      if (userLocation) {
        params.lat = userLocation.lat;
        params.lng = userLocation.lng;
      }
      const res = await api.get('/api/parking/search', { params });
      onSearchResults(res.data.data);
    } catch {
      onSearchResults(null);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSearch(val), 300);
  };

  const clearSearch = () => {
    setQuery('');
    onSearchResults(null);
  };

  const handleFilterChange = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFiltersChange(next);
  };

  const toggleTypeFilter = (typeStr) => {
    const newTypes = filters.types.includes(typeStr)
      ? filters.types.filter(t => t !== typeStr)
      : [...filters.types, typeStr];
    handleFilterChange('types', newTypes);
  };

  const setPriceRange = (min, max) => {
    const next = { ...filters, minPrice: min, maxPrice: max };
    setFilters(next);
    onFiltersChange(next);
  };

  const clearFilters = () => {
    const next = { minPrice: null, maxPrice: null, availableOnly: false, types: [] };
    setFilters(next);
    onFiltersChange(next);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const activeFilterCount = (filters.minPrice != null ? 1 : 0) + (filters.availableOnly ? 1 : 0) + (filters.types.length > 0 ? 1 : 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="glass-dark flex items-center rounded-full px-4 py-2.5 flex-1 max-w-xs shadow-xl">
          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={handleChange}
            placeholder="Search location..."
            className="bg-transparent text-white text-sm placeholder-gray-400 outline-none w-full"
          />
          {query && (
            <button onClick={clearSearch} className="ml-1">
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`glass-dark p-2.5 rounded-full shadow-xl transition relative ${showFilters ? 'ring-2 ring-brand-500' : ''}`}
        >
          <SlidersHorizontal className="w-4 h-4 text-white" />
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className="glass-dark rounded-2xl p-4 shadow-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filters</p>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs text-brand-400 hover:text-brand-300 font-medium">
                  Clear all
                </button>
              )}
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-2">Price Range</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Under \u20B930', min: 0, max: 30 },
                  { label: '\u20B930-60', min: 30, max: 60 },
                  { label: '\u20B960+', min: 60, max: null },
                ].map((opt) => {
                  const isActive = filters.minPrice === opt.min && filters.maxPrice === opt.max;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => isActive ? setPriceRange(null, null) : setPriceRange(opt.min, opt.max)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                        isActive
                          ? 'bg-brand-500 text-white'
                          : 'bg-white/10 text-gray-300 hover:bg-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input
                type="checkbox"
                checked={filters.availableOnly}
                onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 text-brand-500 focus:ring-brand-500 bg-gray-700"
              />
              <span className="text-xs text-gray-300 font-medium">Available spots only</span>
            </label>

            <div>
              <p className="text-xs text-gray-400 mb-2">Parking Type</p>
              <div className="flex flex-wrap gap-2">
                {['Covered', 'Open', 'Basement', 'EV-friendly', 'Bike'].map((type) => {
                  const isActive = filters.types.includes(type);
                  return (
                    <button
                      key={type}
                      onClick={() => toggleTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition ${
                        isActive
                          ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;

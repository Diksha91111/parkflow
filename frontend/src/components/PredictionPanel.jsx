import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronDown, ChevronUp, Navigation, Zap, TrendingUp } from 'lucide-react';
import api from '../lib/api';

const demandColors = {
  High: { bg: 'bg-red-100', text: 'text-red-700', bar: 'bg-red-500' },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', bar: 'bg-yellow-500' },
  Low: { bg: 'bg-green-100', text: 'text-green-700', bar: 'bg-green-500' },
};

const PredictionPanel = ({ userLocation, onSelectSpot }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [demandData, setDemandData] = useState(null);
  const [bestSpot, setBestSpot] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPredictions = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const [demandRes, spotRes] = await Promise.all([
        api.get('/api/prediction/demand', { params: { lat: userLocation.lat, lng: userLocation.lng } }),
        api.get('/api/prediction/best-spot', { params: { lat: userLocation.lat, lng: userLocation.lng } }),
      ]);
      setDemandData(demandRes.data.data);
      setBestSpot(spotRes.data.data?.recommended || null);
    } catch {
      // Silently fail - predictions are non-critical
    } finally {
      setLoading(false);
    }
  }, [userLocation]);

  useEffect(() => {
    fetchPredictions();
    const interval = setInterval(fetchPredictions, 60000);
    return () => clearInterval(interval);
  }, [fetchPredictions]);

  const demandLevel = demandData?.currentDemand || 'Low';
  const colors = demandColors[demandLevel] || demandColors.Low;

  return (
    <div className="pointer-events-auto">
      {/* Collapsed pill */}
      {!isExpanded && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setIsExpanded(true)}
          className="glass-dark px-4 py-2.5 rounded-full flex items-center gap-2 shadow-xl hover:bg-white/20 transition"
        >
          <Brain className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white hidden sm:inline">AI Insights</span>
          {demandData && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text}`}>
              {demandLevel}
            </span>
          )}
          <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
        </motion.button>
      )}

      {/* Expanded card */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass rounded-2xl shadow-2xl w-72 border border-white/30 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-900 text-sm">AI Insights</span>
              </div>
              <button onClick={() => setIsExpanded(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-brand-600"></div>
                </div>
              ) : (
                <>
                  {/* Demand Level */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Demand</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1 flex-1">
                        {['Low', 'Medium', 'High'].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition ${
                              demandLevel === level ? demandColors[level].bar : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                        {demandLevel}
                      </span>
                    </div>
                    {demandData?.forecast && demandData.forecast.length > 1 && (
                      <div className="mt-2 flex gap-2">
                        {demandData.forecast.slice(1).map((f) => (
                          <div key={f.hour} className="flex items-center gap-1 text-[10px] text-gray-500">
                            <span className={`w-1.5 h-1.5 rounded-full ${demandColors[f.demand]?.bar || 'bg-gray-300'}`} />
                            {f.hour}:00
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Best Spot */}
                  {bestSpot && (
                    <div className="bg-brand-50 rounded-xl p-3 border border-brand-100">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Zap className="w-3.5 h-3.5 text-brand-600" />
                        <p className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Best Spot</p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight mb-1">{bestSpot.name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mb-3">
                        <span>{bestSpot.availableSlots} slots</span>
                        <span>\u20B9{bestSpot.pricePerHour}/hr</span>
                        <span>{(bestSpot.distance / 1000).toFixed(1)} km</span>
                      </div>
                      <button
                        onClick={() => {
                          onSelectSpot(bestSpot);
                          setIsExpanded(false);
                        }}
                        className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold py-2 rounded-lg transition flex items-center justify-center gap-1.5"
                      >
                        <Navigation className="w-3.5 h-3.5" /> Navigate Here
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredictionPanel;

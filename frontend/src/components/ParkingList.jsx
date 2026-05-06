import React from 'react';
import { MapPin, Navigation, Star } from 'lucide-react';

const ParkingList = ({ spots, selectedSpot, onSpotSelect, onBookNow, t }) => {
  if (!spots || spots.length === 0) {
    return (
      <div className="h-full items-center justify-center flex p-8 text-slate-500 text-center border-2 border-dashed border-slate-200 dark:border-slate-700/50 rounded-3xl">
        <span>{t.noSpots}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 pr-2">
      {spots.map((spot) => {
        const isSelected = selectedSpot?._id === spot._id;
        const isAvailable = spot.availableSlots > 0;
        const isRecommended = spot.isRecommended;
        
        return (
          <div
            key={spot._id}
            onClick={() => onSpotSelect(spot)}
            className={`flex flex-col sm:flex-row items-stretch p-4 rounded-3xl border transition-all duration-300 cursor-pointer shadow-sm relative group card-hover glow-border overflow-hidden ${
              isSelected 
                ? 'bg-brand-50 border-brand-300 dark:bg-brand-900/20 dark:border-brand-500/50 ring-2 ring-brand-500/10' 
                : 'bg-white border-slate-100 hover:border-brand-200 hover:shadow-md dark:bg-slate-800 dark:border-slate-700'
            }`}
          >
            {isRecommended && (
              <div className="absolute -top-2 -left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-lg z-10 animate-bounce">
                <Star className="w-3 h-3 fill-white" /> {t.recommended}
              </div>
            )}

            {/* Image or Generic placeholder thumbnail */}
            <div className="w-full sm:w-24 h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl flex-shrink-0 flex items-center justify-center text-slate-400 overflow-hidden mb-4 sm:mb-0 relative">
               {spot.imageUrl ? (
                 <img src={spot.imageUrl} alt={spot.name} className="w-full h-full object-cover absolute inset-0" />
               ) : (
                 <span className="text-3xl relative z-10">{spot.type === 'EV' ? '⚡' : spot.type === 'Bike' ? '🏍️' : '🚗'}</span>
               )}
            </div>
            
            <div className="flex-1 sm:pl-5 pr-2 w-full flex flex-col justify-between h-24 min-w-0">
              <div className="min-h-[56px]">
                <div className="flex justify-between items-center h-8 mb-1">
                  <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight truncate pr-2">
                    {spot.name}
                  </h4>
                </div>
                
                <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-3 h-5">
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" /> {spot.distance ? `${Math.round(spot.distance)}m` : t.nearby}</span>
                  <span className="flex items-center"><Navigation className="w-3.5 h-3.5 mr-1" /> {spot.duration ? spot.duration : '-- min'}</span>
                  <span className="ml-auto">
                    <span className="flex items-center text-sm font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                      {'\u20B9'}{spot.pricePerHour} <span className="text-[10px] text-slate-500 ml-1">{t.perHour}</span>
                    </span>
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between w-full pt-2">
                <div className="flex items-center space-x-2">
                  {isAvailable ? (
                    <>
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                      </span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{spot.availableSlots} {t.available}</span>
                    </>
                  ) : (
                    <>
                      <span className="flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                      <span className="text-xs font-bold text-red-600 uppercase tracking-widest">{t.full}</span>
                    </>
                  )}
                </div>
                
                <button
                  disabled={!isAvailable}
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookNow(spot);
                  }}
                  className={`px-5 py-2 text-sm font-bold rounded-xl transition-all ml-auto ${
                    isAvailable 
                      ? 'bg-brand-600 hover:bg-brand-500 text-white shadow-md shadow-brand-500/20' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                  }`}
                >
                  {t.bookNow}
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  );
};

export default ParkingList;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

// Functional component to handle map centering dynamically when coords change
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, map, zoom]);
  return null;
};

// Custom Marker Generators
const getMarkerIcon = (isSelected, isAvailable) => {
  let bgColor = 'bg-slate-400';
  if (isSelected) bgColor = 'bg-brand-600 scale-125';
  else if (isAvailable) bgColor = 'bg-emerald-500';
  else bgColor = 'bg-red-500';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div class="w-5 h-5 rounded-full border-2 border-white shadow-md ${bgColor} transition-transform duration-300"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const userIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div class="w-6 h-6 rounded-full border-[3px] border-white bg-blue-500 flex items-center justify-center shadow-lg"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const defaultCenter = { lat: 28.6139, lng: 77.2090 };

const MapComponent = ({ userLocation, spots, selectedSpot, onSelectSpot }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const center = userLocation || defaultCenter;

  // Let CSS mount before loading the map container fully to avoid gray tiles
  useEffect(() => {
    const timer = setTimeout(() => setMapLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!mapLoaded) {
    return (
      <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center border border-slate-200 dark:border-slate-700 animate-pulse">
        <div className="flex flex-col items-center">
          <MapPin className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-slate-500 font-semibold">Initializing OpenStreetMap...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative rounded-3xl overflow-hidden shadow-sm z-0 section-highlight">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <ChangeView center={center} zoom={14} />

        {/* User Marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
        )}

        {/* Spots */}
        {spots && spots.map((spot) => {
          const isSelected = selectedSpot?._id === spot._id;
          const isAvailable = spot.availableSlots > 0;

          return (
            <Marker
              key={spot._id}
              position={[spot.lat, spot.lng]}
              icon={getMarkerIcon(isSelected, isAvailable)}
              eventHandlers={{
                click: () => onSelectSpot(spot)
              }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
};

export default React.memo(MapComponent);

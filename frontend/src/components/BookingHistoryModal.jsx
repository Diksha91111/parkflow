import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, MapPin, Clock, IndianRupee } from 'lucide-react';
import api from '../lib/api';

const BookingHistoryModal = ({ isOpen, onClose }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const didFetchRef = useRef(false);

  useEffect(() => {
    const fetchBookings = async () => {
      if (isOpen && !didFetchRef.current) {
        didFetchRef.current = true;
        setLoading(true);
        try {
          const res = await api.get('/api/bookings/my-bookings');
          setBookings(res.data.data || []);
        } catch {
          setBookings([]);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchBookings();
    if (!isOpen) {
      didFetchRef.current = false;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const statusColors = {
    Completed: 'bg-green-100 text-green-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    Pending: 'bg-orange-100 text-orange-800',
    Cancelled: 'bg-gray-100 text-gray-800',
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="bg-brand-50 p-2.5 rounded-xl">
              <BookOpen className="w-5 h-5 text-brand-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">My Bookings</h2>
              <p className="text-xs text-gray-500 font-medium">{bookings.length} total</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <BookOpen className="w-10 h-10 mb-2 text-gray-300" />
              <p className="font-medium">No bookings yet</p>
            </div>
          ) : (
            bookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-gray-50 rounded-2xl p-4 border border-gray-100"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-brand-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-gray-900 text-sm leading-tight">
                        {booking.parkingLocation?.locationName || 'Unknown Location'}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                      statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>
                      {formatDate(booking.time?.startTime)} at{' '}
                      {formatTime(booking.time?.startTime)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5" />
                    <span className="font-semibold text-gray-900">{booking.totalAmount}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
};

export default BookingHistoryModal;

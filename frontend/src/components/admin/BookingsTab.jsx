import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../lib/api';

const statusColors = {
  Completed: 'bg-green-100 text-green-800',
  Pending: 'bg-orange-100 text-orange-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Cancelled: 'bg-gray-100 text-gray-800',
};

const BookingsTab = ({ bookings, onBookingsChange }) => {
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/api/admin/bookings/${id}`, { status: newStatus });
      onBookingsChange(
        bookings.map((b) => (b._id === id ? { ...b, booking_status: newStatus } : b))
      );
      toast.success(`Booking status updated to ${newStatus}`);
    } catch {
      toast.error('Failed to update booking status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/bookings/${id}`);
      onBookingsChange(bookings.filter((b) => b._id !== id));
      setConfirmDelete(null);
      toast.success('Booking deleted');
    } catch {
      toast.error('Failed to delete booking');
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Booking Ledger</h3>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search driver or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white cursor-pointer"
            >
              {['All', 'upcoming', 'active', 'completed', 'cancelled'].map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
            {bookings.length} total
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Transaction ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Driver</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Spot</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {bookings.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                    <p>No bookings found yet</p>
                  </div>
                </td>
              </tr>
            ) : (
              bookings
                .filter(b => {
                  if (statusFilter !== 'All' && b.booking_status !== statusFilter) return false;
                  if (searchTerm) {
                    const term = searchTerm.toLowerCase();
                    const driver = (b.userId?.name || '').toLowerCase();
                    const id = (b.razorpayOrderId || b._id || '').toLowerCase();
                    return driver.includes(term) || id.includes(term);
                  }
                  return true;
                })
                .map((booking) => (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={booking._id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {booking.razorpayOrderId || booking._id.substring(0, 10) + '...'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">{booking.userId?.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-500">{booking.userId?.email || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-50 text-blue-700">
                      {booking.parkingSlotId?.name || booking.parkingLocation?.locationName || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={booking.booking_status || 'upcoming'}
                      onChange={(e) => handleStatusChange(booking._id, e.target.value)}
                      className={`px-3 py-1 text-xs font-bold rounded-full border-0 cursor-pointer ${
                        statusColors[booking.booking_status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {['upcoming', 'active', 'completed', 'cancelled'].map((s) => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold text-right">
                    {'\u20B9'}{booking.amount_paid || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {confirmDelete === booking._id ? (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleDelete(booking._id)}
                          className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-red-600"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-lg font-semibold hover:bg-gray-300"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(booking._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingsTab;

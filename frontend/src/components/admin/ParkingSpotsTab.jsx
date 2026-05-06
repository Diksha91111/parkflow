import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../lib/api';
import SpotFormModal from './SpotFormModal';

const ParkingSpotsTab = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchSpots = async () => {
    try {
      const res = await api.get('/api/admin/parking');
      setSpots(res.data.data || []);
    } catch {
      toast.error('Failed to load parking spots');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpots();
  }, []);

  const handleSave = async (data) => {
    try {
      if (editingSpot) {
        await api.put(`/api/admin/parking/${editingSpot._id}`, data);
        toast.success('Spot updated');
      } else {
        // Use the new add-slot endpoint as requested
        const res = await api.post('/api/admin/add-slot', data);
        if (res.data.success) {
           toast.success('Spot created');
        } else {
           toast.error(res.data.message || 'Failed to create spot');
        }
      }
      setShowForm(false);
      setEditingSpot(null);
      fetchSpots();
    } catch (error) {
      console.error('Save error details:', error.response?.data);
      const serverMsg = error.response?.data?.message || 'Failed to save spot';
      const debugMsg = error.response?.data?.debug_info?.message;
      toast.error(debugMsg ? `Server: ${debugMsg}` : serverMsg);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/admin/parking/${id}`);
      setSpots(spots.filter((s) => s._id !== id));
      setConfirmDelete(null);
      toast.success('Spot deleted');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete spot');
    }
  };

  const openEdit = (spot) => {
    setEditingSpot(spot);
    setShowForm(true);
  };

  const openCreate = () => {
    setEditingSpot(null);
    setShowForm(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="relative w-24 h-24 flex items-center justify-center">
           <div className="absolute inset-0 animate-spin rounded-full h-24 w-24 border-t-2 border-b-2 border-brand-600/30"></div>
           <MapPin className="w-8 h-8 text-brand-600 animate-bounce" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-slate-800 shadow-sm border border-gray-100 dark:border-slate-700 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Parking Spots</h3>
          </div>
          <button
            onClick={openCreate}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition shadow-md shadow-brand-500/20"
          >
            <Plus className="w-4 h-4" /> Add Spot
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-white dark:bg-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Address</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Available</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Price/hr</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700">
              {spots.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-500 dark:text-slate-400">
                    <MapPin className="w-10 h-10 text-gray-300 dark:text-slate-700 mx-auto mb-2" />
                    <p>No parking spots. Add your first one!</p>
                  </td>
                </tr>
              ) : (
                spots.map((spot) => (
                  <tr key={spot._id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900 dark:text-white">{spot.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        {spot.lat?.toFixed(4)}, {spot.lng?.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-300 max-w-[200px] truncate">{spot.address}</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 rounded-lg">{spot.type || 'Open'}</td>
                    <td className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">{spot.totalSlots}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${spot.availableSlots < 5 ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>
                        {spot.availableSlots}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center capitalize">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${spot.status === 'occupied' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}>
                        {spot.status || (spot.availableSlots === 0 ? 'occupied' : 'available')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900 dark:text-white">{'\u20B9'}{spot.pricePerHour}</td>
                    <td className="px-6 py-4 text-center">
                      {confirmDelete === spot._id ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleDelete(spot._id)}
                            className="text-xs bg-red-500 text-white px-3 py-1 rounded-lg font-semibold hover:bg-red-600"
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            className="text-xs bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-3 py-1 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-slate-600"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEdit(spot)}
                            className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(spot._id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <SpotFormModal
            isOpen={showForm}
            onClose={() => { setShowForm(false); setEditingSpot(null); }}
            onSave={handleSave}
            spot={editingSpot}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default ParkingSpotsTab;

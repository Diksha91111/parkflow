import React, { useState, useEffect } from 'react';
import { MessageSquare, Star, Search, Filter, AlertCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../lib/api';

const FeedbackTab = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [spotAverages, setSpotAverages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('All');

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await api.get('/api/admin/feedback');
        if (res.data.success) {
          setFeedbacks(res.data.data);
          setSpotAverages(res.data.spotAverages);
        }
      } catch (err) {
        toast.error('Failed to load feedback');
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  const overallAvg = feedbacks.length 
    ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1)
    : 0;

  const renderStars = (rating) => {
    return (
      <div className="flex items-center text-orange-400">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? 'fill-current' : 'text-gray-300'}`} />
        ))}
      </div>
    );
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    if (ratingFilter !== 'All' && String(f.rating) !== ratingFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const user = (f.userName || '').toLowerCase();
      const spot = (f.spotName || '').toLowerCase();
      return user.includes(term) || spot.includes(term);
    }
    return true;
  });

  const handleDeleteFeedback = async (feedbackId) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;
    
    try {
      const res = await api.delete(`/api/admin/feedback/${feedbackId}`);
      if (res.data.success) {
        setFeedbacks(feedbacks.filter(f => f._id !== feedbackId));
        toast.success('Feedback deleted successfully');
      }
    } catch (err) {
      toast.error('Failed to delete feedback');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Overall avg card */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-1">System Avg Rating</p>
            <h3 className="text-3xl font-black text-gray-900 flex items-center gap-2">
              {overallAvg} <Star className="w-6 h-6 text-orange-400 fill-current" />
            </h3>
          </div>
          <div className="p-4 bg-orange-50 rounded-full">
            <MessageSquare className="w-6 h-6 text-orange-500" />
          </div>
        </div>
        
        {/* Top rated spots small list */}
        <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h4 className="text-sm font-semibold text-gray-500 mb-3">Top Rated Spots</h4>
          <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
            {spotAverages.length === 0 && <p className="text-sm text-gray-400">No ratings yet.</p>}
            {spotAverages.sort((a,b) => b.avgRating - a.avgRating).slice(0, 3).map((spot) => (
              <div key={spot._id} className="min-w-[150px] bg-gray-50 rounded-xl p-3 border border-gray-100">
                <p className="font-bold text-sm text-gray-900 truncate" title={spot.spotName}>{spot.spotName}</p>
                <div className="flex items-center gap-1 mt-1 text-sm font-semibold">
                  <Star className="w-3.5 h-3.5 text-orange-400 fill-current" />
                  {spot.avgRating.toFixed(1)} <span className="text-gray-400 font-normal">({spot.count})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-3xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-brand-600" />
            <h3 className="text-lg font-bold text-gray-900">User Feedback</h3>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search user or spot..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 w-full md:w-64"
              />
            </div>
            <div className="relative">
              <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 appearance-none bg-white cursor-pointer"
              >
                <option value="All">All Ratings</option>
                {[5,4,3,2,1].map(r => <option key={r} value={String(r)}>{r} Stars</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Spot Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rating</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Comment</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredFeedbacks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <AlertCircle className="w-10 h-10 text-gray-300 mb-2" />
                      <p>No feedback found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFeedbacks.map((f) => (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    key={f._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(f.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {f.userName || 'Anonymous'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {f.spotName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderStars(f.rating)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={f.comment}>
                      {f.comment || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteFeedback(f._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete feedback"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FeedbackTab;

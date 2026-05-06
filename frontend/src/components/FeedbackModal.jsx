import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../lib/api';

const FeedbackModal = ({ isOpen, onClose, locationName, spotId }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating before submitting!');
      return;
    }

    try {
      if (spotId) {
        await api.post('/api/feedback', {
          parkingSpotId: spotId,
          spotName: locationName,
          rating,
          comment: message
        });
      }
      toast.success('Thank you for your feedback!');
    } catch (err) {
      toast.success('Thank you for your feedback! (Offline Mode)');
    }
    
    // Reset state and close
    setRating(0);
    setMessage('');
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[1000] animate-fade-in"
        onClick={onClose}
      ></div>
      <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden pointer-events-auto border border-slate-100 dark:border-slate-700"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-brand-600 to-brand-500 p-6 text-white relative">
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-2xl font-black mb-1">How was your parking?</h2>
            <p className="text-brand-100 text-sm font-medium">
              Rate your experience at <span className="font-bold text-white">{locationName || 'the location'}</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Star Rating */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-100 text-slate-200 dark:fill-slate-700 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {rating === 0 ? 'Tap to rate' : 
                 rating === 1 ? 'Terrible' : 
                 rating === 2 ? 'Poor' : 
                 rating === 3 ? 'Okay' : 
                 rating === 4 ? 'Good' : 'Excellent!'}
              </p>
            </div>

            {/* Message Textarea */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                <MessageSquare className="w-4 h-4 text-brand-500" />
                Additional Comments
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what you liked or how we can improve..."
                className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl resize-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white text-sm"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-brand-500/30 flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              Submit Feedback
            </button>
          </form>
        </motion.div>
      </div>
    </>
  );
};

export default FeedbackModal;

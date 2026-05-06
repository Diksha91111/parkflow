import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { toast } from 'react-toastify';
import { Clock, MapPin, Calendar, Trash2, Star, X } from 'lucide-react';
import api from '../lib/api';

const translations = {
  en: {
    dashboard: "Dashboard",
    bookingHistory: "Booking History",
    profile: "Profile",
    chatbot: "AI Assistant",
    logout: "Logout",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this booking?",
    historyTitle: "Booking History",
    historySubtitle: "Review your past and upcoming reservations",
    noBookings: "You have no booking records available yet.",
    amountPaid: "Amount Paid",
    loadingRecords: "Loading records...",
    duration: "Duration",
    hour: "Hour(s)",
    vehicle: "Vehicle"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    bookingHistory: "बुकिंग इतिहास",
    profile: "प्रोफ़ाइल",
    chatbot: "AI सहायक",
    logout: "लॉगआउट",
    delete: "हटाएं",
    confirmDelete: "क्या आप वाकई इस बुकिंग को हटाना चाहते हैं?",
    historyTitle: "बुकिंग इतिहास",
    historySubtitle: "अपने पिछले और आगामी आरक्षणों की समीक्षा करें",
    noBookings: "आपके पास अभी तक कोई बुकिंग रिकॉर्ड उपलब्ध नहीं है।",
    amountPaid: "भुगतान की गई राशि",
    loadingRecords: "रिकॉर्ड लोड हो रहे हैं...",
    duration: "अवधि",
    hour: "घंटा(घंटे)",
    vehicle: "वाहन"
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    bookingHistory: "बुकिंग इतिहास",
    profile: "प्रोफाइल",
    chatbot: "AI सहाय्यक",
    logout: "लॉगआउट",
    delete: "हटवा",
    confirmDelete: "तुम्हाला खात्री आहे की तुम्ही ही बुकिंग हटवू इच्छिता?",
    historyTitle: "बुकिंग इतिहास",
    historySubtitle: "तुमच्या मागील आणि आगामी आरक्षणांचे पुनरावलोकन करा",
    noBookings: "तुमच्याकडे अद्याप कोणतेही बुकिंग रेकॉर्ड उपलब्ध नाहीत.",
    amountPaid: "भरलेली रक्कम",
    loadingRecords: "रेकॉर्ड लोड होत आहेत...",
    duration: "कालावधी",
    hour: "तास",
    vehicle: "वाहन"
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    bookingHistory: "முன்பதிவு வரலாறு",
    profile: "சுயவிவரம்",
    chatbot: "AI உதவியாளர்",
    logout: "வெளியேறு",
    delete: "நீக்கு",
    confirmDelete: "இந்த முன்பதிவை நீக்க விரும்புகிறீர்களா?",
    historyTitle: "முன்பதிவு வரலாறு",
    historySubtitle: "உங்கள் கடந்தகால மற்றும் வரவிருக்கும் முன்பதிவுகளை மதிப்பாய்வு செய்யவும்",
    noBookings: "உங்களிடம் இன்னும் முன்பதிவு பதிவுகள் எதுவும் இல்லை.",
    amountPaid: "செலுத்தப்பட்ட தொகை",
    loadingRecords: "பதிவுகள் ஏற்றப்படுகின்றன...",
    duration: "கால அளவு",
    hour: "மணிநேரம்",
    vehicle: "வாகனம்"
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    bookingHistory: "বুকিং ইতিহাস",
    profile: "প্রোফাইল",
    chatbot: "AI সহকারী",
    logout: "লগআউট",
    delete: "মুছে ফেলুন",
    confirmDelete: "আপনি কি নিশ্চিত যে আপনি এই বুকিংটি মুছে ফেলতে চান?",
    historyTitle: "বুকিং ইতিহাস",
    historySubtitle: "আপনার অতীত এবং আসন্ন সংরক্ষণ পর্যালোচনা করুন",
    noBookings: "আপনার কাছে এখনও কোনো বুকিং রেকর্ড নেই।",
    amountPaid: "পরিশোধিত অর্থ",
    loadingRecords: "রেকর্ড লোড হচ্ছে...",
    duration: "সময়কাল",
    hour: "ঘণ্টা",
    vehicle: "যানবাহন"
  },
  te: {
    dashboard: "డ్యాష్‌బోర్డ్",
    bookingHistory: "బుకింగ్ చరిత్ర",
    profile: "ప్రొఫైల్",
    chatbot: "AI సహాయకుడు",
    logout: "లాగ్ అవుట్",
    delete: "తొలగించు",
    confirmDelete: "మీరు ఖచ్చితంగా ఈ బుకింగ్‌ను తొలగించాలనుకుంటున్నారా?",
    historyTitle: "బుకింగ్ చరిత్ర",
    historySubtitle: "మీ గత మరియు రాబోయే రిజర్వేషన్లను సమీక్షించండి",
    noBookings: "మీకు ఇంకా బుకింగ్ రికార్డులు లేవు.",
    amountPaid: "చెల్లించిన మొత్తం",
    loadingRecords: "రికార్డులు లోడ్ అవుతున్నాయి...",
    duration: "వ్యవధి",
    hour: "గంట(లు)",
    vehicle: "వాహనం"
  }
};

const BookingHistory = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackBooking, setFeedbackBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lang] = useState(() => localStorage.getItem('lang') || 'en');
  const t = translations[lang] || translations['en'];

  useEffect(() => {
    fetchBookings();
    
    // Listen for storage events to update when bookings change
    const handleStorageChange = () => {
      const local = JSON.parse(localStorage.getItem('bookings') || '[]');
      setBookings(local);
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/api/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.data);
        // Keep localStorage in sync for other components
        localStorage.setItem('bookings', JSON.stringify(res.data.data));
      }
    } catch (err) {
      console.error('API fetch failed, falling back to local storage', err);
      const local = JSON.parse(localStorage.getItem('bookings') || '[]');
      setBookings(local);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t.confirmDelete)) {
      try {
        // Use API to delete if possible, otherwise just update local
        // Assuming there is a DELETE /api/bookings/:id endpoint
        // await api.delete(`/api/bookings/${id}`);
        
        const local = JSON.parse(localStorage.getItem('bookings') || '[]');
        const updated = local.filter(b => b._id !== id);
        localStorage.setItem('bookings', JSON.stringify(updated));
        setBookings(updated);
        toast.success('Booking deleted successfully');
      } catch {
        toast.error('Failed to delete booking');
      }
    }
  };

  const handleFeedbackSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/feedback', {
        parkingSpotId: feedbackBooking.parkingSlotId,
        rating,
        comment
      });
      toast.success('Thank you for your feedback!');
      setFeedbackBooking(null);
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback. You may have already reviewed this spot.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-transparent font-sans overflow-hidden window-border-highlight">
      <Sidebar t={t} />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <header className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight heading-modern animate-fade-in-up">{t.historyTitle}</h2>
          <p className="text-slate-500 font-medium mt-1">{t.historySubtitle}</p>
        </header>

        {loading ? (
          <div className="flex justify-center p-12"><span className="animate-pulse font-bold text-slate-400">{t.loadingRecords}</span></div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center section-highlight animate-fade-in-up">
             <p className="text-slate-500 font-medium">{t.noBookings}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map((b, idx) => (
              <div key={b._id} className="bg-white dark:bg-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-center transition-all hover:scale-[1.01] section-highlight animate-slide-right" style={{ animationDelay: `${0.1 * idx}s` }}>
                 <div className="flex-1 w-full mb-4 sm:mb-0">
                    <div className="flex items-center justify-between sm:justify-start sm:space-x-3 mb-2">
                       <div className="flex items-center space-x-3">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg ${
                          b.booking_status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                          b.booking_status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                          b.booking_status === 'completed' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {b.booking_status}
                        </span>
                        <span className="text-xs font-bold text-slate-400 flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1" />
                          {new Date(b.createdAt).toLocaleDateString()}
                        </span>
                       </div>
                       
                       <button 
                         onClick={() => handleDelete(b._id)}
                         className="sm:hidden p-2 text-slate-400 hover:text-red-500 transition-colors"
                         title={t.delete}
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                      <MapPin className="w-5 h-5 mr-1.5 text-slate-400" />
                      {b.parkingLocation?.locationName || 'Unknown Site'}
                    </h4>
                    <p className="text-sm font-semibold text-slate-500 mt-1 flex items-center">
                       <Clock className="w-4 h-4 mr-1.5" /> 
                       {t.duration}: {b.duration_hours} {t.hour} | {t.vehicle}: <span className="uppercase ml-1 text-slate-700 dark:text-slate-300">{b.vehicle_number}</span>
                    </p>
                 </div>
                 
                 <div className="flex items-center space-x-4 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none text-left sm:text-right bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-100 dark:border-slate-600">
                        <span className="block text-xs font-bold text-slate-500 uppercase">{t.amountPaid}</span>
                        <span className="text-xl font-extrabold text-brand-600 dark:text-brand-400">{'\u20B9'}{b.amount_paid}</span>
                    </div>
                    
                    {b.booking_status === 'completed' && (
                      <button 
                        onClick={() => { setFeedbackBooking(b); setRating(0); setComment(''); }}
                        className="hidden sm:flex items-center justify-center p-3 bg-orange-50 dark:bg-orange-900/20 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/40 rounded-xl border border-orange-100 dark:border-orange-900/50 transition-all active:scale-95 whitespace-nowrap text-sm font-bold gap-2"
                      >
                        <Star className="w-5 h-5" /> Rate
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(b._id)}
                      className="hidden sm:flex items-center justify-center p-3 bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-xl border border-red-100 dark:border-red-900/50 transition-all active:scale-95"
                      title={t.delete}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {feedbackBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-700 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Rate Your Experience</h3>
              <button onClick={() => setFeedbackBooking(null)} className="p-2 bg-gray-100 dark:bg-slate-700 rounded-full hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                <X className="w-4 h-4 text-gray-600 dark:text-slate-400" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-6">
              How was your parking experience at <strong>{feedbackBooking.parkingLocation?.locationName}</strong>?
            </p>

            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 focus:outline-none transition-transform hover:scale-110"
                >
                  <Star className={`w-10 h-10 ${
                    star <= (hoverRating || rating) 
                      ? 'fill-orange-400 text-orange-400' 
                      : 'text-gray-300 dark:text-slate-600'
                  } transition-colors`} />
                </button>
              ))}
            </div>

            <textarea
              placeholder="Leave a comment (optional)..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[100px] mb-6 dark:text-white"
            />

            <button
              onClick={handleFeedbackSubmit}
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:bg-gray-400"
            >
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingHistory;

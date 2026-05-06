import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Mail, MessageSquare, Shield, HelpCircle, ChevronRight, ExternalLink, X, FileText, Trash2, Loader2, ShieldCheck, Bot } from 'lucide-react';
import api from '../lib/api';
import useAuth from '../hooks/useAuth';
const translations = {
  en: {
    dashboard: "Dashboard",
    bookingHistory: "Booking History",
    profile: "Profile",
    chatbot: "AI Assistant",
    logout: "Logout",
    adminConsole: "Admin Console",
    helpTitle: "Help & Support",
    helpSubtitle: "We're here to assist you 24/7",
    customerCare: "Customer Care",
    callUs: "Call us directly",
    emailUs: "Send an email",
    chatWithUs: "Chat with AI",
    faqs: "Frequently Asked Questions",
    howToBook: "How to book a parking slot?",
    howToBookAns: "Navigate to the Dashboard, enter your destination in the search bar, select a nearby spot on the map, and click 'Book Now'.",
    paymentIssues: "Issues with payment?",
    paymentIssuesAns: "If your payment fails, check your balance or try a different payment method. You can retry booking anytime.",
    cancelBooking: "How to cancel a booking?",
    cancelBookingAns: "Go to your Profile -> Settings -> Cancel Booking. Select your active booking and provide a reason to cancel.",
    refundPolicy: "Refund Policy",
    termsOfService: "Terms of Service",
    privacyPolicy: "Privacy Policy",
    visitHelpCenter: "Visit Full Help Center"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    bookingHistory: "बुकिंग इतिहास",
    profile: "प्रोफ़ाइल",
    chatbot: "AI सहायक",
    logout: "लॉगआउट",
    adminConsole: "एडमिन कंसोल",
    helpTitle: "सहायता और समर्थन",
    helpSubtitle: "हम आपकी सहायता के लिए 24/7 यहां हैं",
    customerCare: "कस्टमर केयर",
    callUs: "हमें सीधे कॉल करें",
    emailUs: "ईमेल भेजें",
    chatWithUs: "AI के साथ चैट करें",
    faqs: "अक्सर पूछे जाने वाले प्रश्न",
    howToBook: "पार्किंग स्लॉट कैसे बुक करें?",
    paymentIssues: "भुगतान में समस्या?",
    cancelBooking: "बुकिंग कैसे रद्द करें?",
    refundPolicy: "वापसी नीति",
    termsOfService: "सेवा की शर्तें",
    privacyPolicy: "गोपनीयता नीति",
    visitHelpCenter: "पूर्ण सहायता केंद्र पर जाएं"
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    bookingHistory: "बुकिंग इतिहास",
    profile: "प्रोफाइल",
    chatbot: "AI सहाय्यक",
    logout: "लॉगआउट",
    adminConsole: "प्रशासन कन्सोल",
    helpTitle: "मदत आणि समर्थन",
    helpSubtitle: "आम्ही तुमच्या मदतीसाठी 24/7 येथे आहोत",
    customerCare: "कस्टमर केअर",
    callUs: "आम्हाला थेट कॉल करा",
    emailUs: "ईमेल पाठवा",
    chatWithUs: "AI सह चॅट करा",
    faqs: "सतत विचारले जाणारे प्रश्न",
    howToBook: "पार्किंग स्लॉट कसा बुक करायचा?",
    paymentIssues: "पेमेंटमध्ये समस्या?",
    cancelBooking: "बुकिंग कशी रद्द करायची?",
    refundPolicy: "परतावा धोरण",
    termsOfService: "सेवा अटी",
    privacyPolicy: "गोपनीयता धोरण",
    visitHelpCenter: "पूर्ण मदत केंद्राला भेट द्या"
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    bookingHistory: "முன்பதிவு வரலாறு",
    profile: "சுயவிவரம்",
    chatbot: "AI உதவியாளர்",
    logout: "வெளியேறு",
    adminConsole: "நிர்வாகி கன்சோல்",
    helpTitle: "உதவி மற்றும் ஆதரவு",
    helpSubtitle: "உங்களுக்கு உதவ நாங்கள் 24/7 இங்கே இருக்கிறோம்",
    customerCare: "வாடிக்கையாளர் சேவை",
    callUs: "எங்களை நேரடியாக அழைக்கவும்",
    emailUs: "மின்னஞ்சல் அனுப்பவும்",
    chatWithUs: "AI உடன் அரட்டையடிக்கவும்",
    faqs: "அடிக்கடி கேட்கப்படும் கேள்விகள்",
    howToBook: "பார்க்கிங் இடத்தை எவ்வாறு பதிவு செய்வது?",
    paymentIssues: "பணம் செலுத்துவதில் சிக்கலா?",
    cancelBooking: "முன்பதிவை எவ்வாறு ரத்து செய்வது?",
    refundPolicy: "பணம் திரும்பப்பெறும் கொள்கை",
    termsOfService: "சேவை விதிமுறைகள்",
    privacyPolicy: "தனியுரிமைக் கொள்கை",
    visitHelpCenter: "முழு உதவி மையத்தைப் பார்வையிடவும்"
  },
  bn: {
    dashboard: "ட্যাশবোর্ড",
    bookingHistory: "বুকিং ইতিহাস",
    profile: "প্রোফাইল",
    chatbot: "AI সহকারী",
    logout: "লগআউট",
    adminConsole: "অ্যাডমিন কনসোল",
    helpTitle: "সহায়তা এবং সমর্থন",
    helpSubtitle: "আমরা আপনার সহায়তার জন্য ২৪/৭ এখানে আছি",
    customerCare: "কাস্টমার কেয়ার",
    callUs: "আমাদের সরাসরি কল করুন",
    emailUs: "ইমেল পাঠান",
    chatWithUs: "AI-এর সাথে চ্যাট করুন",
    faqs: "প্রায়শই জিজ্ঞাসিত প্রশ্নাবলী",
    howToBook: "কিভাবে পার্কিং স্লট বুক করবেন?",
    paymentIssues: "পেমেন্টে সমস্যা?",
    cancelBooking: "কিভাবে বুকিং বাতিল করবেন?",
    refundPolicy: "রিফান্ড পলিসি",
    termsOfService: "পরিষেবার শর্তাবলী",
    privacyPolicy: "গোপনীয়তা নীতি",
    visitHelpCenter: "সম্পূর্ণ সহায়তা কেন্দ্রে যান"
  },
  te: {
    dashboard: "డ్యాష్‌బోర్డ్",
    bookingHistory: "బుకింగ్ చరిత్ర",
    profile: "ప్రొఫైల్",
    chatbot: "AI సహాయకుడు",
    logout: "లాగ్ అవుట్",
    adminConsole: "అడ్మిన్ కన్సోల్",
    helpTitle: "సహాయం & మద్దతు",
    helpSubtitle: "మీకు సహాయం చేయడానికి మేము 24/7 ఇక్కడ ఉన్నాము",
    customerCare: "కస్టమర్ కేర్",
    callUs: "మాకు నేరుగా కాల్ చేయండి",
    emailUs: "ఈమెయిల్ పంపండి",
    chatWithUs: "AI తో చాట్ చేయండి",
    faqs: "తరచుగా అడిగే ప్రశ్నలు",
    howToBook: "పార్కింగ్ స్లాట్‌ను ఎలా బుక్ చేయాలి?",
    paymentIssues: "చెల్లింపు సమస్యలా?",
    cancelBooking: "బుకింగ్‌ను ఎలా రద్దు చేయాలి?",
    refundPolicy: "రీఫండ్ విధానం",
    termsOfService: "సేవా నిబంధనలు",
    privacyPolicy: "గోప్యతా విధానం",
    visitHelpCenter: "పూర్తి సహాయ కేంద్రాన్ని సందర్శించండి"
  }
};

const HelpSupport = () => {
  const [lang] = useState(() => localStorage.getItem('lang') || 'en');
  const t = translations[lang] || translations['en'];
  const [openFaq, setOpenFaq] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);
  const { user } = useAuth();

  // Persist user questions in localStorage per user so they survive page refreshes
  const storageKey = user?._id ? `userFAQs_${user._id}` : 'userFAQs_guest';

  const [userQuestions, setUserQuestions] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync to localStorage whenever questions change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(userQuestions));
    } catch {}
  }, [userQuestions, storageKey]);

  const [communityFaqs, setCommunityFaqs] = useState([]);

  // Load all admin-answered questions to show in the public FAQ list
  useEffect(() => {
    const loadCommunityFaqs = async () => {
      try {
        // Use ai/faq with a GET approach — but that route is POST only
        // Instead we load from a public endpoint; for now we poll admin faqs
        // but since there's no public GET, we use the admin route if admin, else skip
        // Actually we'll add a public GET route below — for now load on best effort
        const res = await api.get('/api/ai/faqs-public');
        if (res.data.success) setCommunityFaqs(res.data.data || []);
      } catch (e) {
        // silently fail — public FAQ load is non-critical
      }
    };
    loadCommunityFaqs();
  }, []);

  const policyContent = {
    [t.refundPolicy]: {
      title: "Refund Policy",
      content: [
        "Refund allowed within 24 hours of booking",
        "No refund after slot usage",
        "Refund processed in 5–7 days"
      ]
    },
    [t.termsOfService]: {
      title: "Terms of Service",
      content: [
        "Users must provide accurate information",
        "No misuse of booking system",
        "Platform not responsible for external issues"
      ]
    },
    [t.privacyPolicy]: {
      title: "Privacy Policy",
      content: [
        "User data is secure and encrypted",
        "No data sharing with third parties",
        "Only used for service improvement"
      ]
    }
  };

  const contactOptions = [
    {
      title: t.callUs,
      value: "+91 1800-PARK-SMART",
      icon: Phone,
      color: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
    },
    {
      title: t.emailUs,
      value: "support@parksmart.com",
      icon: Mail,
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400"
    },
    {
      title: t.chatWithUs,
      value: "Available 24/7",
      icon: MessageSquare,
      color: "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"
    }
  ];

  return (
    <div className="flex h-screen bg-transparent font-sans overflow-hidden window-border-highlight relative">
      <AnimatePresence>
        {activePolicy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-slate-700/50"
            >
              <button 
                onClick={() => setActivePolicy(null)} 
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-700/50 rounded-full transition-colors"
                aria-label="Close"
              >
                 <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <FileText className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {policyContent[activePolicy]?.title}
                </h3>
              </div>
              
              <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                <ul className="space-y-3">
                  {policyContent[activePolicy]?.content.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-600 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-500 mt-2 flex-shrink-0"></span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mt-8">
                <button 
                  onClick={() => setActivePolicy(null)}
                  className="w-full py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl font-bold transition-all shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <Sidebar t={t} />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col items-center">
        <div className="w-full max-w-5xl">
        <header className="mb-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight heading-modern">{t.helpTitle}</h2>
            <p className="text-slate-500 font-medium mt-1">{t.helpSubtitle}</p>
          </motion.div>
        </header>

        <div className="max-w-5xl space-y-8">
          {/* Contact Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactOptions.map((opt, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex flex-col items-center text-center group hover:shadow-md transition-all"
              >
                <div className={`p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform ${opt.color}`}>
                  <opt.icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">{opt.title}</h3>
                <p className="text-lg font-extrabold text-slate-900 dark:text-white">{opt.value}</p>
              </motion.div>
            ))}
          </div>

          {/* FAQs Section */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700/50">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-[#3b5bdb]" />
              {t.faqs}
            </h3>

            {/* Ask Question Form */}
            <form 
              onSubmit={async (e) => { 
                e.preventDefault(); 
                const formData = new FormData(e.target);
                const questionText = formData.get('question');
                if (!questionText.trim()) return;

                const submitBtn = e.target.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.disabled = true;

                const newId = Date.now();
                setUserQuestions(prev => [
                  { id: newId, q: questionText, a: '', isLoading: true, answeredByAdmin: false },
                  ...prev
                ]);
                e.target.reset();

                try {
                  const res = await api.post('/api/ai/faq', { question: questionText, userName: user?.name || 'User' });
                  if (res.data.success) {
                    setUserQuestions(prev => prev.map(q => 
                      q.id === newId ? { ...q, a: res.data.answer, isLoading: false, answeredByAdmin: res.data.answeredByAdmin || false } : q
                    ));
                    toast.success(res.data.cached && res.data.answeredByAdmin ? 'Admin has answered your question!' : 'AI has generated an answer!');
                    setOpenFaq(`user-${newId}`);
                  }
                } catch (error) {
                  setUserQuestions(prev => prev.map(q => 
                    q.id === newId ? { ...q, a: 'Sorry, the AI is momentarily unavailable.', isLoading: false } : q
                  ));
                  toast.error('Failed to get an answer.');
                } finally {
                  if (submitBtn) submitBtn.disabled = false;
                }
              }} 
              className="mb-8 flex flex-col sm:flex-row gap-3"
            >
              <input 
                type="text" 
                name="question"
                placeholder="Can't find an answer? Ask a question..." 
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b5bdb]/50 dark:focus:ring-blue-400/50 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all font-medium"
                required
              />
              <button 
                type="submit" 
                className="px-6 py-3 bg-[#3b5bdb] hover:bg-[#364fc7] text-white font-bold rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap"
              >
                Ask Question
              </button>
            </form>

            <div className="space-y-4">
              {/* Dynamically Rendered User Questions */}
              {userQuestions.map((faq) => (
                <div key={faq.id} className={`rounded-2xl overflow-hidden border ${
                  faq.answeredByAdmin
                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-700/50'
                    : 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/50'
                }`}>
                  <div className={`flex px-4 py-2 justify-between items-center border-b ${
                    faq.answeredByAdmin
                      ? 'bg-emerald-100/50 dark:bg-emerald-800/30 border-emerald-100 dark:border-emerald-700/50'
                      : 'bg-blue-100/50 dark:bg-blue-800/30 border-blue-100 dark:border-blue-700/50'
                  }`}>
                     <div className="flex items-center gap-2">
                       <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Your Question</span>
                       {faq.answeredByAdmin && (
                         <span className="flex items-center gap-1 text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">
                           <ShieldCheck className="w-3 h-3" /> Admin Replied
                         </span>
                       )}
                       {!faq.answeredByAdmin && !faq.isLoading && (
                         <span className="flex items-center gap-1 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-semibold">
                           <Bot className="w-3 h-3" /> AI Answer
                         </span>
                       )}
                     </div>
                     <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setUserQuestions(prev => prev.filter(q => q.id !== faq.id));
                          toast.info('Question removed.');
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Delete question"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                  <button 
                    onClick={() => setOpenFaq(`user-${faq.id}`)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-100/50 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-bold text-left">{faq.q}</span>
                    <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:text-[#3b5bdb] transition-all flex-shrink-0 ${openFaq === `user-${faq.id}` ? 'rotate-90 text-[#3b5bdb]' : ''}`} />
                  </button>
                  {openFaq === `user-${faq.id}` && (
                    <div className="p-4 pt-0 text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                      {faq.isLoading ? (
                        <span className="flex items-center gap-2 text-brand-500">
                          <Loader2 className="w-4 h-4 animate-spin" /> Thinking...
                        </span>
                      ) : (
                        <p>{faq.a}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Static FAQs */}
              {[
                { q: t.howToBook, a: t.howToBookAns || translations['en'].howToBookAns },
                { q: t.paymentIssues, a: t.paymentIssuesAns || translations['en'].paymentIssuesAns },
                { q: t.cancelBooking, a: t.cancelBookingAns || translations['en'].cancelBookingAns }
              ].map((faq, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700/50">
                  <button 
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors group"
                  >
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{faq.q}</span>
                    <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:text-brand-500 transition-all ${openFaq === idx ? 'rotate-90 text-brand-500' : ''}`} />
                  </button>
                  {openFaq === idx && (
                    <div className="p-4 pt-0 text-slate-500 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}

              {/* Community Q&A — Admin-answered questions from other users */}
              {communityFaqs.length > 0 && (
                <>
                  <div className="flex items-center gap-2 mt-4 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Answered by Admin</span>
                  </div>
                  {communityFaqs.map((faq, idx) => (
                    <div key={faq._id || idx} className="bg-emerald-50/50 dark:bg-emerald-900/10 rounded-2xl overflow-hidden border border-emerald-100 dark:border-emerald-700/40">
                      <button
                        onClick={() => setOpenFaq(`community-${idx}`)}
                        className="w-full flex items-center justify-between p-4 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors group"
                      >
                        <span className="text-slate-700 dark:text-slate-300 font-bold text-left">{faq.question}</span>
                        <ChevronRight className={`w-5 h-5 text-slate-400 group-hover:text-emerald-500 transition-all flex-shrink-0 ${openFaq === `community-${idx}` ? 'rotate-90 text-emerald-500' : ''}`} />
                      </button>
                      {openFaq === `community-${idx}` && (
                        <div className="p-4 pt-0 text-slate-500 dark:text-slate-400 text-sm leading-relaxed border-t border-emerald-100 dark:border-emerald-700/40">
                          <p className="flex items-start gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
          
          {/* Legal/Policies Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-700/50">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Policies
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {[t.refundPolicy, t.termsOfService, t.privacyPolicy].map((p, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setActivePolicy(p)}
                    className="flex items-center gap-2 text-slate-500 hover:text-blue-500 hover:underline transition-all duration-300 text-sm font-medium w-max cursor-pointer decoration-2 underline-offset-4"
                  >
                    <ExternalLink className="w-4 h-4" /> {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-brand-500 to-indigo-600 rounded-3xl p-8 text-white flex flex-col justify-center items-center text-center">
              <h3 className="text-2xl font-black mb-4">Still need help?</h3>
              <p className="text-white/80 mb-6 text-sm">Our team is available round the clock to ensure your parking experience is perfect.</p>
              <button className="px-8 py-3 bg-white text-brand-600 font-bold rounded-2xl shadow-lg hover:bg-slate-50 transition-all active:scale-95">
                {t.visitHelpCenter}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupport;

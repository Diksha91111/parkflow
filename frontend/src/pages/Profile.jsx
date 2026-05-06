import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import useAuth from '../hooks/useAuth';
import { User, Mail, ShieldCheck, MoreVertical, HelpCircle, CreditCard, CheckCircle2, LogOut, Settings, X, Zap, Star, Shield, Phone, MapPin, History, Search, Sun, Moon, Trash2, ChevronDown, ChevronUp, Loader2, Bot } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

const translations = {
  en: {
    dashboard: "Dashboard",
    bookingHistory: "Booking History",
    profile: "Profile",
    chatbot: "AI Assistant",
    logout: "Logout",
    adminConsole: "Admin Console",
    profileTitle: "Your Profile",
    profileSubtitle: "Manage your personal information and settings",
    verifiedAccount: "Verified Account",
    emailAddress: "Email Address",
    accountRole: "Account Role",
    subscription: "Subscription",
    help: "Help & Support",
    settings: "Settings",
    activePlan: "Active Plan",
    freePlan: "Free Basic",
    premiumPlan: "Premium Pro",
    upgrade: "Upgrade Now",
    managePlan: "Manage Subscription",
    helpCenter: "Visit Help Center",
    contactSupport: "Contact Support",
    editProfile: "Edit Profile",
    privacySettings: "Privacy Settings",
    subscriptionOffers: "Subscription Plans & Offers",
    perMonth: "per month",
    mostPopular: "Most Popular",
    selectPlan: "Select Plan",
    features: "Included Features",
    unlimitedParking: "Unlimited parking searches",
    prioritySupport: "Priority customer support",
    exclusiveOffers: "Exclusive local parking offers",
    advancedAnalytics: "Advanced parking analytics",
    cancelAnytime: "Cancel anytime",
    savedAddresses: "Saved Addresses",
    recentBooking: "Recent Booking",
    noRecentSearches: "No recent searches found",
    noSavedAddresses: "No saved addresses found",
    phoneNumber: "Phone Number",
    addressDetails: "Address Details",
    fullName: "Full Name",
    flatNo: "Flat/House No",
    street: "Street/Locality",
    city: "City",
    state: "State"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    bookingHistory: "बुकिंग इतिहास",
    profile: "प्रोफ़ाइल",
    chatbot: "AI सहायक",
    logout: "लॉगआउट",
    adminConsole: "एडमिन कंसोल",
    profileTitle: "आपकी प्रोफ़ाइल",
    profileSubtitle: "अपनी व्यक्तिगत जानकारी और सेटिंग्स प्रबंधित करें",
    verifiedAccount: "सत्यापित खाता",
    emailAddress: "ईमेल पता",
    accountRole: "खाता भूमिका",
    subscription: "सदस्यता",
    help: "सहायता और समर्थन",
    settings: "सेटिंग्स",
    activePlan: "सक्रिय योजना",
    freePlan: "मुफ्त बेसिक",
    premiumPlan: "प्रीमियम प्रो",
    upgrade: "अभी अपग्रेड करें",
    managePlan: "सदस्यता प्रबंधित करें",
    helpCenter: "सहायता केंद्र पर जाएं",
    contactSupport: "सहायता से संपर्क करें",
    editProfile: "प्रोफ़ाइल संपादित करें",
    privacySettings: "गोपनीयता सेटिंग्स",
    subscriptionOffers: "सदस्यता योजनाएं और ऑफ़र",
    perMonth: "प्रति माह",
    mostPopular: "सबसे लोकप्रिय",
    selectPlan: "योजना चुनें",
    features: "शामिल विशेषताएं",
    unlimitedParking: "असीमित पार्किंग खोज",
    prioritySupport: "प्राथमिकता ग्राहक सहायता",
    exclusiveOffers: "विशेष स्थानीय पार्किंग ऑफ़र",
    advancedAnalytics: "उन्नत पार्किंग विश्लेषण",
    cancelAnytime: "किसी भी समय रद्द करें",
    savedAddresses: "सहेजे गए पते",
    recentBooking: "हाल की बुकिंग",
    noRecentSearches: "कोई हालिया खोज नहीं मिली",
    noSavedAddresses: "कोई सहेजे गए पते नहीं मिले",
    phoneNumber: "फ़ोन नंबर",
    addressDetails: "पते का विवरण",
    fullName: "पूरा नाम",
    flatNo: "फ्लैट/हाउस नंबर",
    street: "सड़क/इलाका",
    city: "शहर",
    state: "राज्य"
  },
  mr: {
    dashboard: "डॅशबोर्ड",
    bookingHistory: "बुकिंग इतिहास",
    profile: "प्रोफाइल",
    chatbot: "AI सहाय्यक",
    logout: "लॉगआउट",
    adminConsole: "प्रशासन कन्सोल",
    profileTitle: "तुमची प्रोफाइल",
    profileSubtitle: "तुमची वैयक्तिक माहिती आणि सेटिंग्ज व्यवस्थापित करा",
    verifiedAccount: "सत्यापित खाते",
    emailAddress: "ईमेल पत्ता",
    accountRole: "खाते भूमिका",
    subscription: "सदस्यता",
    help: "मदत आणि समर्थन",
    settings: "सेटिंग्ज",
    activePlan: "सक्रिय योजना",
    freePlan: "मोफत बेसिक",
    premiumPlan: "प्रीमियम प्रो",
    upgrade: "आता अपग्रेड करा",
    managePlan: "सदस्यता व्यवस्थापित करा",
    helpCenter: "मदत केंद्राला भेट द्या",
    contactSupport: "समर्थनाशी संपर्क साधा",
    editProfile: "प्रोफाइल संपादित करा",
    privacySettings: "गोपनीयता सेटिंग्ज",
    subscriptionOffers: "सदस्यता योजना आणि ऑफर्स",
    perMonth: "प्रति महिना",
    mostPopular: "सर्वात लोकप्रिय",
    selectPlan: "योजना निवडा",
    features: "समाविष्ट वैशिष्ट्ये",
    unlimitedParking: "अमर्यादित पार्किंग शोध",
    prioritySupport: "प्राधान्य ग्राहक समर्थन",
    exclusiveOffers: "विशेष स्थानिक पार्किंग ऑफर्स",
    advancedAnalytics: "प्रगत पार्किंग विश्लेषण",
    cancelAnytime: "कधीही रद्द करा",
    savedAddresses: "जतन केलेले पत्ते",
    recentBooking: "अलीकडील बुकिंग",
    noRecentSearches: "कोणतेही अलीकडील शोध आढळले नाहीत",
    noSavedAddresses: "कोणतेही जतन केलेले पत्ते आढळले नाहीत",
    phoneNumber: "फोन नंबर",
    addressDetails: "पत्त्याचा तपशील",
    fullName: "पूर्ण नाव",
    flatNo: "फ्लॅट/हाऊस क्र.",
    street: "रस्ता/परिसर",
    city: "शहर",
    state: "राज्य"
  },
  ta: {
    dashboard: "டாஷ்போர்டு",
    bookingHistory: "முன்பதிவு வரலாறு",
    profile: "சுயவிவரம்",
    chatbot: "AI உதவியாளர்",
    logout: "வெளியேறு",
    adminConsole: "நிர்வாகி கன்சோல்",
    profileTitle: "உங்கள் சுயவிவரம்",
    profileSubtitle: "உங்கள் தனிப்பட்ட தகவல் மற்றும் அமைப்புகளை நிர்வகிக்கவும்",
    verifiedAccount: "சரிபார்க்கப்பட்ட கணக்கு",
    emailAddress: "மின்னஞ்சல் முகவரி",
    accountRole: "கணக்கு பங்கு",
    subscription: "சந்தா",
    help: "உதவி மற்றும் ஆதரவு",
    settings: "அமைப்புகள்",
    activePlan: "செயலில் உள்ள திட்டம்",
    freePlan: "இலவச அடிப்படை",
    premiumPlan: "பிரீமியம் புரோ",
    upgrade: "இப்போதே மேம்படுத்தவும்",
    managePlan: "சந்தாவை நிர்வகிக்கவும்",
    helpCenter: "உதவி மையத்தைப் பார்வையிடவும்",
    contactSupport: "ஆதரவைத் தொடர்பு கொள்ளவும்",
    editProfile: "சுயவிவரத்தைத் திருத்து",
    privacySettings: "தனியுரிமை அமைப்புகள்",
    subscriptionOffers: "சந்தா திட்டங்கள் மற்றும் சலுகைகள்",
    perMonth: "மாதத்திற்கு",
    mostPopular: "மிகவும் பிரபலமானது",
    selectPlan: "திட்டத்தைத் தேர்ந்தெடுக்கவும்",
    features: "உள்ளடக்கிய அம்சங்கள்",
    unlimitedParking: "வரம்பற்ற பார்க்கிங் தேடல்கள்",
    prioritySupport: "முன்னுரிமை வாடிக்கையாளர் ஆதரவு",
    exclusiveOffers: "பிரத்யேக உள்ளூர் பார்க்கிங் சலுகைகள்",
    advancedAnalytics: "மேம்பட்ட பார்க்கிங் பகுப்பாய்வு",
    cancelAnytime: "எப்போது வேண்டுமானாலும் ரத்து செய்யலாம்",
    savedAddresses: "சேமிக்கப்பட்ட முகவரிகள்",
    recentBooking: "சமீபத்திய முன்பதிவு",
    noRecentSearches: "சமீபத்திய தேடல்கள் எதுவும் இல்லை",
    noSavedAddresses: "சேமிக்கப்பட்ட முகவரிகள் எதுவும் இல்லை",
    phoneNumber: "தொலைபேசி எண்",
    addressDetails: "முகவரி விவரங்கள்",
    fullName: "முழு பெயர்",
    flatNo: "பிளாட்/வீட்டு எண்",
    street: "தெரு/பகுதி",
    city: "நகரம்",
    state: "மாநிலம்"
  },
  bn: {
    dashboard: "ড্যাশবোর্ড",
    bookingHistory: "বুকিং ইতিহাস",
    profile: "প্রোফাইল",
    chatbot: "AI সহকারী",
    logout: "লগআউট",
    adminConsole: "অ্যাডমিন কনসোল",
    profileTitle: "আপনার প্রোফাইল",
    profileSubtitle: "আপনার ব্যক্তিগত তথ্য এবং সেটিংস পরিচালনা করুন",
    verifiedAccount: "যাচাইকৃত অ্যাকাউন্ট",
    emailAddress: "ইমেল ঠিকানা",
    accountRole: "অ্যাকাউন্ট ভূমিকা",
    subscription: "সাবস্ক্রিপশন",
    help: "সহায়তা এবং সমর্থন",
    settings: "সেটিংস",
    activePlan: "সক্রিয় পরিকল্পনা",
    freePlan: "ফ্রি বেসিক",
    premiumPlan: "প্রিমিয়াম প্রো",
    upgrade: "এখনই আপগ্রেড করুন",
    managePlan: "সাবস্ক্রিপশন পরিচালনা করুন",
    helpCenter: "সহায়তা কেন্দ্রে যান",
    contactSupport: "সহায়তার সাথে যোগাযোগ করুন",
    editProfile: "প্রোফাইল সম্পাদনা করুন",
    privacySettings: "গোপনীয়তা সেটিংস",
    subscriptionOffers: "সাবস্ক্রিপশন প্ল্যান এবং অফার",
    perMonth: "প্রতি মাসে",
    mostPopular: "সবচেয়ে জনপ্রিয়",
    selectPlan: "প্ল্যান নির্বাচন করুন",
    features: "অন্তর্ভুক্ত বৈশিষ্ট্য",
    unlimitedParking: "সীমাহীন পার্কিং অনুসন্ধান",
    prioritySupport: "অগ্রাধিকার গ্রাহক সহায়তা",
    exclusiveOffers: "এক্সক্লুসিভ স্থানীয় পার্কিং অফার",
    advancedAnalytics: "উন্নত পার্কিং বিশ্লেষণ",
    cancelAnytime: "যেকোনো সময় বাতিল করুন",
    savedAddresses: "সংরক্ষিত ঠিকানা",
    recentBooking: "সাম্প্রতিক বুকিং",
    noRecentSearches: "কোনো সাম্প্রতিক অনুসন্ধান পাওয়া যায়নি",
    noSavedAddresses: "কোনো সংরক্ষিত ঠিকানা পাওয়া যায়নি",
    phoneNumber: "ফোন নম্বর",
    addressDetails: "ঠিকানার বিবরণ",
    fullName: "পুরো নাম",
    flatNo: "ফ্ল্যাট/বাড়ি নং",
    street: "রাস্তা/এলাকা",
    city: "শহর",
    state: "রাজ্য"
  },
  te: {
    dashboard: "డ్యాష్‌బోర్డ్",
    bookingHistory: "బుకింగ్ చరిత్ర",
    profile: "ప్రొఫైల్",
    chatbot: "AI సహాయకుడు",
    logout: "లాగ్ అవుట్",
    adminConsole: "అడ్మిన్ కన్సోల్",
    profileTitle: "మీ ప్రొఫైల్",
    profileSubtitle: "మీ వ్యక్తిగత సమాచారం మరియు సెట్టింగులను నిర్వహించండి",
    verifiedAccount: "ధృవీకరించబడిన ఖాతా",
    emailAddress: "ఈమెయిల్ చిరునామా",
    accountRole: "ఖాతా పాత్ర",
    subscription: "సభ్యత్వం",
    help: "సహాయం & మద్దతు",
    settings: "సెట్టింగులు",
    activePlan: "క్రియాశీల ప్లాన్",
    freePlan: "ఉచిత బేసిక్",
    premiumPlan: "ప్రీమియం ప్రో",
    upgrade: "ఇప్పుడే అప్‌గ్రేడ్ చేయండి",
    managePlan: "సభ్యత్వాన్ని నిర్వహించండి",
    helpCenter: "సహాయ కేంద్రాన్ని సందర్శించండి",
    contactSupport: "మద్దతును సంప్రదించండి",
    editProfile: "ప్రొఫైల్ సవరించు",
    privacySettings: "గోప్యతా సెట్టింగులు",
    subscriptionOffers: "సభ్యత్వ ప్లాన్‌లు మరియు ఆఫర్లు",
    perMonth: "నెలకు",
    mostPopular: "అత్యంత ప్రజాదరణ పొందినవి",
    selectPlan: "ప్లాన్ ఎంచుకోండి",
    features: "ఫీచర్లు",
    unlimitedParking: "అపరిమిత పార్కింగ్ శోధనలు",
    prioritySupport: "ప్రాధాన్యత కస్టమర్ మద్దతు",
    exclusiveOffers: "ప్రత్యేక స్థానిక పార్కింగ్ ఆఫర్లు",
    advancedAnalytics: "అధునాతన పార్కింగ్ విశ్లేషణ",
    cancelAnytime: "ఎప్పుడైనా రద్దు చేసుకోవచ్చు",
    savedAddresses: "సేవ్ చేసిన చిరునామాలు",
    recentBooking: "ఇటీవలి బుకింగ్",
    noRecentSearches: "ఇటీవలి శోధనలేవీ లేవు",
    noSavedAddresses: "సేవ్ చేసిన చిరునామాలు లేవు",
    phoneNumber: "ఫోన్ నంబర్",
    addressDetails: "చిరునామా వివరాలు",
    fullName: "పూర్తి పేరు",
    flatNo: "ఫ్లాట్/ఇంటి నం",
    street: "వీధి/ప్రాంతం",
    city: "నగరం",
    state: "రాష్ట్రం"
  }
};

const SubscriptionModal = ({ isOpen, onClose, t }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      ></motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">{t.subscriptionOffers}</h2>
            <p className="text-slate-500 font-medium">{t.upgrade} to get exclusive benefits and priority access</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <div className="p-8 rounded-[24px] border-2 border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t.freePlan}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900 dark:text-white">₹0</span>
                  <span className="text-slate-500 text-sm font-medium">{t.perMonth}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-slate-400" /> Standard parking search
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm opacity-50">
                  <X className="w-5 h-5" /> {t.prioritySupport}
                </li>
              </ul>

              <button 
                onClick={() => {
                  toast.success("Free Basic Plan activated!");
                  setTimeout(() => onClose(), 500);
                }}
                className="w-full py-4 bg-brand-50 hover:bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:hover:bg-brand-900/50 dark:text-brand-400 font-bold rounded-2xl transition-all active:scale-95 shadow-sm"
              >
                {t.selectPlan}
              </button>
            </div>

            {/* Premium Plan */}
            <div className="p-8 rounded-[24px] border-2 border-brand-500 bg-white dark:bg-slate-800 shadow-xl shadow-brand-500/10 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-brand-500 text-white px-4 py-1.5 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                {t.mostPopular}
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{t.premiumPlan}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-brand-600 dark:text-brand-400">₹199</span>
                  <span className="text-slate-500 text-sm font-medium">{t.perMonth}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10 flex-1">
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-500" /> {t.unlimitedParking}
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-500" /> {t.prioritySupport}
                </li>
                <li className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm">
                  <CheckCircle2 className="w-5 h-5 text-brand-500" /> {t.exclusiveOffers}
                </li>
              </ul>

              <button className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-brand-500/25">
                {t.selectPlan}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const EditProfileModal = ({ isOpen, onClose, user, t }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    mobile: user?.mobile || '',
    dateOfBirth: user?.dateOfBirth || '',
    gender: user?.gender || '',
    address: user?.address || ''
  });
  const [file, setFile] = useState(null);
  
  // Resolve image preview URL
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const API_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    return `${API_URL}${path}`;
  };

  const [imagePreview, setImagePreview] = useState(getImageUrl(user?.profilePicture));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('mobile', formData.mobile);
    data.append('dateOfBirth', formData.dateOfBirth);
    data.append('gender', formData.gender);
    if (user?.role === 'admin') {
      data.append('address', formData.address);
    }
    if (file) {
      data.append('profilePicture', file);
    }

    try {
       const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
       const res = await fetch(`${API_BASE}/api/auth/profile`, {
         method: 'PUT',
         headers: {
           'Authorization': `Bearer ${localStorage.getItem('token')}`
         },
         body: data
       });
       const result = await res.json();
       if (result.success) {
         localStorage.setItem('user', JSON.stringify(result.user));
         window.location.reload(); 
       } else {
         alert(result.message || 'Error updating profile');
       }
    } catch(err) {
      console.error(err);
      alert('Network error updating profile');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden pointer-events-auto">
        <div className="p-8">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
          
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Edit Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-700/50 rounded-full border-4 border-white dark:border-slate-800 shadow-lg overflow-hidden flex items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                     <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-2 bg-brand-500 text-white rounded-full cursor-pointer shadow-lg hover:bg-brand-600 transition-colors">
                  <User className="w-4 h-4" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" required />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Email <span className="text-[10px] text-slate-400 normal-case">(Read only)</span></label>
              <input type="email" value={user?.email || ''} readOnly className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-500 dark:text-slate-400 cursor-not-allowed outline-none" />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Mobile Number</label>
              <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 appearance-none">
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Admin Address</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={handleChange} 
                  rows="2"
                  placeholder="Enter administrative address"
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none"
                ></textarea>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} className="w-full py-4 mt-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all active:scale-95 shadow-lg shadow-brand-500/25">
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const SettingsModal = ({ isOpen, onClose, user, logout }) => {
  const [activeTab, setActiveTab] = useState('notifications');
  
  const [notifications, setNotifications] = useState({
    promos: user?.notificationSettings?.promos ?? true,
    social: user?.notificationSettings?.social ?? true,
    orders: user?.notificationSettings?.orders ?? true
  });
  
  const [activeBookings, setActiveBookings] = useState(() => {
    return JSON.parse(localStorage.getItem('bookings') || '[]').filter(b => b.booking_status === 'active' || b.booking_status === 'upcoming');
  });
  const [selectedBooking, setSelectedBooking] = useState('');
  const [cancelReason, setCancelReason] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Admin-specific states
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    allowNewRegistrations: true,
    autoApproveBookings: true,
    emailNotifications: true
  });
  const [parkingRates, setParkingRates] = useState({
    baseRate: 30,
    premiumRate: 60,
    evRate: 40
  });

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    setIsSubmitting(true);
    try {
      const data = new FormData();
      data.append('vehicleNumber', vehicleNumber);
      data.append('notificationSettings', JSON.stringify(notifications));

      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });
      const result = await res.json();
      if (result.success) {
        localStorage.setItem('user', JSON.stringify(result.user));
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (err) {
      toast.error('Network error saving settings');
    }
    setIsSubmitting(false);
  };

  const handleCancelBooking = () => {
    if (!selectedBooking || !cancelReason) {
      toast.error('Please select a booking and provide a reason');
      return;
    }
    const allBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const updatedBookings = allBookings.map(b => {
      if (b._id === selectedBooking) {
        return { ...b, booking_status: 'cancelled', cancel_reason: cancelReason, cancelledAt: new Date().toISOString() };
      }
      return b;
    });
    localStorage.setItem('bookings', JSON.stringify(updatedBookings));
    toast.success('Booking cancelled successfully');
    setActiveBookings(activeBookings.filter(b => b._id !== selectedBooking));
    setSelectedBooking('');
    setCancelReason('');
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteAccount = async () => {
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await res.json();
      if (result.success) {
        toast.success('Account deleted.');
        logout(); 
      } else {
        toast.error(result.message || 'Failed to delete account');
      }
    } catch (err) {
      toast.error('Network error deleting account');
    }
  };

  const isAdmin = user?.role === 'admin';

  const tabs = [
    { id: 'notifications', label: 'Notifications' },
    { id: 'cancel', label: 'Cancel Booking' },
    ...(isAdmin ? [
      { id: 'system', label: 'System Settings' },
      { id: 'rates', label: 'Parking Rates' }
    ] : []),
    { id: 'delete', label: 'Delete Account' }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl overflow-hidden pointer-events-auto flex flex-col md:flex-row h-[500px]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-1/3 bg-slate-50 dark:bg-slate-700/50 p-6 border-r border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-6">Settings</h2>
          <div className="flex flex-col gap-2">
            {tabs.map(t => (
              <button 
                key={t.id}
                onClick={() => {
                  setActiveTab(t.id);
                  // Refresh user questions every time admin clicks the questions tab
                  if (t.id === 'questions' && isAdmin) fetchUserQuestions();
                }}
                className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === t.id ? 'bg-brand-500 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="w-full md:w-2/3 p-8 flex flex-col overflow-y-auto relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors z-10">
            <X className="w-6 h-6" />
          </button>

          {activeTab === 'notifications' && (
            <div className="space-y-6 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { id: 'promos', label: 'Promos and Offers', desc: 'Receive updates on discounts' },
                  { id: 'social', label: 'Social Notification', desc: 'Alerts for community events' },
                  { id: 'orders', label: 'Order and Purchase', desc: 'Receipts and booking updates' }
                ].map(opt => (
                  <div key={opt.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                    <button 
                      onClick={() => setNotifications({...notifications, [opt.id]: !notifications[opt.id]})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifications[opt.id] ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications[opt.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-6">
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-2xl transition-all shadow-lg"
                >
                  {isSubmitting ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'cancel' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel Booking</h3>
              {activeBookings.length === 0 ? (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-center text-sm font-bold">
                  You have no active bookings to cancel.
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Select Booking</label>
                    <select 
                      value={selectedBooking} 
                      onChange={(e) => setSelectedBooking(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none appearance-none"
                    >
                      <option value="">-- Choose Booking --</option>
                      {activeBookings.map(b => (
                         <option key={b._id} value={b._id}>
                           {b.parkingLocation?.locationName || 'Unknown'} (₹{b.amount_paid})
                         </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Reason for Cancellation</label>
                    <select 
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none appearance-none"
                    >
                      <option value="">-- Select Reason --</option>
                      <option value="Changed plans">Changed plans</option>
                      <option value="Found another transport">Found another transport</option>
                      <option value="Booked by mistake">Booked by mistake</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <button 
                    onClick={handleCancelBooking}
                    className="w-full py-4 mt-auto bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl transition-all shadow-lg"
                  >
                    Confirm Cancellation
                  </button>
                </>
              )}
            </div>
          )}

          {activeTab === 'system' && isAdmin && (
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">System Settings</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage global system configurations. These settings affect all users.
              </p>
              
              <div className="space-y-4 flex-1">
                {[
                  { id: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Put site in maintenance mode' },
                  { id: 'allowNewRegistrations', label: 'New Registrations', desc: 'Allow new user signups' },
                  { id: 'autoApproveBookings', label: 'Auto-Approve Bookings', desc: 'Automatically confirm new bookings' },
                  { id: 'emailNotifications', label: 'Email Notifications', desc: 'Send system email alerts' }
                ].map(opt => (
                  <div key={opt.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{opt.label}</p>
                      <p className="text-xs text-slate-500">{opt.desc}</p>
                    </div>
                    <button 
                      onClick={() => setSystemSettings({...systemSettings, [opt.id]: !systemSettings[opt.id]})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${systemSettings[opt.id] ? 'bg-purple-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${systemSettings[opt.id] ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-6">
                <button 
                  onClick={() => {
                    localStorage.setItem('adminSystemSettings', JSON.stringify(systemSettings));
                    toast.success('System settings saved!');
                  }}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-2xl transition-all shadow-lg"
                >
                  {isSubmitting ? 'Saving...' : 'Save System Settings'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'rates' && isAdmin && (
            <div className="space-y-6 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                  <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Parking Rates</h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Configure default parking rates for different spot types.
              </p>
              
              <div className="space-y-4 flex-1">
                {[
                  { id: 'baseRate', label: 'Base Rate (Standard)', min: 10 },
                  { id: 'premiumRate', label: 'Premium Rate', min: 20 },
                  { id: 'evRate', label: 'EV Charging Rate', min: 15 }
                ].map(opt => (
                  <div key={opt.id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{opt.label}</label>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-900 dark:text-white font-bold">₹</span>
                      <input 
                        type="number" 
                        value={parkingRates[opt.id]}
                        min={opt.min}
                        onChange={(e) => setParkingRates({...parkingRates, [opt.id]: parseInt(e.target.value) || opt.min})}
                        className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <span className="text-sm text-slate-500">/hr</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-6">
                <button 
                  onClick={() => {
                    localStorage.setItem('adminParkingRates', JSON.stringify(parkingRates));
                    toast.success('Parking rates saved!');
                  }}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl transition-all shadow-lg"
                >
                  {isSubmitting ? 'Saving...' : 'Save Rates'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'delete' && (
            <div className="space-y-6 flex flex-col justify-center h-full text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-inner">
                 <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Delete Account</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm px-4">
                 Deleting your account is permanent. All your data, booking history, and preferences will be completely wiped.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mx-auto w-3/4 py-3 mt-4 bg-red-50 dark:bg-red-900/10 text-red-600 border border-red-200 dark:border-red-900/50 hover:bg-red-500 hover:text-white font-bold rounded-xl transition-all"
                >
                  I understand, delete my account
                </button>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 animate-fade-in text-center flex flex-col items-center">
                  <p className="text-red-600 dark:text-red-400 font-bold mb-4 text-sm">Are you absolutely sure?</p>
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleDeleteAccount}
                      className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl shadow-lg hover:bg-red-600 transition"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const Profile = () => {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState(authUser);
  const navigate = useNavigate();
  const [lang] = useState(() => localStorage.getItem('lang') || 'en');
  const t = translations[lang] || translations['en'];
  const [showMenu, setShowMenu] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedAddressForModal, setSelectedAddressForModal] = useState(null);
  const [selectedBookingForModal, setSelectedBookingForModal] = useState(null);
  


  // Update local user state when authUser changes
  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  // Get user-specific key for saved addresses
  const getUserAddressesKey = useCallback(() => {
    const userId = user?._id || user?.id || 'guest';
    return `userAddresses_${userId}`;
  }, [user]);

  // Load saved addresses from localStorage (user-specific)
  const [savedAddresses, setSavedAddresses] = useState(() => {
    const userId = authUser?._id || authUser?.id || 'guest';
    return JSON.parse(localStorage.getItem(`userAddresses_${userId}`) || '[]');
  });

  // Reload saved addresses when user changes
  useEffect(() => {
    const userId = user?._id || user?.id || 'guest';
    const addresses = JSON.parse(localStorage.getItem(`userAddresses_${userId}`) || '[]');
    setSavedAddresses(addresses);
  }, [user]);

  // Handle delete saved address
  const handleDeleteAddress = (indexToDelete) => {
    const updatedAddresses = savedAddresses.filter((_, idx) => idx !== indexToDelete);
    setSavedAddresses(updatedAddresses);
    const addressesKey = getUserAddressesKey();
    localStorage.setItem(addressesKey, JSON.stringify(updatedAddresses));
    toast.success('Address deleted successfully');
  };

  // Handle delete feedback
  const handleDeleteFeedback = async (feedbackId) => {
    try {
      const res = await api.delete(`/api/admin/feedback/${feedbackId}`);
      if (res.data.success) {
        setAdminFeedbacks(adminFeedbacks.filter(f => f._id !== feedbackId));
        toast.success('Feedback deleted successfully');
      }
    } catch (err) {
      toast.error('Failed to delete feedback');
    }
  };
  
  // Load recent bookings from localStorage (top 4)
  const [recentBookings, setRecentBookings] = useState(() => 
    JSON.parse(localStorage.getItem('bookings') || '[]').slice(0, 4)
  );

  const [adminFeedbacks, setAdminFeedbacks] = useState([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const res = await api.get('/api/bookings/my-bookings');
        if (res.data.success) {
          const bookings = res.data.data;
          setRecentBookings(bookings.slice(0, 4));
          localStorage.setItem('bookings', JSON.stringify(bookings));
        }
      } catch (err) {
        console.error("Failed to load profile bookings", err);
      }
    };
    fetchProfileData();

    if (user?.role === 'admin') {
      const fetchFeedbacks = async () => {
        try {
          const res = await api.get('/api/admin/feedback');
          if (res.data.success) {
            setAdminFeedbacks(res.data.data.slice(0, 5)); // Get latest 5
          }
        } catch (err) {
          console.error("Failed to load feedbacks", err);
        }
      };
      fetchFeedbacks();
    }
  }, [user?.role]);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleStorageChange = () => {
      const addressesKey = getUserAddressesKey();
      setSavedAddresses(JSON.parse(localStorage.getItem(addressesKey) || '[]'));
      setRecentBookings(JSON.parse(localStorage.getItem('bookings') || '[]').slice(0, 4));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [getUserAddressesKey]);

  return (
    <div className="flex h-screen bg-transparent font-sans overflow-hidden window-border-highlight">
      <Sidebar t={t} />
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {/* New Redesigned Header Box */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="relative bg-white dark:bg-[#0f172a] rounded-[32px] p-8 md:p-12 shadow-xl dark:shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800/50 animate-fade-in">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 blur-[120px] -mr-48 -mt-48 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] -ml-32 -mb-32 pointer-events-none"></div>

            {/* Profile Content */}
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                <div className="w-32 h-32 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center border-4 border-slate-100 dark:border-slate-700/30 shadow-inner group overflow-hidden">
                  {user?.profilePicture ? (
                    <img 
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${user.profilePicture}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-24 h-24 bg-brand-500/10 rounded-full flex items-center justify-center text-brand-500 dark:text-brand-400 group-hover:scale-110 transition-transform duration-500">
                      <User className="w-12 h-12" />
                    </div>
                  )}
                </div>
                
                <div className="text-center md:text-left">
                  <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">{user?.name || 'Pavithra Asokan'}</h2>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-brand-600 dark:text-brand-400 font-bold bg-brand-500/10 dark:bg-brand-400/10 px-4 py-1.5 rounded-full w-fit">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-widest">{t.verifiedAccount}</span>
                  </div>
                </div>

                <div className="md:ml-auto flex items-center gap-3">
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-all active:scale-95 shadow-sm dark:shadow-lg"
                    title="Toggle Theme"
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => setShowSubscription(true)}
                    className="p-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-all active:scale-95 shadow-sm dark:shadow-lg"
                    title={t.subscription}
                  >
                    <CreditCard className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => navigate('/help')}
                    className="p-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-all active:scale-95 shadow-sm dark:shadow-lg"
                    title={t.help}
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowMenu(!showMenu)}
                      className={`p-3 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-brand-400 rounded-2xl border border-slate-200 dark:border-slate-700/50 transition-all active:scale-95 shadow-sm dark:shadow-lg ${showMenu ? 'bg-slate-200 dark:bg-slate-700/50 text-brand-600 dark:text-brand-400 border-brand-500/30' : ''}`}
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showMenu && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)}></div>
                        <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[24px] shadow-2xl z-20 overflow-hidden p-1.5 animate-fade-in-up">
                          <button onClick={() => { setShowMenu(false); setShowEditProfileModal(true); }} className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all flex items-center gap-3 group">
                            <User className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-brand-500 dark:group-hover:text-brand-400" /> {t.editProfile}
                          </button>
                          <button onClick={() => { setShowMenu(false); setShowSettingsModal(true); }} className="w-full px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all flex items-center gap-3 group">
                            <Settings className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-brand-500 dark:group-hover:text-brand-400" /> {t.settings}
                          </button>
                          <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5 mx-2"></div>
                          <button 
                            onClick={logout}
                            className="w-full px-4 py-3 text-left text-sm font-semibold text-red-400 hover:bg-red-400/10 rounded-xl transition-all flex items-center gap-3"
                          >
                            <LogOut className="w-4 h-4" /> {t.logout}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-700/30 mb-10"></div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t.emailAddress}</label>
                  <div className="flex bg-slate-50 dark:bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700/40 items-center group hover:border-brand-500/30 dark:hover:border-brand-500/30 transition-colors">
                    <Mail className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-4 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-lg truncate">{user?.email || 'asokanpavithra91@gmail.com'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-1">{t.accountRole}</label>
                  <div className="flex bg-slate-50 dark:bg-slate-800/40 backdrop-blur-md p-5 rounded-2xl border border-slate-200 dark:border-slate-700/40 items-center group hover:border-brand-500/30 dark:hover:border-brand-500/30 transition-colors">
                    <Shield className="w-5 h-5 text-slate-400 dark:text-slate-500 mr-4 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" />
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-lg capitalize">{user?.role || 'User'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side by Side Content Layout */}
          <div className={`grid grid-cols-1 ${user?.role !== 'admin' ? 'xl:grid-cols-2' : ''} gap-8 mt-8 items-stretch`}>
            
            {/* Admin Exclusive View */}
            {user?.role === 'admin' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 content-start h-full">
                {/* Saved Addresses List */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-lg shadow-brand-500/5 border-2 border-slate-200 dark:border-slate-700/50 flex flex-col animate-slide-up">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.savedAddresses}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Click to view full details</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 flex-1 content-start max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {savedAddresses.length > 0 ? (
                      savedAddresses.map((addr, idx) => (
                        <div 
                          key={idx} 
                          className="p-5 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-600/50 hover:border-brand-500/30 transition-all group"
                        >
                          <div className="flex items-start gap-4">
                            <div 
                              onClick={() => setSelectedAddressForModal(addr)}
                              className="mt-1 p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-brand-500 transition-colors shadow-sm cursor-pointer"
                            >
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div 
                              onClick={() => setSelectedAddressForModal(addr)}
                              className="flex-1 min-w-0 cursor-pointer"
                            >
                              <p className="font-bold text-slate-900 dark:text-white truncate">{addr.name || 'Saved Location'}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {addr.address || `${addr.flatNo}, ${addr.street}, ${addr.city}, ${addr.state}`}
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAddress(idx);
                              }}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                              title="Delete address"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-700/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4 opacity-50" />
                        <p className="text-slate-500 dark:text-slate-400 font-medium">{t.noSavedAddresses}</p>
                        <p className="text-slate-400 text-sm mt-2">Add addresses from the Dashboard</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Feedback Feed */}
                <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-lg shadow-orange-500/5 border-2 border-slate-200 dark:border-slate-700/50 flex flex-col animate-slide-up" style={{ animationDelay: '0.1s' }}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-orange-500 dark:text-orange-400">
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Recent Feedback</h3>
                    </div>
                  </div>

                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[300px]">
                    {adminFeedbacks.length > 0 ? (
                       adminFeedbacks.map((f, i) => (
                         <div key={i} className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-600/50 hover:border-orange-500/30 transition-colors group">
                           <div className="flex items-start justify-between mb-2">
                             <div>
                               <p className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{f.userName || 'Anonymous'} <span className="font-normal text-slate-500 mx-1">•</span> <span className="text-slate-600 dark:text-slate-400 italic font-medium">{f.spotName}</span></p>
                               <span className="text-[10px] uppercase font-bold text-slate-400">{new Date(f.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'})}</span>
                             </div>
                             <div className="flex items-center gap-2">
                               <div className="flex items-center gap-1 text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-lg border border-orange-100 dark:border-orange-800/50">
                                 <Star className="w-3 h-3 fill-current" />
                                 <span className="font-black text-sm leading-none">{f.rating}</span>
                               </div>
                               <button
                                 onClick={() => handleDeleteFeedback(f._id)}
                                 className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                 title="Delete feedback"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                             </div>
                           </div>
                           {f.comment && <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700/50 italic shadow-sm block group-hover:shadow transition-shadow">"{f.comment}"</p>}
                         </div>
                       ))
                    ) : (
                       <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 h-full text-center">
                         <Star className="w-10 h-10 text-slate-300 dark:text-slate-600 mb-3 opacity-50" />
                         <p className="text-slate-500 font-semibold text-sm">No feedback received yet</p>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Saved Addresses Section (Users/Partners Only) */}
            {user?.role !== 'admin' && (
              <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-lg shadow-brand-500/5 border-2 border-brand-500/30 dark:border-brand-500/30 hover:border-brand-500/50 transition-colors flex flex-col h-full animate-slide-up">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-xl text-brand-600 dark:text-brand-400">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.savedAddresses}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-start">
                  {savedAddresses.length > 0 ? (
                    savedAddresses.map((addr, idx) => (
                      <div 
                        key={idx} 
                        className="p-5 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-600/50 hover:border-brand-500/30 transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          <div 
                            onClick={() => setSelectedAddressForModal(addr)}
                            className="mt-1 p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 group-hover:text-brand-500 transition-colors shadow-sm cursor-pointer"
                          >
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div 
                            onClick={() => setSelectedAddressForModal(addr)}
                            className="flex-1 min-w-0 cursor-pointer"
                          >
                            <p className="font-bold text-slate-900 dark:text-white truncate">{addr.name || 'Saved Location'}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {addr.address || `${addr.flatNo}, ${addr.street}, ${addr.city}, ${addr.state}`}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAddress(idx);
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                            title="Delete address"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-700/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <MapPin className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4 opacity-50" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">{t.noSavedAddresses}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Booking Section */}
            {user?.role !== 'admin' && (
              <div className="bg-white dark:bg-slate-800 rounded-[32px] p-8 shadow-lg shadow-emerald-500/5 border-2 border-emerald-500/30 dark:border-emerald-500/30 hover:border-emerald-500/50 transition-colors flex flex-col h-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl text-emerald-600 dark:text-emerald-400">
                    <History className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{t.recentBooking}</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 content-start">
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setSelectedBookingForModal(booking)}
                        className="p-5 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-600/50 hover:border-emerald-500/30 transition-all group cursor-pointer active:scale-95"
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className="p-2 bg-white dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-emerald-500 transition-colors shadow-sm">
                            <History className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{idx + 1} Recent</span>
                        </div>
                        <p className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-emerald-500 transition-colors">
                          {booking.parkingLocation?.locationName || 'Unknown Location'}
                        </p>
                        <p className="text-xs text-slate-500 mt-2 font-semibold">₹{booking.amount_paid} • {booking.duration_hours} Hr(s)</p>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-slate-700/20 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <History className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4 opacity-50" />
                      <p className="text-slate-500 dark:text-slate-400 font-medium">{t.noBookings || 'No recent bookings found'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AnimatePresence>
        {showEditProfileModal && (
          <EditProfileModal 
            isOpen={showEditProfileModal} 
            onClose={() => setShowEditProfileModal(false)}
            user={user}
            t={t} 
          />
        )}
        {showSettingsModal && (
          <SettingsModal 
            isOpen={showSettingsModal} 
            onClose={() => setShowSettingsModal(false)}
            user={user}
            logout={logout}
          />
        )}
        {showSubscription && (
          <SubscriptionModal 
            isOpen={showSubscription} 
            onClose={() => setShowSubscription(false)} 
            t={t} 
          />
        )}
        {selectedAddressForModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedAddressForModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl p-8 z-10 border border-slate-100 dark:border-slate-700">
              <button onClick={() => setSelectedAddressForModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-6 h-6"/></button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl text-brand-600 dark:text-brand-400">
                  <MapPin className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Address Details</h3>
              </div>
              <div className="space-y-4">
                <div><span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Name</span><p className="font-semibold text-slate-900 dark:text-white text-lg">{selectedAddressForModal.name || 'N/A'}</p></div>
                <div><span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Full Address</span><p className="font-semibold text-slate-900 dark:text-white">{selectedAddressForModal.address || `${selectedAddressForModal.flatNo}, ${selectedAddressForModal.street}, ${selectedAddressForModal.city}, ${selectedAddressForModal.state}`}</p></div>
                {selectedAddressForModal.phone && <div><span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Phone</span><p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><Phone className="w-4 h-4"/>{selectedAddressForModal.phone}</p></div>}
              </div>
            </motion.div>
          </div>
        )}
        {selectedBookingForModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedBookingForModal(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></motion.div>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] shadow-2xl p-8 z-10 border border-slate-100 dark:border-slate-700">
              <button onClick={() => setSelectedBookingForModal(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-white"><X className="w-6 h-6"/></button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <History className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">Booking Details</h3>
              </div>
              <div className="space-y-4">
                <div><span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Location</span><p className="font-semibold text-slate-900 dark:text-white text-lg">{selectedBookingForModal.parkingLocation?.locationName || 'N/A'}</p></div>
                <div className="flex gap-8">
                  <div><span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Amount Paid</span><p className="font-semibold text-emerald-600 dark:text-emerald-400 text-lg">₹{selectedBookingForModal.amount_paid}</p></div>
                  <div><span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Duration</span><p className="font-semibold text-slate-900 dark:text-white text-lg">{selectedBookingForModal.duration_hours} Hr(s)</p></div>
                </div>
                <div><span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Vehicle No.</span><p className="font-semibold text-slate-900 dark:text-white">{selectedBookingForModal.vehicle_number || 'N/A'}</p></div>
                <div><span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Status</span><p className="font-semibold text-slate-900 dark:text-white capitalize">{selectedBookingForModal.booking_status || 'upcoming'}</p></div>
                {selectedBookingForModal.createdAt && <div><span className="text-xs uppercase tracking-widest text-slate-500 font-bold block mb-1">Booking Date</span><p className="font-semibold text-slate-900 dark:text-white">{new Date(selectedBookingForModal.createdAt).toLocaleString()}</p></div>}
              </div>
            </motion.div>
          </div>
        )}
        
      </AnimatePresence>
    </div>
  );
};

export default Profile;

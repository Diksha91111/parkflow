import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate, NavLink, Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Languages, MessageCircle, ShieldCheck, Search, X, User, MapPin, Navigation, Phone, ChevronRight, Car } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AddressModal from '../components/AddressModal';
import Sidebar from '../components/Sidebar';
import StatsCards from '../components/StatsCards';
import ParkingList from '../components/ParkingList';
import MapComponent from '../components/MapComponent';
import BookingModal from '../components/BookingModal';
import ActiveBookingTimer from '../components/ActiveBookingTimer';
import FeedbackModal from '../components/FeedbackModal';
import useAuth from '../hooks/useAuth';
import api from '../lib/api';
import { io } from 'socket.io-client';

const translations = {
  en: {
    title: "ParkSmart",
    subtitle: "Finder",
    hello: "Hello",
    findParking: "Find Nearby Parking",
    price: "Price",
    distance: "Distance",
    type: "Type",
    any: "Any",
    lowToHigh: "Low to High (≤ ₹50)",
    highToLow: "High to Low (> ₹50)",
    nearest: "Nearest First",
    adminConsole: "Admin Console",
    chatbot: "AI Assistant",
    searchPlaceholder: "Search location, city...",
    totalBookings: "Total Bookings",
    activeParkings: "Active Parkings",
    totalSpent: "Total Spent",
    availableSlots: "Available Slots",
    dashboard: "Dashboard",
    bookingHistory: "Booking History",
    profile: "Profile",
    logout: "Logout",
    noSpots: "No nearby parking spots found matching your criteria.",
    recommended: "RECOMMENDED",
    bookNow: "Book Now",
    full: "Full",
    available: "Available",
    perHour: "/HR",
    nearby: "Nearby",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete this booking?",
    historyTitle: "Booking History",
    historySubtitle: "Review your past and upcoming reservations",
    noBookings: "You have no booking records available yet.",
    amountPaid: "Amount Paid",
    loadingRecords: "Loading records...",
    duration: "Duration",
    hour: "Hour(s)",
    vehicle: "Vehicle",
    enterDetails: "Please enter your details",
    locationAccess: "Please allow location access to use this feature",
    flatNo: "Flat No / House No",
    street: "Street / Locality",
    cityLabel: "City",
    stateLabel: "State",
    confirmSave: "Confirm & Save"
  },
  hi: {
    title: "पार्कस्मार्ट",
    subtitle: "खोजें",
    hello: "नमस्ते",
    findParking: "नज़दीकी पार्किंग खोजें",
    price: "कीमत",
    distance: "दूरी",
    type: "प्रकार",
    any: "सभी",
    lowToHigh: "कम से ज़्यादा (≤ ₹50)",
    highToLow: "ज़्यादा से कम (> ₹50)",
    nearest: "सबसे नज़दीक",
    adminConsole: "एडमिन कंसोल",
    chatbot: "AI सहायक",
    searchPlaceholder: "स्थान, शहर खोजें...",
    totalBookings: "कुल बुकिंग",
    activeParkings: "सक्रिय पार्किंग",
    totalSpent: "कुल खर्च",
    availableSlots: "उपलब्ध स्लॉट",
    dashboard: "डैशबोर्ड",
    bookingHistory: "बुकिंग इतिहास",
    profile: "प्रोफ़ाइल",
    logout: "लॉगआउट",
    noSpots: "आपकी कसौटी से मेल खाने वाला कोई पार्किंग स्थल नहीं मिला।",
    recommended: "अनुशंसित",
    bookNow: "अभी बुक करें",
    full: "भरा हुआ",
    available: "उपलब्ध",
    perHour: "/घंटा",
    nearby: "पास में",
    delete: "हटाएं",
    confirmDelete: "क्या आप वाकई इस बुकिंग को हटाना चाहते हैं?",
    historyTitle: "बुकिंग इतिहास",
    historySubtitle: "अपने पिछले और आगामी आरक्षणों की समीक्षा करें",
    noBookings: "आपके पास अभी तक कोई बुकिंग रिकॉर्ड उपलब्ध नहीं है।",
    amountPaid: "भुगतान की गई राशि",
    loadingRecords: "रिकॉर्ड लोड हो रहे हैं...",
    duration: "अवधि",
    hour: "घंटा(घंटे)",
    vehicle: "वाहन",
    confirmLocation: "पुष्टि करें और सहेजें",
    detecting: "खोज रहा है...",
    enterDetails: "कृपया अपना विवरण दर्ज करें",
    locationAccess: "कृपया इस सुविधा का उपयोग करने के लिए स्थान पहुंच की अनुमति दें",
    flatNo: "फ्लैट नंबर / हाउस नंबर",
    street: "सड़क / इलाका",
    cityLabel: "शहर",
    stateLabel: "राज्य",
    confirmSave: "पुष्टि करें और सहेजें"
  },
  mr: {
    title: "पार्कस्मार्ट",
    subtitle: "शोधक",
    hello: "नमस्कार",
    findParking: "जवळचे पार्किंग शोधा",
    price: "किंमत",
    distance: "अंतर",
    type: "प्रकार",
    any: "कोणतेही",
    lowToHigh: "कमी ते जास्त (≤ ₹50)",
    highToLow: "जास्त ते कमी (> ₹50)",
    nearest: "सर्वात जवळचे",
    adminConsole: "प्रशासन कन्सोल",
    chatbot: "AI सहाय्यक",
    searchPlaceholder: "ठिकाण, शहर शोधा...",
    totalBookings: "एकूण बुकिंग",
    activeParkings: "सक्रिय पार्किंग",
    totalSpent: "एकूण खर्च",
    availableSlots: "उपलब्ध स्लॉट",
    dashboard: "डॅशबोर्ड",
    bookingHistory: "बुकिंग इतिहास",
    profile: "प्रोफाइल",
    logout: "लॉगआउट",
    noSpots: "तुमच्या निकषांशी जुळणारे कोणतेही पार्किंग सापडले नाही.",
    recommended: "शिफारस केलेले",
    bookNow: "आता बुक करा",
    full: "पूर्ण",
    available: "उपलब्ध",
    perHour: "/तास",
    nearby: "जवळपास",
    delete: "हटवा",
    confirmDelete: "तुम्हाला खात्री आहे की तुम्ही ही बुकिंग हटवू इच्छिता?",
    historyTitle: "बुकिंग इतिहास",
    historySubtitle: "तुमच्या मागील आणि आगामी आरक्षणांचे पुनरावलोकन करा",
    noBookings: "तुमच्याकडे अद्याप कोणतेही बुकिंग रेकॉर्ड उपलब्ध नाहीत.",
    amountPaid: "भरलेली रक्कम",
    loadingRecords: "रेकॉर्ड लोड होत आहेत...",
    duration: "कालावधी",
    hour: "तास",
    vehicle: "वाहन",
    confirmLocation: "पुष्टी करा आणि सेव्ह करा",
    detecting: "शोधत आहे...",
    enterDetails: "कृपया तुमची माहिती भरा",
    locationAccess: "कृपया या वैशिष्ट्यासाठी स्थान परवानगी द्या",
    flatNo: "फ्लॅट क्र. / घर क्र.",
    street: "रस्ता / परिसर",
    cityLabel: "शहर",
    stateLabel: "राज्य",
    confirmSave: "पुष्टी करा आणि सेव्ह करा"
  },
  ta: {
    title: "பார்க்ஸ்மார்ட்",
    subtitle: "தேடல்",
    hello: "வணக்கம்",
    findParking: "அருகிலுள்ள பார்க்கிங்",
    price: "விலை",
    distance: "தூரம்",
    type: "வகை",
    any: "எதையும்",
    lowToHigh: "குறைவாக இருந்து அதிகம் (≤ ₹50)",
    highToLow: "அதிகமாக இருந்து குறைவு (> ₹50)",
    nearest: "அருகில் உள்ளவை",
    adminConsole: "நிர்வாகி கன்சோல்",
    chatbot: "AI உதவியாளர்",
    searchPlaceholder: "இடம், நகரத்தைத் தேடு...",
    totalBookings: "மொத்த முன்பதிவுகள்",
    activeParkings: "செயலில் உள்ள பார்க்கிங்",
    totalSpent: "மொத்த செலவு",
    availableSlots: "கிடைக்கக்கூடிய இடங்கள்",
    dashboard: "டாஷ்போர்டு",
    bookingHistory: "முன்பதிவு வரலாறு",
    profile: "சுயவிவரம்",
    logout: "வெளியேறு",
    noSpots: "உங்கள் தேடலுக்கு ஏற்ற பார்க்கிங் இடங்கள் எதுவும் இல்லை.",
    recommended: "பரிந்துரைக்கப்படுகிறது",
    bookNow: "இப்போதே முன்பதிவு செய்",
    full: "நிரம்பியது",
    available: "கிடைக்கிறது",
    perHour: "/மணி",
    nearby: "அருகில்",
    delete: "நீக்கு",
    confirmDelete: "இந்த முன்பதிவை நீக்க விரும்புகிறீர்களா?",
    historyTitle: "முன்பதிவு வரலாறு",
    historySubtitle: "உங்கள் கடந்தகால மற்றும் வரவிருக்கும் முன்பதிவுகளை மதிப்பாய்வு செய்யவும்",
    noBookings: "உங்களிடம் இன்னும் முன்பதிவு பதிவுகள் எதுவும் இல்லை.",
    amountPaid: "செலுத்தப்பட்ட தொகை",
    loadingRecords: "பதிவுகள் ஏற்றப்படுகின்றன...",
    duration: "கால அளவு",
    hour: "மணிநேரம்",
    vehicle: "வாகனம்",
    confirmLocation: "உறுதிப்படுத்தி சேமிக்கவும்",
    detecting: "கண்டறியப்படுகிறது...",
    enterDetails: "உங்கள் விவரங்களை உள்ளிடவும்",
    locationAccess: "இந்த அம்சத்தைப் பயன்படுத்த இருப்பிட அனுமதியை வழங்கவும்",
    flatNo: "பிளாட் எண் / வீட்டு எண்",
    street: "தெரு / பகுதி",
    cityLabel: "நகரம்",
    stateLabel: "மாநிலம்",
    confirmSave: "உறுதிப்படுத்தி சேமிக்கவும்"
  },
  bn: {
    title: "পার্কস্মার্ট",
    subtitle: "অনুসন্ধান",
    hello: "নমস্কার",
    findParking: "কাছাকাছি পার্কিং খুঁজুন",
    price: "দাম",
    distance: "দূরত্ব",
    type: "ধরন",
    any: "যেকোনো",
    lowToHigh: "কম থেকে বেশি (≤ ₹50)",
    highToLow: "বেশি থেকে কম (> ₹50)",
    nearest: "সবচেয়ে কাছের",
    adminConsole: "অ্যাডমিন কনসোল",
    chatbot: "AI সহকারী",
    searchPlaceholder: "স্থান, শহর খুঁজুন...",
    totalBookings: "মোট বুকিং",
    activeParkings: "সক্রিয় পার্কিং",
    totalSpent: "মোট ব্যয়",
    availableSlots: "উপলব্ধ স্লট",
    dashboard: "ড্যাশবোর্ড",
    bookingHistory: "বুকিং ইতিহাস",
    profile: "প্রোফাইল",
    logout: "লগআউট",
    noSpots: "আপনার মানদণ্ডের সাথে মেলে এমন কোনো পার্কিং স্পট পাওয়া যায়নি।",
    recommended: "প্রস্তাবিত",
    bookNow: "এখনই বুক করুন",
    full: "পূর্ণ",
    available: "উপলব্ধ",
    perHour: "/ঘণ্টা",
    nearby: "কাছাকাছি",
    delete: "মুছে ফেলুন",
    confirmDelete: "আপনি কি নিশ্চিত যে আপনি এই বুকিংটি মুছে ফেলতে চান?",
    historyTitle: "বুকিং ইতিহাস",
    historySubtitle: "আপনার অতীত এবং আসন্ন সংরক্ষণ পর্যালোচনা করুন",
    noBookings: "আপনার কাছে এখনও কোনো বুকিং রেকর্ড নেই।",
    amountPaid: "পরিশোধিত অর্থ",
    loadingRecords: "রেকর্ড লোড হচ্ছে...",
    duration: "সময়কাল",
    hour: "ঘণ্টা",
    vehicle: "যানবাহন",
    confirmLocation: "নিশ্চিত করুন এবং সংরক্ষণ করুন",
    detecting: "সনাক্ত করা হচ্ছে...",
    enterDetails: "অনুগ্রহ করে আপনার বিবরণ লিখুন",
    locationAccess: "এই বৈশিষ্ট্যটি ব্যবহার করতে অনুগ্রহ করে অবস্থান অ্যাক্সেসের অনুমতি দিন",
    flatNo: "ফ্ল্যাট নং / বাড়ি নং",
    street: "রাস্তা / এলাকা",
    cityLabel: "শহর",
    stateLabel: "রাজ্য",
    confirmSave: "নিশ্চিত করুন এবং সংরক্ষণ করুন"
  },
  te: {
    title: "పార్క్ స్మార్ట్",
    subtitle: "శోధన",
    hello: "నమస్కారం",
    findParking: "సమీప పార్కింగ్ కనుగొనండి",
    price: "ధర",
    distance: "దూరం",
    type: "రకం",
    any: "ఏదైనా",
    lowToHigh: "తక్కువ నుండి ఎక్కువ (≤ ₹50)",
    highToLow: "ఎక్కువ నుండి తక్కువ (> ₹50)",
    nearest: "సమీపంలోనివి",
    adminConsole: "అడ్మిన్ కన్సోల్",
    chatbot: "AI సహాయకుడు",
    searchPlaceholder: "స్థలం, నగరం వెతకండి...",
    totalBookings: "మొత్తం బుకింగ్‌లు",
    activeParkings: "క్రియాశీల పార్కింగ్‌లు",
    totalSpent: "మొత్తం ఖర్చు",
    availableSlots: "అందుబాటులో ఉన్న స్లాట్లు",
    dashboard: "డ్యాష్‌బోర్డ్",
    bookingHistory: "బుకింగ్ చరిత్ర",
    profile: "ప్రొఫైల్",
    logout: "లాగ్ అవుట్",
    noSpots: "మీ శోధనకు సరిపోయే పార్కింగ్ స్థలాలు ఏవీ లేవు.",
    recommended: "సిఫార్సు చేయబడింది",
    bookNow: "ఇప్పుడే బుక్ చేయండి",
    full: "నిండిపోయింది",
    available: "అందుబాటులో ఉంది",
    perHour: "/గంట",
    nearby: "సమీపంలో",
    delete: "తొలగించు",
    confirmDelete: "మీరు ఖచ్చితంగా ఈ బుకింగ్‌ను తొలగించాలనుకుంటున్నారా?",
    historyTitle: "బుకింగ్ చరిత్ర",
    historySubtitle: "మీ గత మరియు రాబోయే రిజర్వేషన్లను సమీక్షించండి",
    noBookings: "మీకు ఇంకా బుకింగ్ రికార్డులు లేవు.",
    amountPaid: "చెల్లించిన మొత్తం",
    loadingRecords: "రికార్డులు లోడ్ అవుతున్నాయి...",
    duration: "వ్యవధి",
    hour: "గంట(లు)",
    vehicle: "వాహనం",
    confirmLocation: "ధృవీకరించండి & సేవ్ చేయండి",
    detecting: "గుర్తిస్తోంది...",
    enterDetails: "దయచేసి మీ వివరాలను నమోదు చేయండి",
    locationAccess: "ఈ ఫీచర్‌ను ఉపయోగించడానికి దయచేసి స్థాన అనుమతిని ఇవ్వండి",
    flatNo: "ఫ్లాట్ నంబర్ / ఇంటి నంబర్",
    street: "వీధి / ప్రాంతం",
    cityLabel: "నగరం",
    stateLabel: "రాష్ట్రం",
    confirmSave: "ధృవీకరించండి & సేవ్ చేయండి"
  }
};



const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || options[0].label;

  return (
    <div className="relative flex-1">
      <div
        className="text-slate-700 dark:text-slate-300 text-xs md:text-sm font-semibold rounded-full px-2 py-2.5 outline-none hover:bg-white dark:hover:bg-slate-600 transition-colors cursor-pointer text-center flex justify-center items-center truncate"
        onClick={() => setIsOpen(!isOpen)}
        title={selectedLabel}
      >
        {selectedLabel}
      </div>
      {isOpen && (
        <>
          {/* Invisible overlay for click-outside to close */}
          <div className="fixed inset-0 z-[998]" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
          <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[999] overflow-hidden py-1 animate-fade-in-up">
            {options.map(opt => (
              <div
                key={opt.value}
                className={`px-4 py-2.5 cursor-pointer text-sm text-center transition-colors ${value === opt.value ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(opt.value);
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'en');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const t = translations[lang] || translations['en'];

  // Capitalize first letter helper
  const capitalizeName = (name) => {
    if (!name) return 'User';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Data States
  const [metrics, setMetrics] = useState(null);
  const [slots, setSlots] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  // const [loadingLocation, setLoadingLocation] = useState(true);

  // Filtering States
  const [filters, setFilters] = useState({ price: 'any', distance: 'any', type: 'any' });
  const [searchQuery, setSearchQuery] = useState(() => new URLSearchParams(location.search).get('q') || '');

  // Interaction States
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSlot, setBookingSlot] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [activeBookingDetails, setActiveBookingDetails] = useState(null);
  const [isTimerVisible, setIsTimerVisible] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [manualAddressData, setManualAddressData] = useState(() => {
    const saved = localStorage.getItem('user_address');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('user_address');
      setManualAddressData(saved ? JSON.parse(saved) : null);
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleAddressConfirm = (data) => {
    // 1. Save the active header address (for display in Dashboard header)
    localStorage.setItem('user_address', JSON.stringify(data));
    setManualAddressData(data);

    // 2. Save to the persistent "Saved Addresses" list for the Profile page
    // Use user-specific key to separate addresses per user
    if (data.mode === 'manual') {
      const userId = user?._id || user?.id || 'guest';
      const userAddressesKey = `userAddresses_${userId}`;
      const existingSaved = JSON.parse(localStorage.getItem(userAddressesKey) || '[]');
      
      // Check if this address already exists to avoid duplicates
      const isDuplicate = existingSaved.some(addr => 
        addr.flatNo === data.flatNo && 
        addr.street === data.street && 
        addr.city === data.city
      );

      if (!isDuplicate) {
        const updatedSaved = [data, ...existingSaved].slice(0, 10); // Keep last 10
        localStorage.setItem(userAddressesKey, JSON.stringify(updatedSaved));
      }
    }

    // 3. Update location and notify other components
    if (data.mode === 'current') {
      setUserLocation({ lat: data.lat, lng: data.lng });
      fetchNearbySlots(data.lat, data.lng);
      toast.success("Location updated to current position");
    } else {
      toast.success(`Location set to: ${data.address}`);
    }
    window.dispatchEvent(new Event('storage'));
  };
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Theme & Lang Sync
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
    localStorage.setItem('lang', lang);
  }, [lang]);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || '';
    setSearchQuery(q);
  }, [location.search]);

  // WebSocket & Metrics Setup
  const fetchMetrics = useCallback(async () => {
    try {
      // 1. Fetch metrics from API
      const resMetrics = await api.get('/api/bookings/my-metrics');
      if (resMetrics.data.success) {
        setMetrics(resMetrics.data.data);
      }

      // 2. Fetch bookings from API to keep localStorage in sync (used by other pages)
      const resBookings = await api.get('/api/bookings/my-bookings');
      if (resBookings.data.success) {
        localStorage.setItem('bookings', JSON.stringify(resBookings.data.data));
        // Dispatch storage event to notify other components in same window
        window.dispatchEvent(new Event('storage'));
      }
    } catch (err) {
      console.warn("Could not load metrics from API, falling back to local storage", err);
      // Fallback to local storage calculation if API fails
      const localBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const localMetrics = {
        totalBookings: localBookings.length,
        activeBookings: localBookings.filter(b => b.booking_status === 'active' || b.booking_status === 'upcoming').length,
        totalSpent: localBookings.reduce((sum, b) => sum + (Number(b.amount_paid) || 0), 0)
      };
      setMetrics(localMetrics);
    }
  }, []);

  useEffect(() => {
    const loadMetrics = async () => {
      await fetchMetrics();
    };
    loadMetrics();

    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
      upgrade: false
    });

    socket.on('connect', () => {
      console.log('Dashboard connected to WebSocket');
    });

    socket.on('SLOT_UPDATED', (data) => {
      setSlots(prev => prev.map(slot => {
        if (slot._id === data.slotId) {
          return { ...slot, availableSlots: data.status === 'occupied' ? 0 : slot.availableSlots };
        }
        return slot;
      }));
    });

    socket.on('SLOT_ADDED', (newSlot) => {
      console.log('New slot added via WebSocket:', newSlot);
      setSlots(prev => {
        const currentSlots = Array.isArray(prev) ? prev : [];
        if (currentSlots.some(s => s._id === newSlot._id)) return currentSlots;
        return [newSlot, ...currentSlots];
      });
      toast.info(`New parking spot added: ${newSlot.name}`);
    });

    socket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
    });

    return () => socket.disconnect();
  }, [fetchMetrics]);

  // Location Setup
  const fetchNearbySlots = useCallback(async (lat, lng) => {
    const dummySlots = [
      { _id: '1', name: "Mall Parking", lat: 18.5204, lng: 73.8567, pricePerHour: 50, availableSlots: 10, type: 'Car' },
      { _id: '2', name: "City Center Parking", lat: 18.5210, lng: 73.8575, pricePerHour: 30, availableSlots: 5, type: 'Bike' },
      { _id: '3', name: "Metro Parking", lat: 18.5190, lng: 73.8550, pricePerHour: 20, availableSlots: 15, type: 'Car' }
    ];

    try {
      const searchParams = new URLSearchParams(location.search);
      const query = searchParams.get('q');
      
      let res;
      if (query) {
        res = await api.get('/api/parking/search', { params: { q: query, lat, lng } });
      } else {
        res = await api.get('/api/parking/nearby', { params: { lat, lng, radius: 5000 } });
      }
      
      const serverSlots = res.data.data;
      if (serverSlots && Array.isArray(serverSlots)) {
        setSlots(serverSlots);
      } else {
        setSlots(prev => Array.isArray(prev) && prev.length > 0 ? prev : []);
      }
    } catch {
      toast.error('Failed to connect to backend slots.');
      setSlots(prev => Array.isArray(prev) && prev.length > 0 ? prev : []);
    }
  }, [location.search]);

  useEffect(() => {
    let hasFetchedSlots = false;

    const loadSlots = async (lat, lng) => {
      await fetchNearbySlots(lat, lng);
    };

    if (!navigator.geolocation) {
      toast.error('Geolocation not supported. Using default location.');
      // setLoadingLocation(false);
      loadSlots(18.5204, 73.8567);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLoc = { lat: latitude, lng: longitude };
        setUserLocation(newLoc);
        // setLoadingLocation(false);

        if (!hasFetchedSlots) {
          hasFetchedSlots = true;
          loadSlots(latitude, longitude);
        }
      },
      () => {
        toast.error('Location permission denied. Using default location.');
        // setLoadingLocation(false);
        if (!hasFetchedSlots) {
          hasFetchedSlots = true;
          setUserLocation({ lat: 18.5204, lng: 73.8567 });
          loadSlots(18.5204, 73.8567);
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [fetchNearbySlots]);

  // Derived State
  const displaySlots = useMemo(() => {
    if (!Array.isArray(slots)) return [];

    // AI/Smart Recommendation Logic
    const enrichedSlots = slots.map(slot => {
      let score = 0;
      if (slot.pricePerHour <= 30) score += 40;
      if (slot.availableSlots > 10) score += 30;
      if (slot.type === 'EV-friendly') score += 10;
      return { ...slot, recommendationScore: score };
    });

    const filtered = enrichedSlots.filter((slot) => {
      if (filters.price !== 'any') {
        if (filters.price === 'low' && slot.pricePerHour > 50) return false;
        if (filters.price === 'high' && slot.pricePerHour <= 50) return false;
      }
      if (filters.type !== 'any') {
        if (slot.type !== filters.type && slot.type !== undefined) return false;
      }
      return true;
    });

    // Find top recommendation in filtered list
    if (filtered.length > 0) {
      const topScore = Math.max(...filtered.map(s => s.recommendationScore || 0));
      return filtered.map(s => ({ ...s, isRecommended: s.recommendationScore === topScore && topScore > 50 }));
    }
    return filtered;
  }, [slots, filters]);

  const availableSlotsCount = useMemo(() => {
    return displaySlots.reduce((acc, slot) => acc + (slot.availableSlots || 0), 0);
  }, [displaySlots]);

  // Actions
  const handleSlotSelect = (slot) => setSelectedSlot(slot);

  const handleOpenBooking = (slot) => {
    setBookingSlot(slot);
    setIsBookingModalOpen(true);
  };


  const executeBooking = async (formDetails) => {
    setIsBooking(true);
    const { vehicleNumber, bookingType, durationHours, advancedDate, advancedTime } = formDetails;

    if (!vehicleNumber.trim()) {
      toast.error('Please enter your Vehicle Number');
      setIsBooking(false);
      return;
    }

    try {
      const numericPrice = bookingSlot.pricePerHour || 50;
      const payload = {
        spotId: bookingSlot._id,
        locationName: bookingSlot.name,
        lat: bookingSlot.lat,
        lng: bookingSlot.lng,
        price: numericPrice,
        durationHours: Number(durationHours),
        vehicleNumber,
        bookingType
      };

      if (bookingType === 'advanced') {
        if (!advancedDate || !advancedTime) {
          toast.error('Select both date and time for advanced booking');
          setIsBooking(false);
          return;
        }
        const combinedDateTime = new Date(`${advancedDate}T${advancedTime}`);
        if (combinedDateTime < new Date()) {
          toast.error('Advanced booking time cannot be in the past');
          setIsBooking(false);
          return;
        }
        payload.startTime = combinedDateTime.toISOString();
      }

      console.log('Processing API order request: ', payload);
      const res = await api.post('/api/bookings/create', payload);

      if (res.data.success) {
        toast.success('Payment Successful!');
        setTimeout(() => {
          toast.success('Booking Confirmed Successfully');
          toast.info('Redirecting to navigation...');
          setIsBookingModalOpen(false);
          setIsBooking(false);

          // Force state update for available slots locally
          setSlots(prev => prev.map(s => {
            if (s._id === bookingSlot._id) {
              return { ...s, availableSlots: Math.max(0, (s.availableSlots || 1) - 1) };
            }
            return s;
          }));

          // Update metrics locally for immediate feedback
          const bookingAmount = (bookingSlot.pricePerHour || 50) * Number(durationHours);
          setMetrics(prev => ({
            ...prev,
            totalBookings: (prev?.totalBookings || 0) + 1,
            activeBookings: (prev?.activeBookings || 0) + 1,
            totalSpent: (prev?.totalSpent || 0) + bookingAmount
          }));

          // Also update localStorage for booking history
          const newBooking = {
            _id: res.data.booking?._id || `local_${Date.now()}`,
            spotId: bookingSlot._id,
            locationName: bookingSlot.name,
            lat: bookingSlot.lat,
            lng: bookingSlot.lng,
            vehicleNumber,
            bookingType,
            durationHours: Number(durationHours),
            amount_paid: bookingAmount,
            booking_status: 'upcoming',
            payment_status: 'Completed',
            createdAt: new Date().toISOString()
          };
          
          const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
          const updatedBookings = [newBooking, ...existingBookings];
          localStorage.setItem('bookings', JSON.stringify(updatedBookings));
          window.dispatchEvent(new Event('storage'));

          // Refresh metrics from server (for non-mock users)
          try { 
            console.log('Refreshing metrics after booking...');
            fetchMetrics(); 
          } catch (metricsError) { 
            console.error("Error fetching metrics after booking:", metricsError); 
          }

          // Auto route initialization requirement
          setTimeout(() => {
            const userLat = userLocation?.lat || 18.5204;
            const userLng = userLocation?.lng || 73.8567;
            window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${bookingSlot.lat},${bookingSlot.lng}`, '_blank');
            
            // Start Timer immediately after opening navigation
            setActiveBookingDetails({ ...payload, _id: res.data.booking?._id });
            setIsTimerVisible(true);
          }, 1500);

        }, 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error occurred during booking');
      setIsBooking(false);
    }
  };

  const handleTimerEnd = () => {
    setIsTimerVisible(false);
    setIsFeedbackModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-transparent font-sans overflow-hidden window-border-highlight">
      {/* Sidebar */}
      <Sidebar t={t} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto custom-scrollbar p-6">

        {/* Top Header */}
        <header className="flex justify-between items-start mb-6">
          <div 
            onClick={() => setIsAddressModalOpen(true)}
            className="flex flex-col cursor-pointer group"
          >
            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight animate-fade-in-up heading-modern">
              {t.title} <span className="font-light text-slate-500">{t.subtitle}</span>
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm lowercase">
              hello, {capitalizeName(user?.name || 'User')}!
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-600 dark:text-slate-300"
                  title="Translate"
                >
                  <Languages className="w-5 h-5" />
                </button>

                {isLangMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-[998]" onClick={() => setIsLangMenuOpen(false)}></div>
                    <div className="absolute top-[calc(100%+8px)] right-0 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl z-[999] overflow-hidden py-1 animate-fade-in-up">
                      {[
                        { code: 'en', label: 'English' },
                        { code: 'hi', label: 'हिंदी (Hindi)' },
                        { code: 'mr', label: 'मराठी (Marathi)' },
                        { code: 'ta', label: 'தமிழ் (Tamil)' },
                        { code: 'bn', label: 'বাংলা (Bengali)' },
                        { code: 'te', label: 'తెలుగు (Telugu)' }
                      ].map(l => (
                        <div
                          key={l.code}
                          className={`px-4 py-2.5 cursor-pointer text-sm transition-colors ${lang === l.code ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 font-bold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLang(l.code);
                            setIsLangMenuOpen(false);
                          }}
                        >
                          {l.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition text-slate-600 dark:text-slate-300"
                title="Toggle Theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>

            {/* Profile Link */}
            <Link
              to="/profile"
              className="text-sm font-semibold text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-5 py-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-brand-900/40 transition border border-brand-200 dark:border-brand-800 shadow-sm flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              {t.profile}
            </Link>
          </div>
        </header>

        {/* Stats Row */}
        <StatsCards metrics={metrics} availableSlots={availableSlotsCount} t={t} />

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-[500px]">

          {/* Left Side: Finding List */}
          <div className="lg:col-span-5 flex flex-col bg-white dark:bg-slate-800 rounded-3xl overflow-hidden section-highlight animate-slide-right">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white heading-modern">{t.findParking}</h3>
              </div>

              {/* Search Box */}
              <div className="relative mb-4 group flex gap-2">
                <div className="relative flex-1 group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        const existing = JSON.parse(localStorage.getItem('recentSearches') || '[]');
                        const updated = [searchQuery, ...existing.filter(s => s !== searchQuery)].slice(0, 10);
                        localStorage.setItem('recentSearches', JSON.stringify(updated));
                        navigate(`?q=${encodeURIComponent(searchQuery)}`);
                      }
                    }}
                    className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-2xl text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all dark:text-white"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        navigate('?');
                      }}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (searchQuery.trim()) {
                      const existing = JSON.parse(localStorage.getItem('recentSearches') || '[]');
                      const updated = [searchQuery, ...existing.filter(s => s !== searchQuery)].slice(0, 10);
                      localStorage.setItem('recentSearches', JSON.stringify(updated));
                      navigate(`?q=${encodeURIComponent(searchQuery)}`);
                    }
                  }}
                  className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-500/20 transition-all active:scale-95 flex items-center justify-center"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center bg-slate-50 dark:bg-slate-700 rounded-full border border-slate-200 dark:border-slate-600 shadow-inner p-1">
                <CustomSelect
                  value={filters.price}
                  onChange={val => setFilters({ ...filters, price: val })}
                  options={[
                    { value: 'any', label: t.price },
                    { value: 'low', label: t.lowToHigh },
                    { value: 'high', label: t.highToLow }
                  ]}
                />

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

                <CustomSelect
                  value={filters.distance}
                  onChange={val => setFilters({ ...filters, distance: val })}
                  options={[
                    { value: 'any', label: t.distance },
                    { value: 'nearest', label: t.nearest }
                  ]}
                />

                <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1"></div>

                <CustomSelect
                  value={filters.type}
                  onChange={val => setFilters({ ...filters, type: val })}
                  options={[
                    { value: 'any', label: t.type },
                    { value: 'Car', label: 'Car' },
                    { value: 'Bike', label: 'Bike' },
                    { value: 'EV', label: 'EV' }
                  ]}
                />
              </div>
            </div>

            <div className="flex-1 p-4 bg-slate-50/50 dark:bg-slate-800/50 overflow-y-auto custom-scrollbar max-h-[500px]">
            <ParkingList
              spots={displaySlots}
              selectedSpot={selectedSlot}
              onSpotSelect={handleSlotSelect}
              onBookNow={handleOpenBooking}
              t={t}
            />
          </div>
        </div>

        {/* Right Side: Map Region */}
          <div className="lg:col-span-7 flex flex-col gap-6 animate-slide-left">
            <MapComponent
              userLocation={userLocation}
              spots={displaySlots}
              selectedSpot={selectedSlot}
              onSelectSpot={handleSlotSelect}
            />
          </div>

        </div>
      </div>

      {/* Booking Form Overlay */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        spot={bookingSlot}
        onConfirm={executeBooking}
        isBooking={isBooking}
      />

      <AnimatePresence>
        {isAddressModalOpen && (
          <AddressModal
            isOpen={isAddressModalOpen}
            onClose={() => setIsAddressModalOpen(false)}
            t={t}
            onConfirm={handleAddressConfirm}
          />
        )}
      </AnimatePresence>

      {isTimerVisible && activeBookingDetails && (
        <ActiveBookingTimer
          booking={activeBookingDetails}
          durationHours={activeBookingDetails.durationHours}
          onTimerEnd={handleTimerEnd}
        />
      )}

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => {
          setIsFeedbackModalOpen(false);
          setActiveBookingDetails(null);
        }}
        locationName={activeBookingDetails?.locationName}
        spotId={activeBookingDetails?.spotId}
      />
    </div>
  );
};

export default Dashboard;

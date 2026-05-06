import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Moon, Sun, ArrowRight, Clock, Shield, Navigation2, Star } from 'lucide-react';
import LoadingAnimation from '../components/LoadingAnimation';
import ParkingSimulation from '../components/ParkingSimulation';
import MobileRouteAnimation from '../components/MobileRouteAnimation';

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    // Show animation for 2 seconds then fade out
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && <LoadingAnimation key="loader" />}
      </AnimatePresence>

      <motion.div 
        key="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="relative font-sans selection:bg-blue-100 dark:selection:bg-blue-500/30 text-slate-800 dark:text-slate-200 transition-colors duration-300"
      >
        {/* Background Images with Glassmorphism Overlay */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div 
            className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-in-out block"
            style={{ backgroundImage: `url('${darkMode ? '/hero-bg-dark.jpg' : '/hero-bg-light.jpg'}')` }}
          ></div>
          <div className="absolute inset-0 bg-white/20 dark:bg-slate-900/30 transition-colors duration-700"></div>
        </div>
        
        <div className="relative z-10 flex flex-col min-h-screen">
      
      {/* Navbar */}
      <nav className="border-b border-gray-100 dark:border-slate-800 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-[#3b5bdb] p-2 rounded-lg logo-3d">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">ParkSmart</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-white border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-colors hidden sm:block"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <Link to="/auth?mode=login" className="text-sm font-semibold text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white px-3">
                Log In
              </Link>
              <Link to="/auth?mode=login&type=admin" className="text-sm font-semibold text-brand-600 dark:text-blue-400 hover:text-brand-800 dark:hover:text-blue-300 px-3">
                Admin Console
              </Link>
              <Link to="/auth?mode=signup" className="bg-[#3b5bdb] hover:bg-[#364fc7] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column Content */}
          <div className="text-left flex flex-col justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex self-start items-center gap-2 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full px-4 py-1.5 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-sm font-medium text-[#3b5bdb] dark:text-blue-400">Available in 50+ cities across India</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-black dark:text-white hover:text-[#3b5bdb] dark:hover:text-[#3b5bdb] transition-colors duration-300 tracking-tight mb-6 heading-modern"
            >
              Find & Book Parking Instantly
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-black dark:text-black shadow-white drop-shadow-md mb-10 leading-relaxed font-medium"
            >
              Real-time parking availability, instant booking, and transparent pricing. Never waste time searching for parking again.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-20"
            >
              <Link to="/dashboard" className="inline-flex justify-center items-center gap-2 bg-[#3b5bdb] hover:bg-[#364fc7] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-xl shadow-blue-500/20 hover:-translate-y-0.5">
                Find Parking Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/dashboard" className="inline-flex justify-center items-center gap-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur-md text-[#3b5bdb] dark:text-blue-400 border-2 border-transparent hover:border-blue-200/50 dark:hover:border-slate-600/50 hover:bg-white/90 dark:hover:bg-slate-800/90 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-500/5">
                View Map
              </Link>
            </motion.div>
          </div>

          {/* Right Column Content - Mobile Route Display */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center items-center lg:justify-end mb-12 lg:mb-0"
          >
            <MobileRouteAnimation />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-3xl mx-auto mb-14 mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3"
        >
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3">
            <Shield className="w-5 h-5 text-emerald-500" />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Book</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reserve your slot</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3">
            <Navigation2 className="w-5 h-5 text-blue-500" />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Navigate</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Google Maps guidance</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3">
            <MapPin className="w-5 h-5 text-purple-500" />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 dark:text-white">Park</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">At your vacant spot</p>
            </div>
          </div>
        </motion.div>

        {/* Hero Image / Map Dashboard Preview replaced with Interactive Simulation removed */}
      </main>

      {/* Stats Section */}
      <section className="bg-white/30 dark:bg-slate-900/40 backdrop-blur-lg py-16 border-y border-white/20 dark:border-slate-800/50 mt-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-200 dark:divide-slate-700">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="px-4"
            >
              <p className="text-4xl font-black text-[#3b5bdb] mb-2 tracking-tight">50K+</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Happy Drivers</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="px-4"
            >
              <p className="text-4xl font-black text-[#3b5bdb] mb-2 tracking-tight">500+</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Parking Spots</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="px-4"
            >
              <p className="text-4xl font-black text-[#3b5bdb] mb-2 tracking-tight">50+</p>
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest">Cities</p>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="px-4"
            >
              <p className="text-4xl font-black text-[#3b5bdb] mb-2 tracking-tight flex items-center justify-center gap-1">
                4.8<Star className="w-8 h-8 fill-current" />
              </p>
              <p className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-widest">App Rating</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 heading-modern"
          >
            Why ParkSmart?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-gray-500 dark:text-slate-400 font-medium"
          >
            Everything you need for stress-free parking
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* F1 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -10 }}
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 card-hover glow-border"
          >
            <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-6">
              <MapPin className="w-6 h-6 text-[#3b5bdb] dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 heading-modern">Real-Time Availability</h3>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed font-medium">See live parking availability across 50+ cities in India instantly.</p>
          </motion.div>

          {/* F2 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -10 }}
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 card-hover glow-border"
          >
            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 heading-modern">Instant Booking</h3>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed font-medium">Book your parking spot in seconds with confirmed reservation.</p>
          </motion.div>

          {/* F3 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -10 }}
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 card-hover glow-border"
          >
            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-orange-500 dark:text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 heading-modern">Secure Payments</h3>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed font-medium">100% secure payment gateway. UPI, cards, and wallets accepted.</p>
          </motion.div>

          {/* F4 */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -10 }}
            className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-slate-700 card-hover glow-border"
          >
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-6">
              <Navigation2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 heading-modern">Smart Navigation</h3>
            <p className="text-gray-500 dark:text-slate-400 leading-relaxed font-medium">Get directions straight to your parking spot with one tap.</p>
          </motion.div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="bg-white/30 dark:bg-slate-900/40 backdrop-blur-lg py-24 border-t border-white/20 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4 heading-modern"
            >
              Loved by drivers
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-500 dark:text-slate-400 font-medium"
            >
              Join thousands of happy ParkSmart users
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 card-hover glow-border"
            >
              <div className="flex gap-1 text-yellow-400 mb-4">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-gray-600 dark:text-slate-300 font-medium leading-relaxed mb-6">"ParkSmart saved me 20 minutes every day. I book my spot before leaving home!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">P</div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Priya Sharma</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Daily Commuter</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 card-hover glow-border"
            >
              <div className="flex gap-1 text-yellow-400 mb-4">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-gray-600 dark:text-slate-300 font-medium leading-relaxed mb-6">"The real-time availability feature is a game changer. No more circling the block."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold">R</div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Rahul Mehta</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Business Professional</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              whileHover={{ y: -5 }}
              className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 card-hover glow-border"
            >
              <div className="flex gap-1 text-yellow-400 mb-4">
                <Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" /><Star className="w-5 h-5 fill-current" />
              </div>
              <p className="text-gray-600 dark:text-slate-300 font-medium leading-relaxed mb-6">"Love the transparent pricing. I always know exactly what I'll pay before I park."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold">A</div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Ananya Patel</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Weekend Shopper</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Footer Wrapper */}
      <footer className="bg-white/40 dark:bg-slate-900/60 backdrop-blur-2xl pt-20 pb-10 border-t border-white/20 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-[#3b5bdb] p-2 rounded-lg">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">ParkSmart</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm leading-relaxed">
                Making urban parking effortless through real-time technology and smart reservations. Join the future of mobility today.
              </p>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-6">Platform</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
                <li><Link to="/dashboard" className="hover:text-brand-500 transition-colors">Find Parking</Link></li>
                <li><Link to="/auth?mode=login&type=admin" className="hover:text-brand-500 transition-colors">Admin Console</Link></li>
                <li><Link to="/ai-assistant" className="hover:text-brand-500 transition-colors">AI Assistant</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-slate-900 dark:text-white font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-slate-500 dark:text-slate-400 font-medium">
                <li><Link to="/help" className="hover:text-brand-500 transition-colors">Help Center</Link></li>
                <li><Link to="/help" className="hover:text-brand-500 transition-colors">Customer Care</Link></li>
                <li><Link to="/help" className="hover:text-brand-500 transition-colors">FAQs</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-medium">© 2026 ParkSmart Finder Suite. All rights reserved.</p>
            <div className="flex gap-6 text-sm font-medium text-slate-400">
              <Link to="/help" className="hover:text-slate-600 dark:hover:text-slate-200">Privacy Policy</Link>
              <Link to="/help" className="hover:text-slate-600 dark:hover:text-slate-200">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </motion.div>
    </>
  );
};

export default Home;

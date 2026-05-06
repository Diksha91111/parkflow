import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, ShieldCheck, MapPin, CreditCard, Navigation, Clock } from 'lucide-react';
import { X } from 'lucide-react';
import api from '../lib/api';
import { toast } from 'react-toastify';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Auth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialMode = searchParams.get('mode') === 'login' ? 'login' : 'signup';
  const initialType = searchParams.get('type') === 'admin' ? 'admin' : 'user';

  const [mode, setMode] = useState(initialMode); // 'login', 'signup', 'otp'
  const [loginType, setLoginType] = useState(initialType); // 'user' or 'admin'

  useEffect(() => {
    const newMode = searchParams.get('mode') === 'login' ? 'login' : 'signup';
    const newType = searchParams.get('type') === 'admin' ? 'admin' : 'user';
    setMode(newMode);
    setLoginType(newType);
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    // If the URL explicitly asks for admin login, do NOT auto-redirect to dashboard
    // This allows the user to see the login page as requested.
    if (loginType === 'admin') {
      return;
    }

    if (token && userStr) {
      const user = JSON.parse(userStr);
      // Only auto-redirect if the user role matches the requested login type
      // or if no specific type was requested.
      if (user.role === 'admin' && loginType === 'admin') {
        navigate('/admin-dashboard');
      } else if (user.role === 'user' && loginType === 'user') {
        navigate('/dashboard');
      }
      // If user is regular 'user' but requested 'admin' login page, stay here.
    }
  }, [navigate, loginType]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const toggleMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login';
    setMode(newMode);
    setSearchParams({ mode: newMode });
    setFormData({ ...formData, otp: '' });
    setAcceptedTerms(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      return toast.warning('You must accept the Terms & Conditions and Privacy Policy.');
    }
    if (!formData.name || !formData.email || !formData.password) {
      return toast.error("Please fill all fields");
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      toast.success(res.data.message || 'OTP sent to email');
      setMode('otp');
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('SERVER OFFLINE: Please run "node server.js" in the backend folder first!');
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log(formData.email, formData.password);

    if (formData.email.trim().toLowerCase() === 'admin@parking.com' && formData.password === 'admin123') {
      console.log('Admin Login Success');
      localStorage.setItem('role', 'admin');
      
      // Included token to satisfy fallback contexts, but navigating directly per request requirements
      localStorage.setItem('token', 'mock_admin_jwt_token_001');
      const mockAdminUser = { _id: 'admin_mock_123', name: 'Super Admin', email: 'admin@parking.com', role: 'admin' };
      localStorage.setItem('user', JSON.stringify(mockAdminUser));

      window.location.href = '/admin-dashboard';
      return; // VERY IMPORTANT
    }

    if (!formData.email || !formData.password) {
      return toast.error("Please fill all fields");
    }
    
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', {
        email: formData.email,
        password: formData.password
      });
      
      // Store token
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success('Login Successful');
      if (res.data.user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      if (error.code === 'ERR_NETWORK') {
        toast.error('SERVER OFFLINE: Please run "node server.js" in the backend folder first!');
      } else if (error.response?.data?.requiresVerification) {
        toast.info(error.response.data.message);
        setMode('otp');
      } else {
        toast.error(error.response?.data?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/verify-otp', {
        email: formData.email,
        otp: formData.otp
      });
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      toast.success('Email verified successfully! You are now logged in.');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    try {
      await api.post('/api/auth/resend-otp', { email: formData.email });
      toast.success('A new OTP has been sent to your email!');
      setResendTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!acceptedTerms) {
      return toast.warning('You must accept the Terms & Conditions to continue with Google.');
    }
    setLoading(true);
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const res = await api.post('/api/auth/google', {
        email: decoded.email,
        name: decoded.name,
        profilePicture: decoded.picture
      });

      if (res.data.requiresVerification) {
        toast.info(res.data.message);
        setFormData({ ...formData, email: decoded.email });
        setMode('otp');
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        toast.success('Google Login Successful');
        navigate(res.data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Auth Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent">
      <AnimatePresence>
        {showTerms && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              className="bg-white rounded-[2rem] p-8 max-w-lg w-full shadow-2xl relative max-h-[85vh] flex flex-col"
            >
              <button onClick={() => setShowTerms(false)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full transition-colors">
                 <X className="w-5 h-5" />
              </button>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Terms & Conditions</h3>
              <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 text-sm text-gray-600 space-y-4">
                <p><strong>1. Acceptance of Terms:</strong> By accessing and using ParkSmart Finder, you agree to be bound by these Terms and Conditions and our Privacy Policy.</p>
                <p><strong>2. User Accounts:</strong> You must provide accurate and complete information during registration. You are responsible for safeguarding your account credentials.</p>
                <p><strong>3. Use of Service:</strong> ParkSmart Finder helps you locate and book parking spots. The availability of parking spots is subject to real-time changes, and we do not guarantee spot reservations until a booking is confirmed.</p>
                <p><strong>4. Payments:</strong> Any fees associated with parking must be paid upfront. All payments are securely processed through our authorized payment partners.</p>
                <p><strong>5. Limitation of Liability:</strong> ParkSmart Finder is an intermediary platform connecting users with parking spot providers. We are not liable for any damages to vehicles, theft, or missed bookings.</p>
                <p><strong>6. Privacy:</strong> Your personal data, including GPS location data, is used solely to enhance app features, process bookings, and maintain security. We do not sell your personal data.</p>
              </div>
              <div className="pt-6 border-t border-gray-100 mt-4">
                <button 
                  onClick={() => { setAcceptedTerms(true); setShowTerms(false); }} 
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-3.5 font-bold transition-all shadow-md"
                >
                  I Agree & Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Left Panel (40%) Branding */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="hidden md:flex md:w-[40%] bg-gradient-to-br from-brand-900 via-brand-800 to-brand-600 p-8 md:p-12 flex-col justify-center relative overflow-hidden"
      >
        {/* Subtle pattern or glow effect */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white rounded-full blur-[80px] opacity-20"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-400 rounded-full blur-[80px] opacity-20"></div>

        <div className="relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">ParkSmart Finder</h1>
          <p className="text-brand-100 text-lg md:text-xl mb-12 max-w-sm">
            Find, book, and navigate to the best parking spots instantly.
          </p>

          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-inner">
                <MapPin className="w-6 h-6 text-brand-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Real-time availability</h3>
                <p className="text-brand-200 text-sm">Find empty spots near you instantly</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-inner">
                <Navigation className="w-6 h-6 text-brand-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">GPS-based detection</h3>
                <p className="text-brand-200 text-sm">Seamless navigation to your spot</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-inner">
                <CreditCard className="w-6 h-6 text-brand-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Secure online payments</h3>
                <p className="text-brand-200 text-sm">UPI, cards, and wallets supported</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl shadow-inner">
                <Clock className="w-6 h-6 text-brand-200" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Instant booking</h3>
                <p className="text-brand-200 text-sm">Reserve ahead and save time</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Mobile Branding (stacked) */}
      <div className="md:hidden w-full bg-gradient-to-br from-brand-900 to-brand-700 p-8 text-center text-white">
        <h1 className="text-3xl font-bold mb-2 tracking-tight">ParkSmart Finder</h1>
        <p className="text-brand-100 text-sm">
          Find, book, and navigate to the best parking spots instantly.
        </p>
      </div>

      {/* Right Panel (60%) Auth Form */}
      <div className="md:w-[60%] flex-1 flex items-center justify-center p-6 md:p-12 bg-gray-50 relative overflow-hidden">
        {/* Background decorations for light mode */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-brand-200 rounded-full filter blur-[100px] opacity-40 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-200 rounded-full filter blur-[100px] opacity-40 transform -translate-x-1/2 translate-y-1/2"></div>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-[420px] relative z-10"
        >
          <div className="bg-white/80 backdrop-blur-xl border border-white/60 p-8 sm:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
                {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Verify Email'}
              </h2>
              <p className="text-gray-500 font-medium">
                {mode === 'login' ? 'Enter your details to access your account' : 
                 mode === 'signup' ? 'Start your ParkSmart journey' : 
                 `We sent a 6-digit code to ${formData.email}`}
              </p>
            </div>

            {mode === 'login' && (
              <div className="flex bg-gray-100/80 p-1.5 rounded-xl mb-8 shadow-inner">
                <button 
                  type="button"
                  onClick={() => setLoginType('user')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${loginType === 'user' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  User Login
                </button>
                <button 
                  type="button"
                  onClick={() => setLoginType('admin')}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${loginType === 'admin' ? 'bg-white text-brand-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  Admin Login
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              {/* OTP VERIFICATION FORM */}
              {mode === 'otp' && (
                <motion.form 
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Enter OTP Code</label>
                    <div className="relative group">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-500 transition-colors" />
                      <input 
                        type="text" 
                        name="otp"
                        maxLength={6}
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="000000"
                        className="w-full bg-white/50 border-2 border-gray-100 text-gray-900 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all tracking-[0.5em] text-center font-mono text-xl shadow-sm"
                      />
                    </div>
                  </div>
                  
                  
                  <div className="space-y-4">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-brand-600 hover:bg-brand-700 hover:scale-[1.02] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-xl hover:shadow-brand-500/30 flex justify-center items-center h-[52px]"
                    >
                      {loading ? <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span> : 'Verify Code'}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendTimer > 0 || loading}
                      className="w-full text-brand-600 hover:text-brand-800 disabled:text-gray-400 font-semibold text-sm transition-colors py-2 flex items-center justify-center"
                    >
                      {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* LOGIN / SIGNUP FORM */}
              {mode !== 'otp' && (
                <motion.form 
                  key="auth"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={mode === 'login' ? handleLogin : handleSignup} 
                  className="space-y-5"
                >
                  <AnimatePresence>
                    {mode === 'signup' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                        animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                        exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                      >
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-600 transition-colors" />
                          <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full bg-white/60 border-2 border-gray-100 text-gray-900 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-600 transition-colors" />
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full bg-white/60 border-2 border-gray-100 text-gray-900 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-brand-600 transition-colors" />
                      <input 
                        type="password" 
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className="w-full bg-white/60 border-2 border-gray-100 text-gray-900 rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-4 focus:ring-brand-500/20 focus:border-brand-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                  {(mode === 'signup' || mode === 'login') && (
                    <div className="flex items-start gap-3 py-1">
                      <div className="flex items-center h-5 mt-0.5">
                        <input
                          id="terms"
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="w-5 h-5 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 focus:ring-2 cursor-pointer"
                        />
                      </div>
                      <label htmlFor="terms" className="text-sm text-gray-500 font-medium leading-tight">
                        I agree to the{' '}
                        <button type="button" onClick={() => setShowTerms(true)} className="text-brand-600 hover:underline focus:outline-none">Terms & Conditions</button>
                        {' '}and Privacy Policy
                      </label>
                    </div>
                  )}

                  <div className="pt-3">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-brand-600 hover:bg-brand-700 hover:scale-[1.02] text-white font-bold py-3.5 rounded-2xl transition-all shadow-md hover:shadow-xl hover:shadow-brand-500/30 flex justify-center items-center gap-2 h-[52px]"
                    >
                      {loading ? (
                        <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                      ) : (
                        <>
                          {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center my-6">
                    <div className="flex-1 border-t border-gray-200"></div>
                    <span className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">OR</span>
                    <div className="flex-1 border-t border-gray-200"></div>
                  </div>

                  <div className="flex justify-center w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error('Google Sign-In failed')}
                      useOneTap={false}
                      locale="en"
                      shape="pill"
                      width="340px"
                      theme="outline"
                      text="continue_with"
                    />
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {mode !== 'otp' && (
              <div className="mt-8 text-center">
                <p className="text-gray-600 font-medium">
                  {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
                  <button 
                    type="button"
                    onClick={toggleMode}
                    className="text-brand-600 hover:text-brand-700 font-bold transition-colors"
                  >
                    {mode === 'login' ? 'Sign up' : 'Log in'}
                  </button>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;

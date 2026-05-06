import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import BookingHistory from './pages/BookingHistory';
import AIAssistant from './pages/AIAssistant';
import HelpSupport from './pages/HelpSupport';

// Secure Route Wrapper
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  if (!token) {
    return <Navigate to="/auth?mode=login&type=user" replace />;
  }

  // If an admin tries to access user dashboard, let them (optional, but usually fine)
  // Or redirect them to admin-dashboard if you want strict separation
  if (user?.role === 'admin' && window.location.pathname === '/dashboard') {
    // return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

// Admin Route Wrapper
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  
  if (!token) {
    return <Navigate to="/auth?mode=login&type=admin" replace />;
  }
  
  if (user?.role !== 'admin') {
    // If a normal user tries to access admin routes, send them back to login (admin section)
    // as per "Always redirect to the Login page" when someone clicks Admin Console
    return <Navigate to="/auth?mode=login&type=admin" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300 relative">
      {/* Blurred Background Image */}
      <div className="page-background"></div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen bg-transparent">
        <Routes>
        {/* Landing Page */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Page handling its own redirects */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/booking-history" element={<ProtectedRoute><BookingHistory /></ProtectedRoute>} />
        <Route path="/help" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/ai-assistant" element={<ProtectedRoute><AIAssistant /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default App;

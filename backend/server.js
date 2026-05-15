require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const revenueRoutes = require('./routes/revenueRoutes');
const aiRoutes = require('./routes/aiRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log(`MongoDB Connected: ${mongoose.connection.host}`))
  .catch(err => console.log('MongoDB Connection Error:', err));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();
const server = http.createServer(app);

// Frontend URL
const FRONTEND_URL = "https://parkflow-j7r784lpp-drsuryawanshi911-1688s-projects.vercel.app";

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log('New client connected to Live Map updates:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Expose io to routes internally
app.set('io', io);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/prediction', predictionRoutes);
app.use('/api/revenue', revenueRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health Check Route
app.get('/', (req, res) => {
  res.send('Smart Parking Finder API is running...');
});

// AI Ping Route
app.get('/api/ai/ping', (req, res) => {
  res.json({
    success: true,
    message: 'AI Backend is reachable'
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('CRITICAL SERVER ERROR:', err);

  const errorMessage = err.message || 'Internal Server Error';

  res.status(err.status || 500).json({
    success: false,
    message: errorMessage,
    debug_info: {
      message: errorMessage,
      stack: process.env.NODE_ENV === 'development'
        ? err.stack
        : undefined,
      path: req.path,
      method: req.method
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSockets enabled`);
});
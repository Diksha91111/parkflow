const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ParkingSlot = require('../models/ParkingSlot');
const Feedback = require('../models/Feedback');
const Slot = require('../models/Slot');
const { createParkingSpot, updateParkingSpot, deleteParkingSpot, getAllParkingSpots, addParkingSlot } = require('../controllers/adminParkingController');
const { getDailyBookings, getRevenue, getPeakHours, getTopSpots, getStatusBreakdown } = require('../controllers/analyticsController');

const { uploadCloudinary } = require('../config/cloudinary');

const router = express.Router();

// @desc    Get dashboard metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
router.get('/metrics', protect, adminOnly, async (req, res) => {
  try {
    const registeredUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    
    // Calculate Total Revenue from Completed bookings
    const completedBookings = await Booking.find({ payment_status: 'Completed' });
    const revenue = completedBookings.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);

    // Active slots are total available slots in the system
    const slotsAggregation = await ParkingSlot.aggregate([
      { $group: { _id: null, totalAvailable: { $sum: '$availableSlots' } } }
    ]);
    const activeSlots = slotsAggregation.length > 0 ? slotsAggregation[0].totalAvailable : 0;
    
    // Today's Bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaysBookings = await Booking.countDocuments({ createdAt: { $gte: today } });

    // Average Rating
    const ratingAggregation = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = ratingAggregation.length > 0 ? ratingAggregation[0].avgRating : 0;

    res.status(200).json({
      success: true,
      data: {
        registeredUsers,
        totalBookings,
        revenue,
        activeSlots,
        todaysBookings,
        avgRating,
      }
    });
  } catch (error) {
    console.error('Admin Metrics Error', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Update user status (ban/unban)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
router.put('/users/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { isBanned } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.isBanned = isBanned;
    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
router.get('/bookings', protect, adminOnly, async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate('userId', 'name email')
      .populate('parkingSlotId', 'name location')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
router.put('/bookings/:id', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['upcoming', 'active', 'completed', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const oldStatus = booking.booking_status;
    booking.booking_status = status;
    await booking.save();

    // Restore slot availability if booking is cancelled/completed and was previously active
    if ((status === 'cancelled' || status === 'completed') && (oldStatus === 'upcoming' || oldStatus === 'active')) {
      if (booking.parkingSlotId) {
        await ParkingSlot.findByIdAndUpdate(booking.parkingSlotId, { $inc: { availableSlots: 1 } });
      }
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    console.error('Update Booking Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Delete a booking
// @route   DELETE /api/admin/bookings/:id
// @access  Private/Admin
router.delete('/bookings/:id', protect, adminOnly, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Restore slot if booking was active
    if ((booking.booking_status === 'upcoming' || booking.booking_status === 'active') && booking.parkingSlotId) {
      await ParkingSlot.findByIdAndUpdate(booking.parkingSlotId, { $inc: { availableSlots: 1 } });
    }

    await Booking.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Booking deleted' });
  } catch (error) {
    console.error('Delete Booking Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Parking Spot Management
router.get('/parking', protect, adminOnly, getAllParkingSpots);

// Middleware to handle image upload errors specifically
const handleUpload = (req, res, next) => {
  console.log("--- START UPLOAD MIDDLEWARE ---");
  console.log("Path:", req.path, "Method:", req.method);
  console.log("Content-Type:", req.headers['content-type']);
  
  // Check if request has file upload (multipart/form-data)
  const contentType = req.headers['content-type'] || '';
  const isMultipart = contentType.includes('multipart/form-data');
  
  if (!isMultipart) {
    console.log("No multipart form data detected, skipping file upload");
    return next();
  }
  
  try {
    uploadCloudinary.single('image')(req, res, (err) => {
      if (err) {
        console.error("MULTER ERROR (CALLBACK):", err);
        // Don't fail the request if image upload fails, just continue without image
        console.log("Continuing without image upload due to error");
      } else {
        console.log("Multer success. File info:", req.file ? req.file.path : "None");
      }
      next();
    });
  } catch (err) {
    console.error("MULTER SYNC ERROR (TRY-CATCH):", err);
    // Continue without image on error
    next();
  }
};

router.post('/parking', protect, adminOnly, handleUpload, createParkingSpot);
router.post("/add-slot", protect, adminOnly, handleUpload, addParkingSlot);
router.put('/parking/:id', protect, adminOnly, handleUpload, updateParkingSpot);
router.delete('/parking/:id', protect, adminOnly, deleteParkingSpot);

// Analytics
router.get('/analytics/daily-bookings', protect, adminOnly, getDailyBookings);
router.get('/analytics/revenue', protect, adminOnly, getRevenue);
router.get('/analytics/peak-hours', protect, adminOnly, getPeakHours);
router.get('/analytics/top-spots', protect, adminOnly, getTopSpots);
router.get('/analytics/status-breakdown', protect, adminOnly, getStatusBreakdown);

// Feedback
router.get('/feedback', protect, adminOnly, async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
    
    // Spot averages
    const spotAverages = await Feedback.aggregate([
      { $group: { _id: '$parkingSpotId', avgRating: { $avg: '$rating' }, spotName: { $first: '$spotName' }, count: { $sum: 1 } } }
    ]);

    res.status(200).json({ success: true, count: feedbacks.length, data: feedbacks, spotAverages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Delete feedback
// @route   DELETE /api/admin/feedback/:id
// @access  Private/Admin
router.delete('/feedback/:id', protect, adminOnly, async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    await Feedback.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete Feedback Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
